"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { StatusOrcamento } from "@prisma/client";
import { STATUS_ORCAMENTO_LABELS, STATUS_ORCAMENTO_ORDEM } from "@/lib/orcamentos";
import { atualizarStatusOrcamentoAction } from "./actions";

export type OrcamentoKanbanItem = {
  id: string;
  nome: string;
  cliente: string;
  codigo: string | null;
  status: StatusOrcamento;
  totalFormatado: string;
  dataFormatada: string;
};

export function KanbanOrcamentos({ orcamentos }: { orcamentos: OrcamentoKanbanItem[] }) {
  const [itens, setItens] = useState(orcamentos);
  const [, startTransition] = useTransition();
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);

  function mover(id: string, novoStatus: StatusOrcamento) {
    setItens((atual) =>
      atual.map((o) => (o.id === id ? { ...o, status: novoStatus } : o))
    );
    startTransition(() => {
      atualizarStatusOrcamentoAction(id, novoStatus);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STATUS_ORCAMENTO_ORDEM.map((status) => {
        const doColuna = itens.filter((o) => o.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) mover(id, status);
              setArrastandoId(null);
            }}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-tertiary-fixed bg-surface-container-low p-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-label-bold uppercase tracking-wide text-on-surface-variant">
                {STATUS_ORCAMENTO_LABELS[status]}
              </h2>
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-xs font-semibold text-on-tertiary-fixed-variant">
                {doColuna.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {doColuna.map((orcamento) => (
                <Link
                  key={orcamento.id}
                  href={`/orcamentos/${orcamento.id}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", orcamento.id);
                    setArrastandoId(orcamento.id);
                  }}
                  onDragEnd={() => setArrastandoId(null)}
                  className={`flex flex-col gap-1.5 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-3 text-body-md shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition hover:border-primary ${
                    arrastandoId === orcamento.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-on-background">{orcamento.nome}</p>
                    {orcamento.codigo && (
                      <span className="rounded bg-tertiary-fixed px-1.5 py-0.5 text-xs font-semibold text-on-tertiary-fixed-variant">
                        {orcamento.codigo}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant">{orcamento.cliente}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-primary">{orcamento.totalFormatado}</span>
                    <span className="text-xs text-on-surface-variant">{orcamento.dataFormatada}</span>
                  </div>
                </Link>
              ))}

              {doColuna.length === 0 && (
                <p className="rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                  Nenhum orçamento
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
