import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Usuário admin de teste
  const TEST_EMAIL = 'admin@fmd.com';
  const TEST_PASSWORD = 'SenhaSegura123';
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { 
      password: hashedPassword,
      name: 'Admin Teste',
      role: 'ADMIN',
    },
    create: {
      email: TEST_EMAIL,
      password: hashedPassword,
      name: 'Admin Teste',
      role: 'ADMIN',
    },
  });

  console.log(`Usuário admin criado/atualizado: ${admin.email}`);

  // 2. Categorias controladas
  await prisma.categoriaControlada.createMany({
    data: [
      { id: 'A1', nome: 'Entorpecentes', tipo: 'A1', descricao: 'Substâncias entorpecentes da Lista A1' },
      { id: 'A2', nome: 'Entorpecentes A2', tipo: 'A2', descricao: 'Substâncias entorpecentes da Lista A2' },
      { id: 'A3', nome: 'Psicotrópicos A3', tipo: 'A3', descricao: 'Substâncias psicotrópicas da Lista A3' },
      { id: 'B1', nome: 'Psicotrópicos', tipo: 'B1', descricao: 'Substâncias psicotrópicas da Lista B1' },
      { id: 'B2', nome: 'Psicotrópicos B2', tipo: 'B2', descricao: 'Substâncias psicotrópicas da Lista B2' },
      { id: 'C1', nome: 'Outros Controlados', tipo: 'C1', descricao: 'Medicamentos de controle especial' },
      { id: 'C2', nome: 'Retinoides Sistêmicos', tipo: 'C2', descricao: 'Medicamentos retinoides sistêmicos' },
      { id: 'C3', nome: 'Imunossupressores', tipo: 'C3', descricao: 'Medicamentos imunossupressores' },
      { id: 'ANTIMICROBIANO', nome: 'Antimicrobianos', tipo: 'ANTIMICROBIANO', descricao: 'Antibióticos' },
    ],
    skipDuplicates: true, // evita erro se já existir
  });

  console.log('Categorias controladas inseridas/atualizadas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
