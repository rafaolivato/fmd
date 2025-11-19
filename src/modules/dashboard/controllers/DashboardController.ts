import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardController {
    async getMetrics(request: Request, response: Response) {
        try {
            await prisma.$connect();
            console.log('✅ Conexão com o banco estabelecida');

            // 1. Definição do Período (Hoje)
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);

            // 2. Inicialização das Métricas
            let totalMedicamentos = 0;
            let entradasHoje = 0;
            let saidasHoje = 0;
            let dispensacoesHoje = 0; // <-- NOVA MÉTRICA

            type AlertaEstoque = {
                id: string;
                medicamento: string;
                quantidade: number;
                estoqueMinimo: number;
                tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO' | string;
            };

            let alertasEstoque: AlertaEstoque[] = [];

            try {
                // Total de medicamentos
                totalMedicamentos = await prisma.medicamento.count().catch(() => 0);

                // Movimentações de ENTRADA (Tipo Movimento)
                entradasHoje = await prisma.movimento.count({
                    where: {
                        tipoMovimentacao: 'ENTRADA',
                        dataDocumento: { gte: hoje, lt: amanha }
                    }
                }).catch(() => 0);

                // Movimentações de SAÍDA (Tipo Movimento - Não Dispensa)
                // Se SAIDA incluir dispensação, use: tipoMovimentacao: 'SAIDA'
                // Se SAIDA for apenas Transferência, use: tipoMovimentacao: 'SAIDA_TRANSFERENCIA' (ajuste conforme seu modelo)
                saidasHoje = await prisma.movimento.count({
                    where: {
                        tipoMovimentacao: 'SAIDA',
                        dataDocumento: { gte: hoje, lt: amanha }
                    }
                }).catch(() => 0);

                // Movimentações de DISPENSAÇÃO (Assumindo que há uma tabela 'dispensacao' ou tipo na 'movimento')
                // 💡 Se você usa uma tabela 'Dispensacao', use:
                // dispensacoesHoje = await prisma.dispensacao.count({
                //     where: { createdAt: { gte: hoje, lt: amanha } }
                // }).catch(() => 0);
                
                // 💡 Se você usa o campo 'tipoMovimentacao' na tabela 'movimento':
                dispensacoesHoje = await prisma.movimento.count({
                    where: {
                        tipoMovimentacao: 'DISPENSACAO', // Use o valor exato do seu enum/string
                        dataDocumento: { gte: hoje, lt: amanha }
                    }
                }).catch(() => 0);


                console.log('✅ Entradas hoje:', entradasHoje);
                console.log('✅ Saídas hoje:', saidasHoje);
                console.log('✅ Dispensações hoje:', dispensacoesHoje);


                // Lógica de Alertas de Estoque (manteremos o mock por enquanto, mas com a estrutura real)
                try {
                    const estoquesComMedicamento = await prisma.estoqueLocal.findMany({
                         include: { medicamento: true },
                         where: { quantidade: { lt: 10 } } // Busca apenas estoques baixos
                    });
                    
                    alertasEstoque = estoquesComMedicamento.map((estoque) => {
                        const estoqueMinimo = estoque.medicamento.estoqueMinimo || 100;
                        let tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO' = 'ATENCAO';

                        if (estoque.quantidade <= 0 || estoque.quantidade < estoqueMinimo) {
                            tipo = 'CRITICO';
                        } else if (estoque.quantidade < estoqueMinimo * 1.5) {
                            tipo = 'ALERTA';
                        }
                        
                        return {
                            id: estoque.id,
                            medicamento: `${estoque.medicamento.principioAtivo} - ${estoque.medicamento.concentracao}`,
                            quantidade: estoque.quantidade,
                            estoqueMinimo,
                            tipo,
                        };
                    });

                } catch (estoqueError) {
                    // Fallback para alertas
                    console.log('⚠️ Erro ao buscar estoque, usando dados mock', estoqueError);
                    alertasEstoque = [
                        { id: '1', medicamento: 'Paracetamol 500mg', quantidade: 2, estoqueMinimo: 10, tipo: 'CRITICO' },
                        { id: '2', medicamento: 'Dipirona 500mg', quantidade: 8, estoqueMinimo: 10, tipo: 'ALERTA' }
                    ];
                }

            } catch (dbError) {
                console.log('⚠️ Erro em consultas específicas, usando valores padrão');
                // Valores padrão se alguma consulta falhar
            }

            // 3. Resposta Final
            response.json({
                totalMedicamentos,
                entradasHoje,
                saidasHoje,
                dispensacoesHoje, // <-- RETORNANDO A NOVA MÉTRICA
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
                alertasEstoque: []
            });
        } finally {
            await prisma.$disconnect().catch(() => {});
        }
    }
}

export { DashboardController };