"use client";

import { useTransition } from "react";
import { StatusProducao } from "@prisma/client";
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
      className="h-10 rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
    >
      {STATUS_ORDEM.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
