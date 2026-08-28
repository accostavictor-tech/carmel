"use client";

import { useTransition } from "react";
import { StatusProducao } from "@/generated/prisma/enums";
import { STATUS_LABELS, STATUS_ORDEM } from "@/lib/projetos";
import { atualizarStatusAction } from "../actions";

export function StatusSelector({
  projetoId,
  statusAtual,
}: {
  projetoId: string;
  statusAtual: StatusProducao;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={statusAtual}
      disabled={pending}
      onChange={(e) => {
        const novoStatus = e.target.value;
        startTransition(() => {
          atualizarStatusAction(projetoId, novoStatus);
        });
      }}
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700 disabled:opacity-60"
    >
      {STATUS_ORDEM.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
