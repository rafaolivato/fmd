import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FiltroLivroDTO {
  tipoLista: string;
  dataInicio: string; // Mudei para string para receber do frontend
  dataFim: string;    // Mudei para string para receber do frontend
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
    psicotropico: boolean;
  };
  movimentacoes: MovimentoLivro[];
}

export class LivrosControladosService {
  
  // Função para corrigir timezone - EXATAMENTE COMO VOCÊ SUGERIU
  private corrigirDataParaUTC(dataString: string, fimDoDia: boolean = false): Date {
    const data = new Date(dataString);

    if (fimDoDia) {
        data.setUTCHours(23, 59, 59, 999);
    } else {
        data.setUTCHours(0, 0, 0, 0);
    }

    return data;
  }

  async gerarLivro(filtro: FiltroLivroDTO) {
     
    // Corrigir as datas para UTC
    const dataInicioUTC = this.corrigirDataParaUTC(filtro.dataInicio, false);
    const dataFimUTC = this.corrigirDataParaUTC(filtro.dataFim, true);

      
    // WHERE condition dinâmico - FILTRO APENAS POR CATEGORIA
    const whereCondition: any = {};

    // Se tem tipoLista específico, filtra APENAS pela categoria
    if (filtro.tipoLista && filtro.tipoLista !== 'TODOS') {
      whereCondition.categoriaControlada = {
        tipo: filtro.tipoLista
      };
    }

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
        psicotropico: true,
        categoriaControlada: {
          select: {
            tipo: true,
            nome: true
          }
        }
      },
      orderBy: {
        principioAtivo: 'asc'
      }
    });

    medicamentos.forEach(med => {
      });

    // Se não encontrou medicamentos, retorna array vazio
    if (medicamentos.length === 0) {
      return [];
    }

    const relatorioFinal: ItemRelatorio[] = [];

    for (const med of medicamentos) {
            
      // **CRUCIAL: Buscar saldo inicial (antes da data início)**
      const saldoInicial = await this.calcularSaldoInicial(med.id, dataInicioUTC);
            
      let saldoAtual = saldoInicial;

      // Buscar MOVIMENTOS (Entradas, Saídas, Perdas) - USANDO DATAS UTC
      const movimentos = await prisma.itemMovimento.findMany({
        where: {
          medicamentoId: med.id,
          movimento: {
            dataDocumento: { 
              gte: dataInicioUTC, 
              lte: dataFimUTC 
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

      
      // Buscar DISPENSAÇÕES (Saídas para pacientes) - USANDO DATAS UTC
      const dispensacoes = await prisma.itemDispensacao.findMany({
        where: {
          medicamentoId: med.id,
          dispensacao: {
            dataDispensacao: { 
              gte: dataInicioUTC, 
              lte: dataFimUTC 
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

       const movimentosProcessados: MovimentoLivro[] = movimentos.map(mov => {
        const tipoMov = mov.movimento.tipoMovimentacao.toUpperCase();
        const isEntrada = tipoMov.includes('ENTRADA') || tipoMov.includes('COMPRA');
        const isPerda = tipoMov.includes('PERDA') || tipoMov.includes('AVARIA') || tipoMov.includes('VENCIMENTO');
        const isSaida = !isEntrada && !isPerda;
        
        const qtdEntrada = isEntrada ? mov.quantidade : 0;
        const qtdSaida = isSaida ? mov.quantidade : 0;
        const qtdPerda = isPerda ? mov.quantidade : 0;
      
        // Atualizar saldo
        saldoAtual += qtdEntrada - qtdSaida - qtdPerda;
      
        let observacoes = '-';
      
        if (isEntrada) {
          // Para entradas, mostra apenas o tipo
          observacoes = mov.movimento.tipoMovimentacao;
        } else {
          // Para saídas (perdas, avarias, transferências, etc.)
          const partes: string[] = [];
          
          // Adiciona o tipo de movimentação
          if (mov.movimento.tipoMovimentacao) {
            partes.push(mov.movimento.tipoMovimentacao);
          }
          
          // Adiciona a observação se existir
          if (mov.movimento.observacao && mov.movimento.observacao.trim() !== '') {
            partes.push(mov.movimento.observacao);
          }
          
          if (partes.length > 0) {
            observacoes = partes.join(' - ');
          }
        }
      
        return {
          data: mov.movimento.dataDocumento,
          tipo: mov.movimento.tipoMovimentacao,
          docNumero: mov.movimento.numeroDocumento || 'S/N',
          origemDestino: isEntrada 
            ? mov.movimento.fornecedor?.nome || 'Fornecedor Não Informado'
            : 'Saída Interna',
          prescritor: observacoes, 
          qtdEntrada,
          qtdSaida,
          qtdPerda,
          saldo: saldoAtual
        };
      });

      // Processar DISPENSAÇÕES
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
          data: dataInicioUTC, // Usando a data UTC corrigida
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
            tipoLista: med.categoriaControlada?.tipo || filtro.tipoLista,
            psicotropico: med.psicotropico
          },
          movimentacoes: movimentacoesComSaldoInicial
        });
      }
    }

    return relatorioFinal;
  }

  // **MÉTODO PARA CALCULAR SALDO INICIAL** - ATUALIZADO COM UTC
  private async calcularSaldoInicial(medicamentoId: string, dataInicioUTC: Date): Promise<number> {
    // Buscar todas as movimentações ANTES da data início (usando UTC)
    const movimentosAnteriores = await prisma.itemMovimento.findMany({
      where: {
        medicamentoId: medicamentoId,
        movimento: {
          dataDocumento: { lt: dataInicioUTC }
        }
      },
      include: {
        movimento: true
      }
    });

    // Buscar todas as dispensações ANTES da data início (usando UTC)
    const dispensacoesAnteriores = await prisma.itemDispensacao.findMany({
      where: {
        medicamentoId: medicamentoId,
        dispensacao: {
          dataDispensacao: { lt: dataInicioUTC }
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

  // **MÉTODO PARA VERIFICAR DADOS EXISTENTES** - ATUALIZADO
  async verificarDadosExistentes(tipoLista: string) {
    try {
      // WHERE condition igual ao do relatório - APENAS POR CATEGORIA
      const whereCondition: any = {};

      if (tipoLista && tipoLista !== 'TODOS') {
        whereCondition.categoriaControlada = {
          tipo: tipoLista
        };
      }

      // Verificar medicamentos da categoria
      const medicamentos = await prisma.medicamento.findMany({
        where: whereCondition,
        include: {
          categoriaControlada: true
        },
        take: 5
      });

      // Verificar movimentos recentes
      const movimentos = await prisma.itemMovimento.findMany({
        where: {
          medicamento: whereCondition
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
          medicamento: whereCondition
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