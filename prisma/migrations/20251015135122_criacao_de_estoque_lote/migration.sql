-- CreateTable
CREATE TABLE "EstoqueLote" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "numeroLote" TEXT NOT NULL,
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "fabricante" TEXT NOT NULL,
    "itemMovimentoEntradaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueLote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueLote_medicamentoId_estabelecimentoId_numeroLote_key" ON "EstoqueLote"("medicamentoId", "estabelecimentoId", "numeroLote");

-- AddForeignKey
ALTER TABLE "EstoqueLote" ADD CONSTRAINT "EstoqueLote_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueLote" ADD CONSTRAINT "EstoqueLote_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "Estabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
