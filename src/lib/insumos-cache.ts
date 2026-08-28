import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getInsumosAtivos = unstable_cache(
  async () => prisma.insumo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ["insumos-ativos"],
  { tags: ["insumos-ativos"] }
);
