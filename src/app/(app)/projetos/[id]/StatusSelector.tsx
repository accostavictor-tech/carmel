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
      className="rounded border border-tertiary-fixed bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary disabled:opacity-60"
    >
      {STATUS_ORDEM.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
