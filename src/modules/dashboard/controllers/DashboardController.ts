import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// ✅ CORREÇÃO: Crie UMA instância do PrismaClient e reuse
const prisma = new PrismaClient();

// Interface para os alertas de estoque
interface AlertaEstoque {
    id: string;
    medicamento: string;
    quantidade: number;
    estoqueMinimo: number;
    tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO';
}

class DashboardController {
    async getMetrics(request: Request, response: Response) {
        try {
            // 1. Definição das datas
            const now = new Date();
            
            const startOfDay = new Date(Date.UTC(
                now.getFullYear(), 
                now.getMonth(), 
                now.getDate(), 
                0, 0, 0, 0
            ));

            const endOfDay = new Date(Date.UTC(
                now.getFullYear(), 
                now.getMonth(), 
                now.getDate(), 
                23, 59, 59, 999
            ));

            // 2. Total de medicamentos (Geral)
            const totalMedicamentos = await prisma.medicamento.count();

            // 3. Entradas de hoje
            const entradasHoje = await prisma.movimento.count({
                where: {
                    OR: [
                        { tipoMovimentacao: 'ENTRADA' },
                        { tipoMovimentacao: 'Entrada Ordinária' },
                        { tipoMovimentacao: 'DOAÇÃO' }
                    ],
                    dataDocumento: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            // 4. Saídas de hoje
            const saidasHoje = await prisma.movimento.count({
                where: {
                    OR: [
                        { tipoMovimentacao: 'SAIDA' },
                        { tipoMovimentacao: 'PERDA' },
                        { tipoMovimentacao: 'TRANSFERENCIA' }
                    ],
                    dataDocumento: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            // 5. Dispensações de hoje
            let dispensacoesHoje = 0;
            try {
                dispensacoesHoje = await prisma.dispensacao.count({
                    where: {
                        createdAt: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    }
                });
            } catch {
                dispensacoesHoje = 0;
            }

            // 6. Alertas de Estoque
            let alertasEstoque: AlertaEstoque[] = [];
            try {
                const medicamentosComEstoqueBaixo = await prisma.medicamento.findMany({
                    where: {
                        OR: [
                            { quantidadeEstoque: { lt: prisma.medicamento.fields.estoqueMinimo } },
                            { quantidadeEstoque: { equals: 0 } }
                        ]
                    },
                    select: {
                        id: true,
                        principioAtivo: true,
                        concentracao: true,
                        formaFarmaceutica: true,
                        quantidadeEstoque: true,
                        estoqueMinimo: true
                    }
                });

                alertasEstoque = medicamentosComEstoqueBaixo.map(med => {
                    let tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO';
                    
                    if (med.quantidadeEstoque === 0) {
                        tipo = 'CRITICO';
                    } else if (med.quantidadeEstoque <= (Number(med.estoqueMinimo) * 0.2)) {
                        tipo = 'CRITICO';
                    } else if (med.quantidadeEstoque <= (Number(med.estoqueMinimo) * 0.5)) {
                        tipo = 'ALERTA';
                    } else {
                        tipo = 'ATENCAO';
                    }

                    return {
                        id: med.id,
                        medicamento: `${med.principioAtivo} - ${med.concentracao}`,
                        quantidade: med.quantidadeEstoque,
                        estoqueMinimo: med.estoqueMinimo,
                        tipo
                    };
                });
            } catch {
                alertasEstoque = [];
            }

            // 7. Montagem e Envio da Resposta
            const metrics = {
                totalMedicamentos,
                entradasHoje,
                saidasHoje,
                dispensacoesHoje,
                alertasEstoque
            };

            return response.json(metrics);

        } catch (error: any) {
            return response.status(500).json({
                error: 'Erro ao buscar métricas',
                details: error.message
            });
        }
    }
}

export { DashboardController };
