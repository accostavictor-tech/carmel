"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CategoriaInsumo } from "@prisma/client";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

function categoriaDeFormData(formData: FormData): CategoriaInsumo {
  const categoria = String(formData.get("categoria") ?? "OUTROS");
  return Object.values(CategoriaInsumo).includes(categoria as CategoriaInsumo)
    ? (categoria as CategoriaInsumo)
    : CategoriaInsumo.OUTROS;
}

async function criarInsumoNoBanco(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const unidade = String(formData.get("unidade") ?? "").trim();
  const valorUnitario = numeroDeFormData(formData, "valorUnitario");
  const percentualPerda = numeroDeFormData(formData, "percentualPerda");
  const categoria = categoriaDeFormData(formData);

  if (!nome || !unidade || valorUnitario <= 0) {
    throw new Error("Preencha nome, unidade e valor do insumo.");
  }

  const insumo = await prisma.insumo.create({
    data: { nome, unidade, valorUnitario, percentualPerda, categoria },
  });

  revalidatePath("/insumos");
  updateTag("insumos-ativos");

  return insumo;
}

export async function criarInsumoAction(formData: FormData) {
  await criarInsumoNoBanco(formData);
}

// Variante que retorna o insumo criado, para cadastro rápido feito direto do
// combobox de insumos do orçamento (sem passar pela página /insumos).
export async function criarInsumoERetornarAction(formData: FormData) {
  return criarInsumoNoBanco(formData);
}

export async function atualizarInsumoAction(insumoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const unidade = String(formData.get("unidade") ?? "").trim();
  const valorUnitario = numeroDeFormData(formData, "valorUnitario");
  const percentualPerda = numeroDeFormData(formData, "percentualPerda");
  const categoria = categoriaDeFormData(formData);

  if (!nome || !unidade || valorUnitario <= 0) {
    throw new Error("Preencha nome, unidade e valor do insumo.");
  }

  await prisma.insumo.update({
    where: { id: insumoId },
    data: { nome, unidade, valorUnitario, percentualPerda, categoria },
  });

  revalidatePath("/insumos");
  updateTag("insumos-ativos");
}

export async function arquivarInsumoAction(insumoId: string) {
  await prisma.insumo.update({ where: { id: insumoId }, data: { ativo: false } });
  revalidatePath("/insumos");
  updateTag("insumos-ativos");
}

export async function reativarInsumoAction(insumoId: string) {
  await prisma.insumo.update({ where: { id: insumoId }, data: { ativo: true } });
  revalidatePath("/insumos");
  updateTag("insumos-ativos");
}
