-- AlterEnum
BEGIN;
CREATE TYPE "CategoriaCusto_new" AS ENUM ('MATERIA_PRIMA', 'FERRAGENS_ACABAMENTO', 'MAO_DE_OBRA', 'TERCEIRIZADOS', 'OUTROS');
ALTER TABLE "Custo" ALTER COLUMN "categoria" TYPE "CategoriaCusto_new" USING ("categoria"::text::"CategoriaCusto_new");
ALTER TYPE "CategoriaCusto" RENAME TO "CategoriaCusto_old";
ALTER TYPE "CategoriaCusto_new" RENAME TO "CategoriaCusto";
DROP TYPE "CategoriaCusto_old";
COMMIT;

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "percentualImposto" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrcamentoCusto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "categoria" "CategoriaCusto" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrcamentoCusto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrcamentoCusto_projetoId_categoria_key" ON "OrcamentoCusto"("projetoId", "categoria");

-- AddForeignKey
ALTER TABLE "OrcamentoCusto" ADD CONSTRAINT "OrcamentoCusto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
