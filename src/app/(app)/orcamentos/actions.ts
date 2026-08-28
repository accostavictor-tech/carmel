"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusOrcamento, CategoriaCusto } from "@prisma/client";
import { totalInsumosOrcamento, totalOrcamento } from "@/lib/orcamentos";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

export async function criarOrcamentoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const nome = String(formData.get("nome") ?? "").trim();
  const cliente = String(formData.get("cliente") ?? "").trim();

  if (!nome || !cliente) {
    throw new Error("Preencha nome e cliente do orçamento.");
  }

  const orcamento = await prisma.orcamento.create({
    data: { nome, cliente, responsavelId: session.user.id },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}`);
}

export async function atualizarStatusOrcamentoAction(orcamentoId: string, status: string) {
  if (!Object.values(StatusOrcamento).includes(status as StatusOrcamento)) {
    throw new Error("Status inválido.");
  }

  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: { status: status as StatusOrcamento },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
  revalidatePath("/orcamentos");
}

export async function atualizarImpostoOrcamentoAction(orcamentoId: string, formData: FormData) {
  const percentualImposto = numeroDeFormData(formData, "percentualImposto");

  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: { percentualImposto },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function criarAmbienteAction(orcamentoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentualInsumosGerais = numeroDeFormData(formData, "percentualInsumosGerais");
  const percentualLucro = numeroDeFormData(formData, "percentualLucro");

  if (!nome) {
    throw new Error("Dê um nome ao ambiente.");
  }

  const quantidadeAtual = await prisma.ambiente.count({ where: { orcamentoId } });

  await prisma.ambiente.create({
    data: {
      orcamentoId,
      nome,
      percentualInsumosGerais,
      percentualLucro,
      ordem: quantidadeAtual,
    },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function atualizarAmbienteAction(
  orcamentoId: string,
  ambienteId: string,
  formData: FormData
) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentualInsumosGerais = numeroDeFormData(formData, "percentualInsumosGerais");
  const percentualLucro = numeroDeFormData(formData, "percentualLucro");

  if (!nome) {
    throw new Error("Dê um nome ao ambiente.");
  }

  await prisma.ambiente.update({
    where: { id: ambienteId },
    data: { nome, percentualInsumosGerais, percentualLucro },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerAmbienteAction(orcamentoId: string, ambienteId: string) {
  await prisma.ambiente.delete({ where: { id: ambienteId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function adicionarItemAction(
  orcamentoId: string,
  ambienteId: string,
  formData: FormData
) {
  const insumoId = String(formData.get("insumoId") ?? "").trim();
  const quantidade = numeroDeFormData(formData, "quantidade");

  if (quantidade <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }

  if (insumoId) {
    const insumo = await prisma.insumo.findUnique({ where: { id: insumoId } });
    if (!insumo) throw new Error("Insumo não encontrado.");

    await prisma.itemAmbiente.create({
      data: {
        ambienteId,
        insumoId: insumo.id,
        descricao: insumo.nome,
        unidade: insumo.unidade,
        valorUnitario: insumo.valorUnitario,
        quantidade,
      },
    });
  } else {
    const descricao = String(formData.get("descricao") ?? "").trim();
    const unidade = String(formData.get("unidade") ?? "").trim();
    const valorUnitario = numeroDeFormData(formData, "valorUnitario");

    if (!descricao || !unidade || valorUnitario <= 0) {
      throw new Error("Preencha descrição, unidade e valor do item avulso.");
    }

    await prisma.itemAmbiente.create({
      data: { ambienteId, descricao, unidade, valorUnitario, quantidade },
    });
  }

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerItemAction(orcamentoId: string, itemId: string) {
  await prisma.itemAmbiente.delete({ where: { id: itemId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function adicionarEncargoAction(
  orcamentoId: string,
  ambienteId: string,
  formData: FormData
) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentual = numeroDeFormData(formData, "percentual");
  const nivel = Math.max(1, Math.round(numeroDeFormData(formData, "nivel")) || 1);

  if (!nome) {
    throw new Error("Dê um nome ao encargo.");
  }

  const quantidadeAtual = await prisma.encargoAmbiente.count({ where: { ambienteId } });

  await prisma.encargoAmbiente.create({
    data: { ambienteId, nome, percentual, nivel, ordem: quantidadeAtual },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerEncargoAction(orcamentoId: string, encargoId: string) {
  await prisma.encargoAmbiente.delete({ where: { id: encargoId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function aprovarOrcamentoAction(orcamentoId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orcamento = await prisma.orcamento.findUnique({
    where: { id: orcamentoId },
    include: { ambientes: { include: { itens: true, encargos: true } } },
  });

  if (!orcamento) throw new Error("Orçamento não encontrado.");
  if (orcamento.projetoId) throw new Error("Este orçamento já foi convertido em projeto.");

  const valorVenda = totalOrcamento(orcamento.ambientes);
  const totalInsumos = totalInsumosOrcamento(orcamento.ambientes);

  const hoje = new Date();
  const prazoEntrega = new Date(hoje);
  prazoEntrega.setDate(prazoEntrega.getDate() + 30);

  const projeto = await prisma.projeto.create({
    data: {
      nome: orcamento.nome,
      cliente: orcamento.cliente,
      valorVenda,
      percentualImposto: orcamento.percentualImposto,
      dataFechamento: hoje,
      prazoEntrega,
      responsavelId: session.user.id,
      orcamentosCusto:
        totalInsumos > 0
          ? { create: [{ categoria: CategoriaCusto.MATERIA_PRIMA, valor: totalInsumos }] }
          : undefined,
    },
  });

  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: { status: StatusOrcamento.APROVADO, projetoId: projeto.id },
  });

  revalidatePath("/orcamentos");
  revalidatePath("/projetos");
  revalidatePath("/");
  redirect(`/projetos/${projeto.id}`);
}
