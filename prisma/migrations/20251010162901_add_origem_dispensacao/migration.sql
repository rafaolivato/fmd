/*
  Warnings:

  - Added the required column `estabelecimentoOrigemId` to the `Dispensacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dispensacao" ADD COLUMN     "estabelecimentoOrigemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Estabelecimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueLocal" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requisicao" (
    "id" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "atendenteId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requisicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemRequisicao" (
    "id" TEXT NOT NULL,
    "quantidadeSolicitada" INTEGER NOT NULL,
    "quantidadeAtendida" INTEGER NOT NULL DEFAULT 0,
    "medicamentoId" TEXT NOT NULL,
    "requisicaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemRequisicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estabelecimento_nome_key" ON "Estabelecimento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueLocal_medicamentoId_estabelecimentoId_key" ON "EstoqueLocal"("medicamentoId", "estabelecimentoId");

-- AddForeignKey
ALTER TABLE "Dispensacao" ADD CONSTRAINT "Dispensacao_estabelecimentoOrigemId_fkey" FOREIGN KEY ("estabelecimentoOrigemId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueLocal" ADD CONSTRAINT "EstoqueLocal_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueLocal" ADD CONSTRAINT "EstoqueLocal_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemRequisicao" ADD CONSTRAINT "ItemRequisicao_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemRequisicao" ADD CONSTRAINT "ItemRequisicao_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
