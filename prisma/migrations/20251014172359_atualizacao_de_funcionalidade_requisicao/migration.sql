/*
  Warnings:

  - Added the required column `estabelecimentoId` to the `Movimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movimento" ADD COLUMN     "estabelecimentoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Movimento" ADD CONSTRAINT "Movimento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
