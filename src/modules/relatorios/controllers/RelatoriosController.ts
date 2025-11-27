import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: string;
    estabelecimentoId: string | null;
    estabelecimento?: { 
        id: string; 
        nome: string; 
    } | null;
}

// Função auxiliar para buscar valores unitários
async function buscarValoresUnitarios(dispensacoes: any[]): Promise<{ [key: string]: number }> {
    try {
        const medicamentoIds = [...new Set(
            dispensacoes.flatMap(d =>
                d.itensDispensados.map((item: any) => item.medicamento.id)
            )
        )];

        if (medicamentoIds.length === 0) return {};

        const movimentos = await prisma.itemMovimento.findMany({
            where: {
                medicamentoId: { in: medicamentoIds },
                movimento: { tipoMovimentacao: 'ENTRADA' },
                valorUnitario: { gt: 0 }
            },
            select: {
                medicamentoId: true,
                valorUnitario: true,
            },
            orderBy: { movimento: { dataDocumento: 'desc' } }
        });

        const valores: { [key: string]: number } = {};
        movimentos.forEach(mov => {
            if (!valores[mov.medicamentoId]) {
                valores[mov.medicamentoId] = mov.valorUnitario;
            }
        });

        return valores;

    } catch {
        return {};
    }
}

// Função para corrigir datas para UTC
function corrigirDataParaUTC(dataString: string, fimDoDia: boolean = false): Date {
    const data = new Date(dataString);

    if (fimDoDia) {
        data.setUTCHours(23, 59, 59, 999);
    } else {
        data.setUTCHours(0, 0, 0, 0);
    }

    return data;
}

export class RelatoriosController {

