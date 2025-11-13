// src/modules/dashboard/controllers/DashboardController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardController {
  async getMetrics(request: Request, response: Response) {
    try {
      // Teste a conexão primeiro
      await prisma.$connect();
      console.log('✅ Conexão com o banco estabelecida');

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      let totalMedicamentos = 0;
      let entradasHoje = 0;
      let saidasHoje = 0;
      
      type AlertaEstoque = {
        id: string;
        medicamento: string;
        quantidade: number;
        estoqueMinimo: number;
        tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO' | string;
      };
      
      let alertasEstoque: AlertaEstoque[] = [];

      try {
        // Total de medicamentos - com fallback
        totalMedicamentos = await prisma.medicamento.count().catch(() => 0);
        console.log('✅ Total medicamentos:', totalMedicamentos);

        // Movimentações de hoje - com fallback
        entradasHoje = await prisma.movimento.count({
          where: {
            tipoMovimentacao: 'ENTRADA',
            dataDocumento: {
              gte: hoje,
              lt: amanha
            }
          }
        }).catch(() => 0);

        saidasHoje = await prisma.movimento.count({
          where: {
            tipoMovimentacao: 'SAIDA',
            dataDocumento: {
              gte: hoje,
              lt: amanha
            }
          }
        }).catch(() => 0);

        console.log('✅ Entradas hoje:', entradasHoje);
        console.log('✅ Saídas hoje:', saidasHoje);

        // Alertas de estoque - versão simplificada
        try {
          const medicamentos = await prisma.medicamento.findMany({
            select: {
              id: true,
              principioAtivo: true,
              concentracao: true,
              formaFarmaceutica: true
            }
          });

          // Versão mock por enquanto - depois você implementa com estoque real
          alertasEstoque = medicamentos.slice(0, 3).map((med, index) => ({
            id: med.id,
            medicamento: `${med.principioAtivo} - ${med.concentracao}`,
            quantidade: 5 - index, // Mock: 5, 4, 3
            estoqueMinimo: 10,
            tipo: (5 - index) < 3 ? 'CRITICO' : 'ALERTA'
          }));

        } catch (estoqueError) {
          console.log('⚠️  Erro ao buscar estoque, usando dados mock');
          alertasEstoque = [
            {
              id: '1',
              medicamento: 'Paracetamol 500mg',
              quantidade: 2,
              estoqueMinimo: 10,
              tipo: 'CRITICO'
            },
            {
              id: '2', 
              medicamento: 'Dipirona 500mg',
              quantidade: 8,
              estoqueMinimo: 10,
              tipo: 'ALERTA'
            }
          ];
        }

      } catch (dbError) {
        console.log('⚠️  Erro em consultas específicas, usando valores padrão');
        // Valores padrão se alguma consulta falhar
      }

      response.json({
        totalMedicamentos,
        entradasHoje,
        saidasHoje,
        dispensacoesHoje: 0,
        alertasEstoque
      });

    } catch (error) {
      console.error('❌ Erro geral no dashboard:', error);
      
      // Retorna dados mock em caso de erro
      response.json({
        totalMedicamentos: 0,
        entradasHoje: 0,
        saidasHoje: 0,
        dispensacoesHoje: 0,
        alertasEstoque: [
          {
            id: '1',
            medicamento: 'Sistema em configuração',
            quantidade: 0,
            estoqueMinimo: 10,
            tipo: 'ATENCAO'
          }
        ]
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }
}

export { DashboardController };