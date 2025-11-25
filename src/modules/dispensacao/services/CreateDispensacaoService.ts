import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateDispensacaoDTO } from '../dtos/ICreateDispensacaoDTO';

class CreateDispensacaoService {

  // ✅ FUNÇÃO PARA DETECTAR TIPO PELO PADRÃO DO DOCUMENTO
  private detectarTipoDocumento(documentoReferencia: string): 'COMUM' | 'PSICOTROPICO' {
    if (!documentoReferencia) return 'COMUM';

    const regexSimples = /^\d{1,8}$|^[A-Z]{1,4}-\d{1,8}$/;

    if (regexSimples.test(documentoReferencia)) {
      return 'PSICOTROPICO';
    }

    return 'COMUM';
  }

  // ✅ FUNÇÃO PARA GERAR NÚMERO AUTOMÁTICO (para documentos comuns)
  private async gerarNumeroDocumentoUnico(tx: any, estabelecimentoId: string): Promise<string> {
    const estabelecimento = await tx.estabelecimento.findUnique({
      where: { id: estabelecimentoId },
      select: { sigla: true, nome: true }
    });

    const prefixo = estabelecimento?.sigla || 'DISP';
    const maxTentativas = 5;
    let tentativas = 0;

    while (tentativas < maxTentativas) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const numeroDocumento = `${prefixo}-${timestamp}-${random}`;

      const documentoExistente = await tx.dispensacao.findFirst({
        where: { documentoReferencia: numeroDocumento }
      });

      if (!documentoExistente) {
        console.log(`✅ Número automático gerado: ${numeroDocumento}`);
        return numeroDocumento;
      }

      tentativas++;
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new AppError('Não foi possível gerar um número de documento único.', 500);
  }

  // ✅ FUNÇÃO DE VALIDAÇÃO SIMPLIFICADA
  private validarDocumentoPsicotropico(documentoReferencia: string): void {
    const regexSimples = /^\d{1,8}$|^[A-Z]{1,4}-\d{1,8}$/;

    if (!regexSimples.test(documentoReferencia)) {
      throw new AppError(
        'Para medicamentos controlados, informe apenas o número da receita (ex: 12345678 ou RF-123456)',
        400
      );
    }
  }

