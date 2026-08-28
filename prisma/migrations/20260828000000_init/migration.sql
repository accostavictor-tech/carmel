-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusProducao" AS ENUM ('FILA', 'PRODUCAO', 'ACABAMENTO', 'ENTREGA', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "CategoriaCusto" AS ENUM ('MATERIAL', 'MAO_DE_OBRA', 'OUTROS');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "descricao" TEXT,
    "valorVenda" DOUBLE PRECISION NOT NULL,
    "dataFechamento" TIMESTAMP(3) NOT NULL,
    "prazoEntrega" TIMESTAMP(3) NOT NULL,
    "dataEntregaReal" TIMESTAMP(3),
    "statusProducao" "StatusProducao" NOT NULL DEFAULT 'FILA',
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Custo" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "categoria" "CategoriaCusto" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Custo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaMensal" (
    "id" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "valorMeta" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MetaMensal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MetaMensal_ano_mes_key" ON "MetaMensal"("ano", "mes");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Custo" ADD CONSTRAINT "Custo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

