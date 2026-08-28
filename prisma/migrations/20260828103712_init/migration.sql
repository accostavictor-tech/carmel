-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "descricao" TEXT,
    "valorVenda" REAL NOT NULL,
    "dataFechamento" DATETIME NOT NULL,
    "prazoEntrega" DATETIME NOT NULL,
    "dataEntregaReal" DATETIME,
    "statusProducao" TEXT NOT NULL DEFAULT 'FILA',
    "responsavelId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Projeto_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Custo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Custo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetaMensal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "valorMeta" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MetaMensal_ano_mes_key" ON "MetaMensal"("ano", "mes");
