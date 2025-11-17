import { prisma } from '../../../database/prismaClient';

interface IMedicamento {
  id: string;
  principioAtivo: string;
 
}

export class ListMedicamentosComEstoqueAlmoxarifadoService {
  async execute(): Promise<IMedicamento[]> {
    // 1. Encontrar o ID do Estabelecimento que é o Almoxarifado
    const almoxarifado = await prisma.estabelecimento.findFirst({
      where: {
        tipo: 'ALMOXARIFADO'
      },
      select: {
        id: true // Precisamos apenas do ID
      }
    });

    if (!almoxarifado) {
      // Se não houver almoxarifado, retorna lista vazia ou lança um erro, 
      // mas lista vazia é melhor para a tela de requisição.
      return [];
    }
    
    // 2. Buscar os Itens de Estoque do Almoxarifado com quantidade > 0
    const estoquesComPositivo = await prisma.estoqueLocal.findMany({
      where: {
        estabelecimentoId: almoxarifado.id,
        quantidade: {
          gt: 0 // 'gt' significa 'Greater Than' (maior que)
        }
      },
      // 3. Incluir os dados do Medicamento para retorná-los
      include: {
        medicamento: {
          select: {
            id: true,
            principioAtivo: true,
            
            
          }
        }
      }
    });

   // 4. Mapear o resultado
   const medicamentosEmEstoque = estoquesComPositivo
   .map(estoque => ({
       id: estoque.medicamento.id,
       principioAtivo: estoque.medicamento.principioAtivo,
       // Se precisar de mais campos, adicione-os aqui e no 'select' acima
   }))
   .filter((med, index, self) => 
     self.findIndex(t => t.id === med.id) === index
   );

 return medicamentosEmEstoque;
  }
}