import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FiltroLivroDTO {
  tipoLista: string;
  dataInicio: Date;
  dataFim: Date;
  estabelecimentoId?: string;
  medicamentoId?: string;
}

interface MovimentoLivro {
  data: Date;
  tipo: string;
  docNumero: string;
  origemDestino: string;
  prescritor: string;
  qtdEntrada: number;
  qtdSaida: number;
  qtdPerda: number;
  saldo: number;
}

interface ItemRelatorio {
  medicamento: {
    id: string;
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
    quantidadeEstoque: number;
    tipoLista: string;
  };
  movimentacoes: MovimentoLivro[];
}

export class LivrosControladosService {
  
  async gerarLivro(filtro: FiltroLivroDTO) {
    // WHERE condition dinâmico
    const whereCondition: any = {
      categoriaControlada: {
        tipo: filtro.tipoLista
      }
    };

    // Se filtrar por medicamento específico
    if (filtro.medicamentoId) {
      whereCondition.id = filtro.medicamentoId;
    }

    const medicamentos = await prisma.medicamento.findMany({
      where: whereCondition,
      select: {
        id: true,
        principioAtivo: true,
        concentracao: true,
        formaFarmaceutica: true,
        quantidadeEstoque: true,
        categoriaControlada: {
          select: {
            tipo: true
          }
        }
      }
    });

    const relatorioFinal: ItemRelatorio[] = [];

    for (const med of medicamentos) {
      // **CRUCIAL: Buscar saldo inicial (antes da data início)**
      const saldoInicial = await this.calcularSaldoInicial(med.id, filtro.dataInicio);
      
      let saldoAtual = saldoInicial;

      // Buscar MOVIMENTOS (Entradas, Saídas, Perdas)
      const movimentos = await prisma.itemMovimento.findMany({
        where: {
          medicamentoId: med.id,
          movimento: {
            dataDocumento: { 
              gte: filtro.dataInicio, 
              lte: filtro.dataFim 
            }
          }
        },
        include: {
          movimento: { 
            include: { 
              fornecedor: true
            } 
          }
        },
        orderBy: {
          movimento: {
            dataDocumento: 'asc'
          }
        }
      });

      // Buscar DISPENSAÇÕES (Saídas para pacientes)
      const dispensacoes = await prisma.itemDispensacao.findMany({
        where: {
          medicamentoId: med.id,
          dispensacao: {
            dataDispensacao: { 
              gte: filtro.dataInicio, 
              lte: filtro.dataFim 
            }
          }
        },
        include: {
          dispensacao: { 
            include: { 
              profissionalSaude: true 
            } 
          }
        },
        orderBy: {
          dispensacao: {
            dataDispensacao: 'asc'
          }
        }
      });

      // Array explícito com tipo MovimentoLivro
      const movimentosProcessados: MovimentoLivro[] = movimentos.map(mov => {
        // No seu schema, tipoMovimentacao é String direto
        const tipoMov = mov.movimento.tipoMovimentacao.toUpperCase();
        const isEntrada = tipoMov.includes('ENTRADA') || tipoMov.includes('COMPRA');
        const isPerda = tipoMov.includes('PERDA') || tipoMov.includes('AVARIA') || tipoMov.includes('VENCIMENTO');
        
        const qtdEntrada = isEntrada ? mov.quantidade : 0;
        const qtdSaida = (!isEntrada && !isPerda) ? mov.quantidade : 0;
        const qtdPerda = isPerda ? mov.quantidade : 0;

        // Atualizar saldo
        saldoAtual += qtdEntrada - qtdSaida - qtdPerda;

        return {
          data: mov.movimento.dataDocumento,
          tipo: mov.movimento.tipoMovimentacao,
          docNumero: mov.movimento.numeroDocumento || 'S/N',
          origemDestino: isEntrada 
            ? mov.movimento.fornecedor?.nome || 'Fornecedor Não Informado'
            : 'Ajuste Interno',
          prescritor: '-',
          qtdEntrada,
          qtdSaida,
          qtdPerda,
          saldo: saldoAtual
        };
      });

      // Array explícito com tipo MovimentoLivro
      const dispensacoesProcessadas: MovimentoLivro[] = dispensacoes.map(disp => {
        const qtdSaida = disp.quantidadeSaida;
        
        // Atualizar saldo
        saldoAtual -= qtdSaida;

        return {
          data: disp.dispensacao.dataDispensacao,
          tipo: 'DISPENSAÇÃO',
          docNumero: `Rec: ${disp.dispensacao.documentoReferencia || 'S/N'}`,
          origemDestino: disp.dispensacao.pacienteNome || 'Paciente Não Informado',
          prescritor: this.formatarPrescritor(
            disp.dispensacao.profissionalSaude, 
            disp.dispensacao.profissionalSaudeNome || undefined
          ),
          qtdEntrada: 0,
          qtdSaida,
          qtdPerda: 0,
          saldo: saldoAtual
        };
      });

      // Combinar e ordenar TODOS os eventos por data
      const todosEventos: MovimentoLivro[] = [...movimentosProcessados, ...dispensacoesProcessadas]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      // Adicionar linha de SALDO INICIAL se houver movimentações
      const movimentacoesComSaldoInicial: MovimentoLivro[] = [];
      
      if (saldoInicial > 0 || todosEventos.length > 0) {
        movimentacoesComSaldoInicial.push({
          data: filtro.dataInicio,
          tipo: 'SALDO INICIAL',
          docNumero: '-',
          origemDestino: 'Saldo Anterior',
          prescritor: '-',
          qtdEntrada: 0,
          qtdSaida: 0,
          qtdPerda: 0,
          saldo: saldoInicial
        });
      }

      movimentacoesComSaldoInicial.push(...todosEventos);

      if (movimentacoesComSaldoInicial.length > 0) {
        relatorioFinal.push({
          medicamento: {
            id: med.id,
            principioAtivo: med.principioAtivo,
            concentracao: med.concentracao,
            formaFarmaceutica: med.formaFarmaceutica,
            quantidadeEstoque: med.quantidadeEstoque,
            tipoLista: med.categoriaControlada?.tipo || filtro.tipoLista
          },
          movimentacoes: movimentacoesComSaldoInicial
        });
      }
    }

    return relatorioFinal;
  }

