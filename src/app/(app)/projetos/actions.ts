"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusProducao, CategoriaCusto, StatusOrcamento } from "@prisma/client";

function numeroDeFormData(formData: FormData, campo: string): number {
  const bruto = String(formData.get(campo) ?? "0").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : 0;
}

export async function criarProjetoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const nome = String(formData.get("nome") ?? "").trim();
  const cliente = String(formData.get("cliente") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valorVenda = numeroDeFormData(formData, "valorVenda");
  const percentualImposto = numeroDeFormData(formData, "percentualImposto");
  const dataFechamento = String(formData.get("dataFechamento") ?? "");
  const prazoEntrega = String(formData.get("prazoEntrega") ?? "");

  if (!nome || !cliente || !dataFechamento || !prazoEntrega) {
    throw new Error("Preencha os campos obrigatórios.");
  }

  const orcamentos = Object.values(CategoriaCusto)
    .map((categoria) => ({
      categoria,
      valor: numeroDeFormData(formData, `orcamento_${categoria}`),
    }))
    .filter((o) => o.valor > 0);

  const projeto = await prisma.projeto.create({
    data: {
      nome,
      cliente,
      descricao: descricao || null,
      valorVenda,
      percentualImposto,
      dataFechamento: new Date(dataFechamento),
      prazoEntrega: new Date(prazoEntrega),
      responsavelId: session.user.id,
      orcamentosCusto: { create: orcamentos },
    },
  });

  revalidatePath("/projetos");
  revalidatePath("/");
  redirect(`/projetos/${projeto.id}`);
}

export async function atualizarStatusAction(projetoId: string, status: string) {
  if (!Object.values(StatusProducao).includes(status as StatusProducao)) {
    throw new Error("Status inválido.");
  }

  await prisma.projeto.update({
    where: { id: projetoId },
    data: {
      statusProducao: status as StatusProducao,
      dataEntregaReal: status === StatusProducao.CONCLUIDO ? new Date() : null,
    },
  });

  revalidatePath(`/projetos/${projetoId}`);
  revalidatePath("/projetos");
  revalidatePath("/");
}

export async function adicionarCustoAction(projetoId: string, formData: FormData) {
  const categoria = String(formData.get("categoria") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = numeroDeFormData(formData, "valor");

  if (!Object.values(CategoriaCusto).includes(categoria as CategoriaCusto)) {
    throw new Error("Categoria inválida.");
  }
  if (!descricao || valor <= 0) {
    throw new Error("Preencha descrição e valor do custo.");
  }

  await prisma.custo.create({
    data: {
      projetoId,
      categoria: categoria as CategoriaCusto,
      descricao,
      valor,
    },
  });

  revalidatePath(`/projetos/${projetoId}`);
  revalidatePath("/projetos");
  revalidatePath("/");
}

export async function removerCustoAction(projetoId: string, custoId: string) {
  await prisma.custo.delete({ where: { id: custoId } });

  revalidatePath(`/projetos/${projetoId}`);
  revalidatePath("/projetos");
  revalidatePath("/");
}

export async function atualizarStatusProjetosAction(ids: string[], status: string) {
  if (ids.length === 0) return;
  if (!Object.values(StatusProducao).includes(status as StatusProducao)) {
    throw new Error("Status inválido.");
  }

  await prisma.projeto.updateMany({
    where: { id: { in: ids } },
    data: {
      statusProducao: status as StatusProducao,
      dataEntregaReal: status === StatusProducao.CONCLUIDO ? new Date() : null,
    },
  });

  revalidatePath("/projetos");
  revalidatePath("/");
}

export async function removerProjetosAction(ids: string[]) {
  if (ids.length === 0) return;

  const projetos = await prisma.projeto.findMany({
    where: { id: { in: ids } },
    include: { orcamento: true },
  });

  await prisma.$transaction([
    ...projetos
      .filter((p) => p.orcamento)
      .map((p) =>
        prisma.orcamento.update({
          where: { id: p.orcamento!.id },
          data: { status: StatusOrcamento.ENVIADO },
        })
      ),
    prisma.projeto.deleteMany({ where: { id: { in: ids } } }),
  ]);

  revalidatePath("/projetos");
  revalidatePath("/orcamentos");
  revalidatePath("/");
}
