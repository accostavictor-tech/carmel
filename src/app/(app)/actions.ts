"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function definirMetaAction(formData: FormData) {
  const ano = Number(formData.get("ano"));
  const mes = Number(formData.get("mes"));
  const valorMeta = Number(String(formData.get("valorMeta") ?? "0").replace(",", "."));

  if (!ano || !mes || !Number.isFinite(valorMeta) || valorMeta <= 0) {
    throw new Error("Informe uma meta válida.");
  }

  await prisma.metaMensal.upsert({
    where: { ano_mes: { ano, mes } },
    update: { valorMeta },
    create: { ano, mes, valorMeta },
  });

  revalidatePath("/");
}
