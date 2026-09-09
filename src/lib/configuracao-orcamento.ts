import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getConfiguracaoOrcamento = unstable_cache(
  async () =>
    prisma.configuracaoOrcamento.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" },
    }),
  ["configuracao-orcamento"],
  { tags: ["configuracao-orcamento"] }
);
