"use client";

import { useTransition } from "react";
import { StatusOrcamento } from "@prisma/client";
import { STATUS_ORCAMENTO_LABELS, STATUS_ORCAMENTO_ORDEM } from "@/lib/orcamentos";
import { atualizarStatusOrcamentoAction } from "../actions";

export function StatusOrcamentoSelector({
  orcamentoId,
  statusAtual,
  disabled,
}: {
  orcamentoId: string;
  statusAtual: StatusOrcamento;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={statusAtual}
      disabled={pending || disabled}
      onChange={(e) => {
        const novoStatus = e.target.value;
        startTransition(() => {
          atualizarStatusOrcamentoAction(orcamentoId, novoStatus);
        });
      }}
      className="rounded border border-tertiary-fixed bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary disabled:opacity-60"
    >
      {STATUS_ORCAMENTO_ORDEM.map((status) => (
        <option key={status} value={status}>
          {STATUS_ORCAMENTO_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
