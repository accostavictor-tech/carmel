"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { StatusProducao } from "@prisma/client";
import { STATUS_LABELS, STATUS_ORDEM } from "@/lib/projetos";
import { atualizarStatusAction } from "./actions";

export type ProjetoKanbanItem = {
  id: string;
  nome: string;
  cliente: string;
  status: StatusProducao;
  valorFormatado: string;
  margemFormatada: string;
  margemNegativa: boolean;
  prazoFormatado: string;
  atrasado: boolean;
};

export function KanbanProjetos({ projetos }: { projetos: ProjetoKanbanItem[] }) {
  const [itens, setItens] = useState(projetos);
  const [, startTransition] = useTransition();
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);

  function mover(id: string, novoStatus: StatusProducao) {
    setItens((atual) =>
      atual.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
    );
    startTransition(() => {
      atualizarStatusAction(id, novoStatus);
    });
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {STATUS_ORDEM.map((status) => {
        const doColuna = itens.filter((p) => p.status === status);
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
            className="flex w-[85vw] shrink-0 snap-center flex-col gap-3 rounded-lg border border-tertiary-fixed bg-surface-container-low p-3 sm:w-72"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-label-bold uppercase tracking-wide text-on-surface-variant">
                {STATUS_LABELS[status]}
              </h2>
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-xs font-semibold text-on-tertiary-fixed-variant">
                {doColuna.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {doColuna.map((projeto) => (
                <Link
                  key={projeto.id}
                  href={`/projetos/${projeto.id}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", projeto.id);
                    setArrastandoId(projeto.id);
                  }}
                  onDragEnd={() => setArrastandoId(null)}
                  className={`flex flex-col gap-1.5 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-3 text-body-md shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition hover:border-primary ${
                    arrastandoId === projeto.id ? "opacity-50" : ""
                  }`}
                >
                  <p className="font-display font-semibold text-on-background">{projeto.nome}</p>
                  <p className="text-on-surface-variant">{projeto.cliente}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-primary">{projeto.valorFormatado}</span>
                    <span className={projeto.margemNegativa ? "text-xs font-medium text-error" : "text-xs text-on-surface-variant"}>
                      {projeto.margemFormatada}
                    </span>
                  </div>
                  <span className={projeto.atrasado ? "text-xs font-medium text-error" : "text-xs text-on-surface-variant"}>
                    Prazo: {projeto.prazoFormatado}
                    {projeto.atrasado ? " (atrasado)" : ""}
                  </span>
                </Link>
              ))}

              {doColuna.length === 0 && (
                <p className="rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                  Nenhum projeto
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
