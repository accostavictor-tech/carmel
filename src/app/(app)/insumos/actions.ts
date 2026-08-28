"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

export async function criarInsumoAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const unidade = String(formData.get("unidade") ?? "").trim();
  const valorUnitario = numeroDeFormData(formData, "valorUnitario");

  if (!nome || !unidade || valorUnitario <= 0) {
    throw new Error("Preencha nome, unidade e valor do insumo.");
  }

  await prisma.insumo.create({ data: { nome, unidade, valorUnitario } });

  revalidatePath("/insumos");
}

export async function atualizarInsumoAction(insumoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const unidade = String(formData.get("unidade") ?? "").trim();
  const valorUnitario = numeroDeFormData(formData, "valorUnitario");

  if (!nome || !unidade || valorUnitario <= 0) {
    throw new Error("Preencha nome, unidade e valor do insumo.");
  }

  await prisma.insumo.update({
    where: { id: insumoId },
    data: { nome, unidade, valorUnitario },
  });

  revalidatePath("/insumos");
}

export async function arquivarInsumoAction(insumoId: string) {
  await prisma.insumo.update({ where: { id: insumoId }, data: { ativo: false } });
  revalidatePath("/insumos");
}

export async function reativarInsumoAction(insumoId: string) {
  await prisma.insumo.update({ where: { id: insumoId }, data: { ativo: true } });
  revalidatePath("/insumos");
}
