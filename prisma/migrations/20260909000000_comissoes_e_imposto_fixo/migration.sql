-- Imposto (NF) e taxas de cartão deixam de ser preenchidos por orçamento:
-- o imposto vira um percentual fixo no motor de cálculo (PERCENTUAL_IMPOSTO_NF
-- em src/lib/orcamentos.ts) e taxas de cartão passarão a ser tratadas nas
-- formas de pagamento (futuro). Remove lançamentos existentes que
-- representavam isso como "encargo" para não duplicar o imposto fixo.
DELETE FROM "EncargoOrcamento"
WHERE nome ILIKE '%nota fiscal%' OR nome ILIKE '%imposto%' OR nome = 'NF' OR nome ILIKE '%cart%o%';

-- "Nível" deixa de existir: a partir de agora só há comissões, todas somadas
-- sobre o mesmo valor de venda do item.
ALTER TABLE "EncargoOrcamento" DROP COLUMN "nivel";

-- Renomeia a tabela para refletir que agora só guarda comissões.
ALTER TABLE "EncargoOrcamento" RENAME TO "ComissaoOrcamento";
ALTER TABLE "ComissaoOrcamento" RENAME CONSTRAINT "EncargoOrcamento_pkey" TO "ComissaoOrcamento_pkey";
ALTER TABLE "ComissaoOrcamento" RENAME CONSTRAINT "EncargoOrcamento_orcamentoId_fkey" TO "ComissaoOrcamento_orcamentoId_fkey";

-- percentualImposto do orçamento não é mais editável (imposto agora é fixo).
ALTER TABLE "Orcamento" DROP COLUMN "percentualImposto";
