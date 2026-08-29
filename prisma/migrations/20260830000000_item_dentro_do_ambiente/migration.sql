-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "ambienteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "percentualInsumosGerais" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "percentualLucro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMaterial" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "insumoId" TEXT,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "percentualPerda" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantidade" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemMaterial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_ambienteId_fkey" FOREIGN KEY ("ambienteId") REFERENCES "Ambiente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMaterial" ADD CONSTRAINT "ItemMaterial_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMaterial" ADD CONSTRAINT "ItemMaterial_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: cria um Item padrão para cada Ambiente existente, herdando
-- nome/descrição/percentuais, e move os materiais (ItemAmbiente) para dentro
-- desse Item — preserva orçamentos já criados sem perder nada.
INSERT INTO "Item" ("id", "ambienteId", "nome", "descricao", "percentualInsumosGerais", "percentualLucro", "ordem")
SELECT
  md5(random()::text || clock_timestamp()::text || a."id"),
  a."id",
  a."nome",
  a."descricao",
  a."percentualInsumosGerais",
  a."percentualLucro",
  0
FROM "Ambiente" a;

INSERT INTO "ItemMaterial" ("id", "itemId", "insumoId", "descricao", "unidade", "valorUnitario", "percentualPerda", "quantidade")
SELECT
  ia."id",
  i."id",
  ia."insumoId",
  ia."descricao",
  ia."unidade",
  ia."valorUnitario",
  ia."percentualPerda",
  ia."quantidade"
FROM "ItemAmbiente" ia
JOIN "Item" i ON i."ambienteId" = ia."ambienteId";

-- DropForeignKey
ALTER TABLE "ItemAmbiente" DROP CONSTRAINT "ItemAmbiente_ambienteId_fkey";

-- DropForeignKey
ALTER TABLE "ItemAmbiente" DROP CONSTRAINT "ItemAmbiente_insumoId_fkey";

-- DropTable
DROP TABLE "ItemAmbiente";

-- AlterTable
ALTER TABLE "Ambiente" DROP COLUMN "descricao",
DROP COLUMN "percentualInsumosGerais",
DROP COLUMN "percentualLucro";
