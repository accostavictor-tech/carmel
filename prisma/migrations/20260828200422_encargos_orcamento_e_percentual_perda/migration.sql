/*
  Warnings:

  - You are about to drop the `EncargoAmbiente` table. Its rows are migrated to the new
    `EncargoOrcamento` table (deduplicated per orçamento) before the table is dropped.

*/
-- AlterTable
ALTER TABLE "Insumo" ADD COLUMN     "percentualPerda" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ItemAmbiente" ADD COLUMN     "percentualPerda" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EncargoOrcamento" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EncargoOrcamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EncargoOrcamento" ADD CONSTRAINT "EncargoOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: leva os encargos que existiam por ambiente para o nível do
-- orçamento (deduplicando por orçamento+nome+percentual+nível), já que agora
-- são definidos uma única vez e valem para todos os ambientes.
INSERT INTO "EncargoOrcamento" ("id", "orcamentoId", "nome", "percentual", "nivel", "ordem")
SELECT DISTINCT ON (a."orcamentoId", ea."nome", ea."percentual", ea."nivel")
  md5(random()::text || clock_timestamp()::text || ea."id"),
  a."orcamentoId",
  ea."nome",
  ea."percentual",
  ea."nivel",
  ea."ordem"
FROM "EncargoAmbiente" ea
JOIN "Ambiente" a ON a."id" = ea."ambienteId"
ORDER BY a."orcamentoId", ea."nome", ea."percentual", ea."nivel", ea."ordem";

-- DropForeignKey
ALTER TABLE "EncargoAmbiente" DROP CONSTRAINT "EncargoAmbiente_ambienteId_fkey";

-- DropTable
DROP TABLE "EncargoAmbiente";
