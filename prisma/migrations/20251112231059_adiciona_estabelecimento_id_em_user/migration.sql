/*
  Warnings:

  - You are about to drop the column `fornecedor` on the `Movimento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Requisicao" DROP CONSTRAINT "Requisicao_atendenteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requisicao" DROP CONSTRAINT "Requisicao_solicitanteId_fkey";

-- AlterTable
ALTER TABLE "Movimento" DROP COLUMN "fornecedor",
ADD COLUMN     "fornecedorId" TEXT;

-- AlterTable
ALTER TABLE "Requisicao" ADD COLUMN     "observacoes" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "estabelecimentoId" TEXT;

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimento" ADD CONSTRAINT "Movimento_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "Estabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