  async execute(data: ICreateDispensacaoDTO) {
    const { estabelecimentoOrigemId, itens, ...dispensacaoData } = data;

    // 1. Validação do Estabelecimento
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoOrigemId }
    });

    if (!estabelecimento) {
      throw new AppError('Estabelecimento de origem não encontrado.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      try {
        console.log('🟡 Iniciando transação de dispensação...');

        // ✅ VALIDAÇÃO E GERAÇÃO DO DOCUMENTO DE REFERÊNCIA
        let documentoReferenciaFinal = dispensacaoData.documentoReferencia;
        const tipoDetectado = this.detectarTipoDocumento(documentoReferenciaFinal);

        if (tipoDetectado === 'COMUM') {
          if (!documentoReferenciaFinal || documentoReferenciaFinal.trim() === '') {
            documentoReferenciaFinal = await this.gerarNumeroDocumentoUnico(tx, estabelecimentoOrigemId);
            console.log(`✅ Número automático gerado: ${documentoReferenciaFinal}`);
          } else {
            console.log(`📄 Usando número fornecido: ${documentoReferenciaFinal}`);
          }
        } else if (tipoDetectado === 'PSICOTROPICO') {
          this.validarDocumentoPsicotropico(documentoReferenciaFinal);
          console.log(`✅ Receita de psicotrópico validada: ${documentoReferenciaFinal}`);

          // ✅ VERIFICA SE JÁ EXISTE DISPENSAÇÃO COM ESTA RECEITA
          const receitaExistente = await tx.dispensacao.findFirst({
            where: {
              documentoReferencia: documentoReferenciaFinal,
              estabelecimentoOrigemId: estabelecimentoOrigemId
            }
          });

          if (receitaExistente) {
            throw new AppError(
              `Já existe uma dispensação com o número de receita ${documentoReferenciaFinal}. Cada receita de psicotrópico só pode ser utilizada uma vez.`,
              400
            );
          }
        }

        // ✅ VERIFICA SE O NÚMERO JÁ EXISTE (DUPLICIDADE GERAL)
        if (documentoReferenciaFinal) {
          const documentoExistente = await tx.dispensacao.findFirst({
            where: { documentoReferencia: documentoReferenciaFinal }
          });

          if (documentoExistente) {
            throw new AppError(
              `Já existe uma dispensação com o número ${documentoReferenciaFinal}. Por favor, use um número diferente.`,
              400
            );
          }
        }

        // ✅ PREPARA OS DADOS DA DISPENSAÇÃO
        const dadosDispensacao: any = {
          pacienteNome: dispensacaoData.pacienteNome,
          pacienteCpf: dispensacaoData.pacienteCpf || null,
          documentoReferencia: documentoReferenciaFinal,
          observacao: dispensacaoData.observacao || null,
          estabelecimentoOrigemId,
          dataDispensacao: new Date(),
          justificativaRetiradaAntecipada: dispensacaoData.justificativaRetiradaAntecipada || null,
          usuarioAutorizador: dispensacaoData.usuarioAutorizador || null,
          dataAutorizacao: dispensacaoData.justificativaRetiradaAntecipada ? new Date() : null,
          profissionalSaudeNome: dispensacaoData.profissionalSaudeNome || null,
        };

        // ✅ CORREÇÃO: Use profissionalSaudeId diretamente
        if (dispensacaoData.profissionalSaudeId) {
          dadosDispensacao.profissionalSaudeId = dispensacaoData.profissionalSaudeId;
        }

        // 2. Cria o cabeçalho da Dispensação
        const novaDispensacao = await tx.dispensacao.create({
          data: dadosDispensacao,
        });

        console.log(`✅ Dispensação criada: ${novaDispensacao.id} - ${documentoReferenciaFinal}`);

        // 3. Processa cada Item
        for (const item of itens) {
          const { medicamentoId, quantidadeSaida, lotes } = item;
          const quantidadeSaidaNumerica = Number(quantidadeSaida);

          // Validações
          if (isNaN(quantidadeSaidaNumerica) || quantidadeSaidaNumerica <= 0) {
            throw new AppError('Quantidade de saída inválida.', 400);
          }

          console.log('🎯 Processando item:', {
            medicamentoId,
            quantidade: quantidadeSaidaNumerica,
            lotesSelecionados: lotes?.length || 0,
            lotes: lotes
          });

          // Verifica estoque geral
          const estoqueGeral = await tx.estoqueLocal.findUnique({
            where: {
              medicamentoId_estabelecimentoId: {
                medicamentoId,
                estabelecimentoId: estabelecimentoOrigemId
              },
            },
          });

          if (!estoqueGeral || estoqueGeral.quantidade < quantidadeSaidaNumerica) {
            const medicamento = await tx.medicamento.findUnique({
              where: { id: medicamentoId }
            });
            throw new AppError(
              `Estoque insuficiente de ${medicamento?.principioAtivo}. Saldo: ${estoqueGeral?.quantidade ?? 0}.`,
              400
            );
          }

          let quantidadeRestante = quantidadeSaidaNumerica;

          // ✅ SE HÁ LOTES SELECIONADOS MANUALMENTE
          if (lotes && lotes.length > 0) {
            console.log('🎯 USANDO LOTES SELECIONADOS MANUALMENTE');

            for (const loteSelecionado of lotes) {
              if (quantidadeRestante <= 0) break;

              console.log('🔍 Processando lote selecionado:', {
                loteId: loteSelecionado.loteId,
                numeroLote: loteSelecionado.loteId,
                quantidade: loteSelecionado.quantidade
              });

              // Verifica se o lote existe
              const loteEstoque = await tx.estoqueLote.findUnique({
                where: { id: loteSelecionado.loteId }
              });

              if (!loteEstoque) {
                throw new AppError(`Lote ${loteSelecionado.loteId} não encontrado`, 400);
              }

              // Verifica se tem estoque suficiente
              if (loteEstoque.quantidade < loteSelecionado.quantidade) {
                throw new AppError(
                  `Quantidade insuficiente no lote ${loteSelecionado.loteId}. Disponível: ${loteEstoque.quantidade}, Solicitado: ${loteSelecionado.quantidade}`,
                  400
                );
              }

              // Verifica se o lote pertence ao medicamento correto
              if (loteEstoque.medicamentoId !== medicamentoId) {
                throw new AppError(`Lote ${loteSelecionado.loteId} não pertence ao medicamento correto`, 400);
              }

              // ✅ BAIXA DO LOTE ESPECÍFICO
              console.log(`⬇️ Baixando ${loteSelecionado.quantidade} unidades do lote ${loteSelecionado.loteId} (ID: ${loteSelecionado.loteId})`);
              
              await tx.estoqueLote.update({
                where: { id: loteSelecionado.loteId },
                data: {
                  quantidade: {
                    decrement: loteSelecionado.quantidade
                  }
                }
              });

              // Cria item da dispensação para este lote específico
              await tx.itemDispensacao.create({
                data: {
                  quantidadeSaida: loteSelecionado.quantidade,
                  loteNumero: loteSelecionado.loteId,
                  medicamentoId: medicamentoId,
                  dispensacaoId: novaDispensacao.id,
                }
              });

              quantidadeRestante -= loteSelecionado.quantidade;
              console.log(`✅ Lote ${loteSelecionado.loteId} processado: ${loteSelecionado.quantidade} unidades`);
            }

          } else {
            // ✅ SE NÃO HÁ LOTES SELECIONADOS, USA FIFO AUTOMÁTICO
            console.log('🔄 NENHUM LOTE SELECIONADO - USANDO FIFO AUTOMÁTICO');

            const lotesDisponiveis = await tx.estoqueLote.findMany({
              where: {
                medicamentoId,
                estabelecimentoId: estabelecimentoOrigemId,
                quantidade: { gt: 0 },
              },
              orderBy: { dataValidade: 'asc' }
            });

            if (lotesDisponiveis.length === 0) {
              throw new AppError(`Nenhum lote disponível para o medicamento selecionado.`, 400);
            }

            // Baixa de estoque por lote (FIFO)
            for (const lote of lotesDisponiveis) {
              if (quantidadeRestante === 0) break;

              const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);

              console.log(`⬇️ Baixando ${quantidadeBaixar} unidades do lote ${lote.numeroLote}`);

              // Atualiza lote
              await tx.estoqueLote.update({
                where: { id: lote.id },
                data: { quantidade: { decrement: quantidadeBaixar } }
              });

              // Cria item da dispensação
              await tx.itemDispensacao.create({
                data: {
                  quantidadeSaida: quantidadeBaixar,
                  loteNumero: lote.numeroLote,
                  medicamentoId: medicamentoId,
                  dispensacaoId: novaDispensacao.id,
                }
              });

              quantidadeRestante -= quantidadeBaixar;
            }
          }

          if (quantidadeRestante > 0) {
            throw new AppError(`Não foi possível baixar toda a quantidade. Faltaram ${quantidadeRestante} unidades.`, 400);
          }

          // Atualiza estoque geral
          await tx.estoqueLocal.update({
            where: { id: estoqueGeral.id },
            data: { quantidade: { decrement: quantidadeSaidaNumerica } },
          });

          console.log(`✅ Medicamento ${medicamentoId} processado com sucesso`);
        }

        console.log('🎉 Dispensação finalizada com sucesso!');

        // Retorna dispensação completa
        return tx.dispensacao.findUnique({
          where: { id: novaDispensacao.id },
          include: {
            profissionalSaude: true,
            itensDispensados: {
              include: {
                medicamento: {
                  select: {
                    principioAtivo: true,
                    concentracao: true,
                    formaFarmaceutica: true
                  }
                }
              }
            },
            estabelecimentoOrigem: {
              select: {
                nome: true
              }
            }
          }
        });

      } catch (error: any) {
        console.error('🔴 ERRO DETALHADO NA TRANSAÇÃO:', {
          message: error.message,
          code: error.code,
          meta: error.meta,
          stack: error.stack
        });

        throw error;
      }
    });
  }
}

export { CreateDispensacaoService };