  // **MÉTODO PARA CALCULAR SALDO INICIAL** - Corrigido para seu schema
  private async calcularSaldoInicial(medicamentoId: string, dataInicio: Date): Promise<number> {
    // Buscar todas as movimentações ANTES da data início
    const movimentosAnteriores = await prisma.itemMovimento.findMany({
      where: {
        medicamentoId: medicamentoId,
        movimento: {
          dataDocumento: { lt: dataInicio }
        }
      },
      include: {
        movimento: true
      }
    });

    // Buscar todas as dispensações ANTES da data início
    const dispensacoesAnteriores = await prisma.itemDispensacao.findMany({
      where: {
        medicamentoId: medicamentoId,
        dispensacao: {
          dataDispensacao: { lt: dataInicio }
        }
      }
    });

    // Calcular saldo acumulado
    let saldo = 0;

    // Processar movimentos anteriores
    for (const mov of movimentosAnteriores) {
      const tipoMov = mov.movimento.tipoMovimentacao.toUpperCase();
      const isEntrada = tipoMov.includes('ENTRADA') || tipoMov.includes('COMPRA');
      const isPerda = tipoMov.includes('PERDA') || tipoMov.includes('AVARIA') || tipoMov.includes('VENCIMENTO');
      
      if (isEntrada) {
        saldo += mov.quantidade;
      } else if (isPerda) {
        saldo -= mov.quantidade;
      } else {
        saldo -= mov.quantidade; // Saída por ajuste
      }
    }

    // Subtrair dispensações anteriores
    for (const disp of dispensacoesAnteriores) {
      saldo -= disp.quantidadeSaida;
    }

    return saldo;
  }

  private formatarPrescritor(profissional: any, nomeLivre?: string): string {
    if (profissional) {
      const partes: string[] = [];
      if (profissional.nome) partes.push(profissional.nome);
      if (profissional.crm) partes.push(`CRM ${profissional.crm}`);
      return partes.join(' - ') || 'Prescritor Não Informado';
    }
    
    return nomeLivre || 'Prescritor Não Informado';
  }

  // **MÉTODO PARA VERIFICAR DADOS EXISTENTES**
  async verificarDadosExistentes(tipoLista: string) {
    try {
      // Verificar medicamentos da categoria
      const medicamentos = await prisma.medicamento.findMany({
        where: {
          categoriaControlada: {
            tipo: tipoLista
          }
        },
        include: {
          categoriaControlada: true
        },
        take: 5
      });

      // Verificar movimentos recentes
      const movimentos = await prisma.itemMovimento.findMany({
        where: {
          medicamento: {
            categoriaControlada: {
              tipo: tipoLista
            }
          }
        },
        include: {
          movimento: {
            include: {
              fornecedor: true
            }
          },
          medicamento: true
        },
        orderBy: {
          movimento: {
            dataDocumento: 'desc'
          }
        },
        take: 5
      });

      // Verificar dispensações recentes
      const dispensacoes = await prisma.itemDispensacao.findMany({
        where: {
          medicamento: {
            categoriaControlada: {
              tipo: tipoLista
            }
          }
        },
        include: {
          dispensacao: {
            include: {
              profissionalSaude: true
            }
          },
          medicamento: true
        },
        orderBy: {
          dispensacao: {
            dataDispensacao: 'desc'
          }
        },
        take: 5
      });

      return {
        medicamentos: {
          count: medicamentos.length,
          amostra: medicamentos
        },
        movimentos: {
          count: movimentos.length,
          amostra: movimentos
        },
        dispensacoes: {
          count: dispensacoes.length,
          amostra: dispensacoes
        }
      };
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      throw error;
    }
  }
}