import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class DeleteEstabelecimentoService {
    async execute(id: string) {
        // 1. Verificar se o estabelecimento existe antes de tentar deletar
        const estabelecimento = await prisma.estabelecimento.findUnique({
            where: { id },
        });

        if (!estabelecimento) {
            throw new AppError(`Estabelecimento com ID ${id} não encontrado.`, 404);
        }

        // 2. [OPCIONAL, mas RECOMENDADO]: Verificar dependências
        // Se houverem registros de EstoqueLote ou Movimento vinculados, 
        // você pode lançar um erro ou deletar em cascata (se seu prisma não estiver configurado para isso).
        // Ex: const hasStock = await prisma.estoqueLote.count({ where: { estabelecimentoId: id } });
        // if (hasStock > 0) {
        //    throw new AppError("Não é possível excluir: O estabelecimento possui estoque ativo.", 400);
        // }

        // 3. Deletar
        await prisma.estabelecimento.delete({
            where: { id },
        });

        // Retorna um indicador de sucesso (ou null/void)
        return; 
    }
}

export { DeleteEstabelecimentoService };