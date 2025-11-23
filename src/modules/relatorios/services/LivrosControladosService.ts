import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FiltroLivroDTO {
  tipoLista: string;
  dataInicio: Date;
  dataFim: Date;
  estabelecimentoId?: string;
}

// 1. Definimos a interface do item do relatório para o TypeScript entender
interface ItemRelatorio {
  medicamento: {
    id: string;
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
    quantidadeEstoque: number;
  };
  movimentacoes: {
    data: Date;
    tipo: string;
    docNumero: string;
    origemDestino: string;
    prescritor: string;
    qtdEntrada: number;
    qtdSaida: number;
    qtdPerda: number;
    saldo: number;
  }[];
}

export class LivrosControladosService {
  
  async gerarLivro(filtro: FiltroLivroDTO) {
    const medicamentos = await prisma.medicamento.findMany({
      where: {
        categoriaControlada: {
          tipo: filtro.tipoLista
        }
      },
      select: {
        id: true,
        principioAtivo: true,
        concentracao: true,
        formaFarmaceutica: true,
        // registroMS: true, // REMOVIDO: Não existe no seu model atual
        quantidadeEstoque: true 
      }
    });

    // 2. Aplicamos a tipagem explícita aqui
    const relatorioFinal: ItemRelatorio[] = [];

    for (const med of medicamentos) {
      
      const movimentos = await prisma.itemMovimento.findMany({
        where: {
          medicamentoId: med.id,
          movimento: {
            dataDocumento: { gte: filtro.dataInicio, lte: filtro.dataFim }
          }
        },
        include: {
          movimento: { include: { fornecedor: true } }
        }
      });

      const dispensacoes = await prisma.itemDispensacao.findMany({
        where: {
          medicamentoId: med.id,
          dispensacao: {
            dataDispensacao: { gte: filtro.dataInicio, lte: filtro.dataFim }
          }
        },
        include: {
          dispensacao: { include: { profissionalSaude: true } }
        }
      });

      const linhaTempo = [
        ...movimentos.map(m => ({
          data: m.movimento.dataDocumento,
          tipo: m.movimento.tipoMovimentacao,
          docNumero: m.movimento.numeroDocumento,
          origemDestino: m.movimento.tipoMovimentacao === 'ENTRADA' 
            ? m.movimento.fornecedor?.nome || 'Fornecedor N/I'
            : 'Ajuste/Perda',
          prescritor: '-',
          qtdEntrada: m.movimento.tipoMovimentacao === 'ENTRADA' ? m.quantidade : 0,
          qtdSaida: m.movimento.tipoMovimentacao !== 'ENTRADA' ? m.quantidade : 0,
          qtdPerda: m.movimento.tipoMovimentacao === 'PERDA' ? m.quantidade : 0
        })),
        ...dispensacoes.map(d => ({
          data: d.dispensacao.dataDispensacao,
          tipo: 'SAIDA',
          docNumero: `Rec: ${d.dispensacao.documentoReferencia || 'S/N'}`,
          origemDestino: d.dispensacao.pacienteNome,
          prescritor: `${d.dispensacao.profissionalSaude?.nome || 'N/I'} (${d.dispensacao.profissionalSaude?.crm || ''})`,
          qtdEntrada: 0,
          qtdSaida: d.quantidadeSaida,
          qtdPerda: 0
        }))
      ];

      linhaTempo.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      let saldoAtual = 0; 
      
      const historicoComSaldo = linhaTempo.map(linha => {
        saldoAtual = saldoAtual + linha.qtdEntrada - linha.qtdSaida - linha.qtdPerda;
        return { ...linha, saldo: saldoAtual };
      });

      if (historicoComSaldo.length > 0) {
        relatorioFinal.push({
          medicamento: med,
          movimentacoes: historicoComSaldo
        });
      }
    }

    return relatorioFinal;
  }
}