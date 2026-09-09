-- Configurações globais do orçamento: uma única linha, editável em
-- /configuracoes, aplicada a todos os orçamentos (novos e já existentes).
CREATE TABLE "ConfiguracaoOrcamento" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "percentualImpostoNF" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "percentualInsumosGerais" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoOrcamento_pkey" PRIMARY KEY ("id")
);

-- Semeia a linha única com os mesmos valores que já estavam fixos no
-- código (7% de imposto, 5% de insumos gerais), então nada muda no
-- cálculo até que alguém edite a tela de configurações.
INSERT INTO "ConfiguracaoOrcamento" ("id", "percentualImpostoNF", "percentualInsumosGerais", "atualizadoEm")
VALUES ('global', 7, 5, CURRENT_TIMESTAMP);

-- "Insumos gerais" deixa de ser um valor por item (sempre 5% de qualquer
-- forma, não editável na interface) e passa a vir da configuração global
-- acima, refletindo em todos os itens de todos os orçamentos.
ALTER TABLE "Item" DROP COLUMN "percentualInsumosGerais";
