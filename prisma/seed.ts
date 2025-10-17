import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient();

async function main() {
  // 1. Defina as credenciais de teste
  const TEST_EMAIL = 'admin@fmd.com';
  const TEST_PASSWORD = 'SenhaSegura123'; // Senha em texto puro, fácil de lembrar

  // 2. Gere o HASH da senha usando o mesmo SALGADO (salt) que você usa no registro
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10); // Use 10 rounds de salt, se for o seu padrão

  // 3. Crie ou atualize o usuário no banco
  const admin = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { 
      password: hashedPassword,
      name: 'Admin Teste',
      role: 'ADMIN',
    },
    create: {
      email: TEST_EMAIL,
      password: hashedPassword, // Salva o hash
      name: 'Admin Teste',
      role: 'ADMIN',
    },
  });

  console.log(`Usuário admin criado/atualizado: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });