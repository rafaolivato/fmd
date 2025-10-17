import { prisma } from '../../../database/prismaClient';
import { ICreateEstabelecimentoDTO } from '../dtos/ICreateEstabelecimentoDTO';
import { AppError } from '../../../shared/errors/AppError';

class CreateEstabelecimentoService {
    async execute({ nome, cnpj, tipo }: ICreateEstabelecimentoDTO) {
        // Verifica se já existe um estabelecimento com o mesmo nome (opcional, mas bom)
        const estabelecimentoExists = await prisma.estabelecimento.findUnique({
            where: { nome },
        });

        if (estabelecimentoExists) {
            throw new AppError(`O estabelecimento "${nome}" já está cadastrado.`, 400);
        }

        // O tipo é crucial para definir o papel na transferência
        if (!['ALMOXARIFADO', 'FARMACIA_UNIDADE', 'OUTRO'].includes(tipo)) {
            throw new AppError('Tipo de estabelecimento inválido.', 400);
        }

        const estabelecimento = await prisma.estabelecimento.create({
            data: {
                nome,
                cnpj,
                tipo,
            },
        });

        return estabelecimento;
    }
}

export { CreateEstabelecimentoService };