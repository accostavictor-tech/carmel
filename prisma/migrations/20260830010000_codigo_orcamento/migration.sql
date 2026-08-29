-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_codigo_key" ON "Orcamento"("codigo");
