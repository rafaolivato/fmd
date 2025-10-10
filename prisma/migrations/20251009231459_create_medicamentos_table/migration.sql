-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "principioAtivo" TEXT NOT NULL,
    "concentracao" TEXT NOT NULL,
    "formaFarmaceutica" TEXT NOT NULL,
    "psicotropico" BOOLEAN NOT NULL DEFAULT false,
    "quantidadeEstoque" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_principioAtivo_key" ON "Medicamento"("principioAtivo");
