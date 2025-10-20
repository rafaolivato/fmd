// fmd-backend/src/modules/estabelecimentos/services/UpdateEstabelecimentoService.ts
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

// Tipagem para os dados que podem ser atualizados
interface IUpdateEstabelecimentoDTO {
    nome?: string;
    cnpj?: string | null;
    tipo?: string;
}

class UpdateEstabelecimentoService {
    async execute(id: string, data: IUpdateEstabelecimentoDTO) {
        
        // 1. Verificar se o estabelecimento existe
        const estabelecimentoExists = await prisma.estabelecimento.findUnique({
            where: { id },
        });

        if (!estabelecimentoExists) {
            throw new AppError(`Estabelecimento com ID ${id} não encontrado para atualização.`, 404);
        }

        // 2. Se o nome estiver sendo atualizado, verificar duplicidade
        if (data.nome && data.nome !== estabelecimentoExists.nome) {
            const nomeAlreadyUsed = await prisma.estabelecimento.findUnique({
                where: { nome: data.nome },
            });

            if (nomeAlreadyUsed) {
                throw new AppError(`O nome "${data.nome}" já está sendo usado por outro estabelecimento.`, 400);
            }
        }

        // 3. Validação de tipo (Se tipo for passado)
        if (data.tipo && !['ALMOXARIFADO', 'FARMACIA_UNIDADE', 'OUTRO'].includes(data.tipo)) {
            throw new AppError('Tipo de estabelecimento inválido.', 400);
        }

        // 4. Atualizar no banco de dados
        const estabelecimentoAtualizado = await prisma.estabelecimento.update({
            where: { id },
            data: {
                // Passa apenas os campos que vieram no 'data' (patch)
                nome: data.nome,
                cnpj: data.cnpj,
                tipo: data.tipo,
                // O 'updatedAt' é atualizado automaticamente pelo @updatedAt
            },
        });

        return estabelecimentoAtualizado; 
    }
}

export { UpdateEstabelecimentoService };