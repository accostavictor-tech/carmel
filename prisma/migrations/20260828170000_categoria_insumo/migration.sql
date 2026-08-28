-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('MDF', 'FERRAGENS', 'OUTROS');

-- AlterTable
ALTER TABLE "Insumo" ADD COLUMN     "categoria" "CategoriaInsumo" NOT NULL DEFAULT 'OUTROS';

-- AlterTable
ALTER TABLE "Ambiente" ALTER COLUMN "percentualInsumosGerais" SET DEFAULT 5;

