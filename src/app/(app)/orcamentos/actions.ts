"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusOrcamento, CategoriaCusto } from "@prisma/client";
import { totalInsumosOrcamento, totalOrcamento } from "@/lib/orcamentos";
import { gerarLinkToken } from "@/lib/compartilhamento";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

function textoOpcionalDeFormData(formData: FormData, campo: string): string | null {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor || null;
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
    data: {
      nome,
      cliente,
      clienteEmpresa: textoOpcionalDeFormData(formData, "clienteEmpresa"),
      clienteTelefone: textoOpcionalDeFormData(formData, "clienteTelefone"),
      clienteEmail: textoOpcionalDeFormData(formData, "clienteEmail"),
      responsavelId: session.user.id,
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}`);
}

export async function atualizarContatoOrcamentoAction(orcamentoId: string, formData: FormData) {
  const cliente = String(formData.get("cliente") ?? "").trim();

  if (!cliente) {
    throw new Error("Informe o nome do contato.");
  }

  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: {
      cliente,
      clienteEmpresa: textoOpcionalDeFormData(formData, "clienteEmpresa"),
      clienteTelefone: textoOpcionalDeFormData(formData, "clienteTelefone"),
      clienteEmail: textoOpcionalDeFormData(formData, "clienteEmail"),
    },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
  revalidatePath("/orcamentos");
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

  if (!nome) {
    throw new Error("Dê um nome ao ambiente.");
  }

  const quantidadeAtual = await prisma.ambiente.count({ where: { orcamentoId } });

  await prisma.ambiente.create({
    data: { orcamentoId, nome, ordem: quantidadeAtual },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function atualizarAmbienteAction(
  orcamentoId: string,
  ambienteId: string,
  formData: FormData
) {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    throw new Error("Dê um nome ao ambiente.");
  }

  await prisma.ambiente.update({
    where: { id: ambienteId },
    data: { nome },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerAmbienteAction(orcamentoId: string, ambienteId: string) {
  await prisma.ambiente.delete({ where: { id: ambienteId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function criarItemAction(orcamentoId: string, ambienteId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    throw new Error("Dê um nome ao item.");
  }

  const quantidadeAtual = await prisma.item.count({ where: { ambienteId } });

  await prisma.item.create({
    data: { ambienteId, nome, ordem: quantidadeAtual },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function atualizarItemAction(orcamentoId: string, itemId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    throw new Error("Dê um nome ao item.");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { nome, descricao: textoOpcionalDeFormData(formData, "descricao") },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function atualizarPercentuaisItemAction(
  orcamentoId: string,
  itemId: string,
  formData: FormData
) {
  const percentualInsumosGerais = numeroDeFormData(formData, "percentualInsumosGerais");
  const percentualLucro = Math.min(numeroDeFormData(formData, "percentualLucro"), 99.99);

  await prisma.item.update({
    where: { id: itemId },
    data: { percentualInsumosGerais, percentualLucro },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerItemAction(orcamentoId: string, itemId: string) {
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function adicionarMaterialAction(
  orcamentoId: string,
  itemId: string,
  formData: FormData
) {
  const insumoId = String(formData.get("insumoId") ?? "").trim();
  const quantidade = numeroDeFormData(formData, "quantidade");

  if (quantidade <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }
  if (!insumoId) {
    throw new Error("Escolha um insumo do catálogo (ou cadastre um novo pelo próprio campo de busca).");
  }

  const insumo = await prisma.insumo.findUnique({ where: { id: insumoId } });
  if (!insumo) throw new Error("Insumo não encontrado.");

  await prisma.itemMaterial.create({
    data: {
      itemId,
      insumoId: insumo.id,
      descricao: insumo.nome,
      unidade: insumo.unidade,
      valorUnitario: insumo.valorUnitario,
      percentualPerda: insumo.percentualPerda,
      quantidade,
    },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerMaterialAction(orcamentoId: string, materialId: string) {
  await prisma.itemMaterial.delete({ where: { id: materialId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function adicionarEncargoOrcamentoAction(orcamentoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const percentual = numeroDeFormData(formData, "percentual");
  const nivel = Math.max(1, Math.round(numeroDeFormData(formData, "nivel")) || 1);

  if (!nome) {
    throw new Error("Dê um nome ao encargo.");
  }

  const quantidadeAtual = await prisma.encargoOrcamento.count({ where: { orcamentoId } });

  await prisma.encargoOrcamento.create({
    data: { orcamentoId, nome, percentual, nivel, ordem: quantidadeAtual },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function removerEncargoOrcamentoAction(orcamentoId: string, encargoId: string) {
  await prisma.encargoOrcamento.delete({ where: { id: encargoId } });
  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function gerarLinkCompartilhamentoAction(orcamentoId: string) {
  const orcamento = await prisma.orcamento.findUnique({ where: { id: orcamentoId } });
  if (!orcamento) throw new Error("Orçamento não encontrado.");

  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: {
      linkToken: orcamento.linkToken ?? gerarLinkToken(),
      compartilhadoEm: orcamento.compartilhadoEm ?? new Date(),
      status: orcamento.status === StatusOrcamento.RASCUNHO ? StatusOrcamento.ENVIADO : orcamento.status,
    },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
  revalidatePath("/orcamentos");
}

export async function renovarPrazoCompartilhamentoAction(orcamentoId: string) {
  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: { compartilhadoEm: new Date() },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function revogarLinkCompartilhamentoAction(orcamentoId: string) {
  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: { linkToken: null, compartilhadoEm: null },
  });

  revalidatePath(`/orcamentos/${orcamentoId}`);
}

export async function aprovarOrcamentoAction(orcamentoId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orcamento = await prisma.orcamento.findUnique({
    where: { id: orcamentoId },
    include: { ambientes: { include: { itens: { include: { materiais: true } } } }, encargos: true },
  });

  if (!orcamento) throw new Error("Orçamento não encontrado.");
  if (orcamento.projetoId) throw new Error("Este orçamento já foi convertido em projeto.");

  const valorVenda = totalOrcamento(orcamento.ambientes, orcamento.encargos);
  const totalInsumos = totalInsumosOrcamento(orcamento.ambientes, orcamento.encargos);

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
