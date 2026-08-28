-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "compartilhadoEm" TIMESTAMP(3),
ADD COLUMN     "linkToken" TEXT;

-- CreateTable
CREATE TABLE "VisualizacaoOrcamento" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "VisualizacaoOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_linkToken_key" ON "Orcamento"("linkToken");

-- AddForeignKey
ALTER TABLE "VisualizacaoOrcamento" ADD CONSTRAINT "VisualizacaoOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
