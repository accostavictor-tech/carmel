"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

export async function atualizarConfiguracaoOrcamentoAction(formData: FormData) {
  const percentualImpostoNF = numeroDeFormData(formData, "percentualImpostoNF");
  const percentualInsumosGerais = numeroDeFormData(formData, "percentualInsumosGerais");

  await prisma.configuracaoOrcamento.upsert({
    where: { id: "global" },
    update: { percentualImpostoNF, percentualInsumosGerais },
    create: { id: "global", percentualImpostoNF, percentualInsumosGerais },
  });

  revalidatePath("/configuracoes");
  updateTag("configuracao-orcamento");
}
