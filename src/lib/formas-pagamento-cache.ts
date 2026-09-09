import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getFormasPagamentoAtivas = unstable_cache(
  async () => prisma.formaPagamento.findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } }),
  ["formas-pagamento-ativas"],
  { tags: ["formas-pagamento-ativas"] }
);