    async getPosicaoEstoque(request: Request, response: Response) {
        try {
            const { estabelecimento } = request.query;
            const user = (request as any).user as AuthenticatedUser;
            const userEstabelecimento = user?.estabelecimentoId;
            const estabelecimentoFiltro = userEstabelecimento ? userEstabelecimento : estabelecimento;

            const lotesEstoque = await prisma.estoqueLote.findMany({
                where: {
                    quantidade: { gt: 0 },
                    ...(estabelecimentoFiltro && {
                        estabelecimento: {
                            OR: [
                                { id: estabelecimentoFiltro as string },
                                { nome: estabelecimentoFiltro as string }
                            ]
                        }
                    })
                },
                include: {
                    medicamento: {
                        select: {
                            id: true,
                            principioAtivo: true,
                            concentracao: true,
                            formaFarmaceutica: true,
                            estoqueMinimo: true,
                            psicotropico: true
                        }
                    },
                    estabelecimento: {
                        select: {
                            id: true,
                            nome: true,
                            cnes: true,
                            tipo: true
                        }
                    }
                },
                orderBy: [
                    { medicamento: { principioAtivo: 'asc' } },
                    { numeroLote: 'asc' },
                    { dataValidade: 'asc' }
                ]
            });

            const medicamentoIds = lotesEstoque.map(lote => lote.medicamentoId);

            const localizacoesLotes = await prisma.itemMovimento.findMany({
                where: {
                    medicamentoId: { in: medicamentoIds },
                    numeroLote: { in: lotesEstoque.map(lote => lote.numeroLote) }
                },
                select: {
                    medicamentoId: true,
                    numeroLote: true,
                    localizacaoFisica: true
                },
                distinct: ['medicamentoId', 'numeroLote']
            });

            const dadosRelatorio = lotesEstoque.map(lote => {
                const localizacaoLote = localizacoesLotes.find(
                    loc => loc.medicamentoId === lote.medicamentoId && loc.numeroLote === lote.numeroLote
                );

                return {
                    id: lote.id,
                    numeroLote: lote.numeroLote,
                    dataValidade: lote.dataValidade,
                    quantidade: lote.quantidade,
                    valorUnitario: lote.valorUnitario.toNumber(),
                    localizacao: localizacaoLote?.localizacaoFisica || 'Não informada',
                    medicamento: {
                        id: lote.medicamento.id,
                        principioAtivo: lote.medicamento.principioAtivo,
                        concentracao: lote.medicamento.concentracao,
                        formaFarmaceutica: lote.medicamento.formaFarmaceutica,
                        estoqueMinimo: lote.medicamento.estoqueMinimo,
                        psicotropico: lote.medicamento.psicotropico
                    },
                    estabelecimento: {
                        id: lote.estabelecimento.id,
                        nome: lote.estabelecimento.nome,
                        tipo: lote.estabelecimento.tipo,
                        cnes: lote.estabelecimento.cnes
                    }
                };
            });

            response.json(dadosRelatorio);

        } catch (error: unknown) {
            return response.status(500).json({
                error: 'Erro interno do servidor ao gerar relatório',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async getEstabelecimentos(request: Request, response: Response) {
        try {
            const estabelecimentos = await prisma.estabelecimento.findMany({
                select: { id: true, nome: true, tipo: true },
                orderBy: { nome: 'asc' }
            });

            response.json(estabelecimentos.map(est => est.nome));

        } catch (error: unknown) {
            response.status(500).json({
                error: 'Erro ao buscar estabelecimentos',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async getDispensacoes(request: Request, response: Response) {
        try {
            const { dataInicio, dataFim, estabelecimento, paciente } = request.query;
            const where: any = {};

            if (dataInicio && dataFim) {
                const dataInicioUTC = corrigirDataParaUTC(dataInicio as string);
                const dataFimUTC = corrigirDataParaUTC(dataFim as string, true);

                where.dataDispensacao = {
                    gte: dataInicioUTC,
                    lte: dataFimUTC
                };
            }

            if (estabelecimento) {
                where.estabelecimentoOrigem = { nome: estabelecimento as string };
            }

            if (paciente) {
                where.OR = [
                    { pacienteNome: { contains: paciente as string, mode: 'insensitive' } },
                    { pacienteCpf: { contains: paciente as string } }
                ];
            }

            const dispensacoes = await prisma.dispensacao.findMany({
                where,
                include: {
                    estabelecimentoOrigem: { select: { nome: true } },
                    itensDispensados: {
                        include: {
                            medicamento: {
                                select: {
                                    id: true,
                                    principioAtivo: true,
                                    concentracao: true,
                                    formaFarmaceutica: true
                                }
                            }
                        }
                    },
                    profissionalSaude: { select: { nome: true, crm: true } }
                },
                orderBy: { dataDispensacao: 'desc' }
            });

            const valoresUnitarios = await buscarValoresUnitarios(dispensacoes);
            const dadosRelatorio: any[] = [];

            dispensacoes.forEach(dispensacao => {
                dispensacao.itensDispensados.forEach(item => {
                    const valorUnitario = valoresUnitarios[item.medicamento.id] || 0;
                    const profissionalNome = dispensacao.profissionalSaude?.nome ||
                        dispensacao.profissionalSaudeNome || 'N/A';

                    dadosRelatorio.push({
                        id: `${dispensacao.id}-${item.id}`,
                        dataDispensacao: dispensacao.dataDispensacao.toISOString(),
                        medicamento: {
                            principioAtivo: item.medicamento.principioAtivo,
                            concentracao: item.medicamento.concentracao,
                            formaFarmaceutica: item.medicamento.formaFarmaceutica
                        },
                        pacienteId: dispensacao.id,
                        pacienteNome: dispensacao.pacienteNome,
                        pacienteCpf: dispensacao.pacienteCpf || undefined,
                        estabelecimentoNome: dispensacao.estabelecimentoOrigem.nome,
                        profissionalNome: profissionalNome,
                        quantidade: item.quantidadeSaida,
                        valorUnitario: valorUnitario,
                        valorTotal: item.quantidadeSaida * valorUnitario,
                        loteNumero: item.loteNumero,
                        documentoReferencia: dispensacao.documentoReferencia
                    });
                });
            });

            response.json(dadosRelatorio);

        } catch (error: any) {
            response.status(500).json({
                error: 'Erro ao gerar relatório de dispensações',
                details: error.message
            });
        }
    }
}
