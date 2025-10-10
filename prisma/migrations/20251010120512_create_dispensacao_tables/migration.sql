-- CreateTable
CREATE TABLE "Dispensacao" (
    "id" TEXT NOT NULL,
    "pacienteNome" TEXT NOT NULL,
    "pacienteCpf" TEXT,
    "profissionalSaude" TEXT,
    "documentoReferencia" TEXT NOT NULL,
    "dataDispensacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispensacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDispensacao" (
    "id" TEXT NOT NULL,
    "quantidadeSaida" INTEGER NOT NULL,
    "loteNumero" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "dispensacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemDispensacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemDispensacao" ADD CONSTRAINT "ItemDispensacao_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDispensacao" ADD CONSTRAINT "ItemDispensacao_dispensacaoId_fkey" FOREIGN KEY ("dispensacaoId") REFERENCES "Dispensacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
