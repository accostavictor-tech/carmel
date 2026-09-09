"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

export async function criarFormaPagamentoAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentual = numeroDeFormData(formData, "percentual");

  if (!nome) {
    throw new Error("Dê um nome à forma de pagamento.");
  }

  const quantidadeAtual = await prisma.formaPagamento.count();

  await prisma.formaPagamento.create({
    data: { nome, percentual, ordem: quantidadeAtual },
  });

  revalidatePath("/formas-pagamento");
  updateTag("formas-pagamento-ativas");
}

export async function atualizarFormaPagamentoAction(formaPagamentoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentual = numeroDeFormData(formData, "percentual");

  if (!nome) {
    throw new Error("Dê um nome à forma de pagamento.");
  }

  await prisma.formaPagamento.update({
    where: { id: formaPagamentoId },
    data: { nome, percentual },
  });

  revalidatePath("/formas-pagamento");
  updateTag("formas-pagamento-ativas");
}

export async function arquivarFormaPagamentoAction(formaPagamentoId: string) {
  await prisma.formaPagamento.update({ where: { id: formaPagamentoId }, data: { ativo: false } });
  revalidatePath("/formas-pagamento");
  updateTag("formas-pagamento-ativas");
}

export async function reativarFormaPagamentoAction(formaPagamentoId: string) {
  await prisma.formaPagamento.update({ where: { id: formaPagamentoId }, data: { ativo: true } });
  revalidatePath("/formas-pagamento");
  updateTag("formas-pagamento-ativas");
}
