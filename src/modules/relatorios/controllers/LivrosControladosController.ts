import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LivrosControladosController {
  
  // ✅ Relatório por categoria específica (performance)
  async getLivroPorCategoria(request: Request, response: Response) {
    try {
      const { categoria, dataInicio, dataFim, estabelecimento } = request.query;

      // Filtro otimizado por categoria
      const where = {
        categoriaControlada: {
          nome: categoria as string
        },
        itensDispensados: {
          some: {
            dispensacao: {
              dataDispensacao: {
                gte: new Date(dataInicio as string),
                lte: new Date(dataFim as string)
              },
              ...(estabelecimento && {
                estabelecimentoOrigem: {
                  nome: estabelecimento as string
                }
              })
            }
          }
        }
      };

      const medicamentos = await prisma.medicamento.findMany({
        where,
        include: {
          categoriaControlada: true,
          itensDispensados: {
            where: {
              dispensacao: {
                dataDispensacao: {
                  gte: new Date(dataInicio as string),
                  lte: new Date(dataFim as string)
                }
              }
            },
            include: {
              dispensacao: {
                include: {
                  estabelecimentoOrigem: true,
                  profissionalSaude: true
                }
              }
            }
          }
        }
      });

      response.json(this.formatarLivroControlado(medicamentos, categoria as string));
      
    } catch (error: any) {
      response.status(500).json({ error: error.message });
    }
  }

  // ✅ Relatório consolidado (quando necessário)
  async getLivroConsolidado(request: Request, response: Response) {
    try {
      const { dataInicio, dataFim } = request.query;

      // Busca por categorias separadamente (evita join gigante)
      const categorias = await prisma.categoriaControlada.findMany();
      
      const resultados = await Promise.all(
        categorias.map(async (categoria) => {
          const medicamentos = await prisma.medicamento.findMany({
            where: {
              categoriaControladaId: categoria.id,
              itensDispensados: {
                some: {
                  dispensacao: {
                    dataDispensacao: {
                      gte: new Date(dataInicio as string),
                      lte: new Date(dataFim as string)
                    }
                  }
                }
              }
            },
            include: {
              itensDispensados: {
                where: {
                  dispensacao: {
                    dataDispensacao: {
                      gte: new Date(dataInicio as string),
                      lte: new Date(dataFim as string)
                    }
                  }
                },
                include: {
                  dispensacao: {
                    include: {
                      estabelecimentoOrigem: true
                    }
                  }
                }
              }
            }
          });

          return {
            categoria: categoria.nome,
            tipo: categoria.tipo,
            quantidadeMedicamentos: medicamentos.length,
            totalDispensacoes: medicamentos.reduce((sum, med) => 
              sum + med.itensDispensados.length, 0
            )
          };
        })
      );

      response.json(resultados);
      
    } catch (error: any) {
      response.status(500).json({ error: error.message });
    }
  }

  private formatarLivroControlado(medicamentos: any[], categoria: string) {
    // Formata conforme padrão da vigilância sanitária
    return {
      cabecalho: {
        tipoLivro: `LIVRO DE ${categoria}`,
        periodo: `${new Date().getFullYear()}`,
        estabelecimento: 'FARMÁCIA MUNICIPAL',
        
      },
      registros: medicamentos.flatMap(medicamento => 
        medicamento.itensDispensados.map(item => ({
          data: item.dispensacao.dataDispensacao,
          medicamento: medicamento.principioAtivo,
          concentracao: medicamento.concentracao,
          lote: item.loteNumero,
          paciente: item.dispensacao.pacienteNome,
          cpfPaciente: item.dispensacao.pacienteCpf,
          profissional: item.dispensacao.profissionalSaude,
          quantidade: item.quantidadeSaida,
          estabelecimento: item.dispensacao.estabelecimentoOrigem.nome,
          assinatura: '' // Espaço para assinatura manual
        }))
      )
    };
  }
}