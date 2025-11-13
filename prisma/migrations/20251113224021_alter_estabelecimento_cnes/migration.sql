/*
  Warnings:

  - You are about to drop the column `cnpj` on the `Estabelecimento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnes]` on the table `Estabelecimento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Estabelecimento" DROP COLUMN "cnpj",
ADD COLUMN     "cnes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Estabelecimento_cnes_key" ON "Estabelecimento"("cnes");
