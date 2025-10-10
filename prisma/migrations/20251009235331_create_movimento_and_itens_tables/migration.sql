-- CreateTable
CREATE TABLE "Movimento" (
    "id" TEXT NOT NULL,
    "tipoMovimentacao" TEXT NOT NULL,
    "fonteFinanciamento" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "documentoTipo" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "dataDocumento" TIMESTAMP(3) NOT NULL,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMovimento" (
    "id" TEXT NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "fabricante" TEXT NOT NULL,
    "numeroLote" TEXT NOT NULL,
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "localizacaoFisica" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "movimentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemMovimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movimento_numeroDocumento_key" ON "Movimento"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "ItemMovimento_numeroLote_movimentoId_key" ON "ItemMovimento"("numeroLote", "movimentoId");

-- AddForeignKey
ALTER TABLE "ItemMovimento" ADD CONSTRAINT "ItemMovimento_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovimento" ADD CONSTRAINT "ItemMovimento_movimentoId_fkey" FOREIGN KEY ("movimentoId") REFERENCES "Movimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
