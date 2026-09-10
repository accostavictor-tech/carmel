"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { StatusProducao } from "@prisma/client";
import { STATUS_LABELS, STATUS_ORDEM } from "@/lib/projetos";
import { atualizarStatusProjetosAction, removerProjetosAction } from "./actions";

export type ProjetoListaItem = {
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

export function ListaProjetos({ projetos }: { projetos: ProjetoListaItem[] }) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const todosSelecionados = projetos.length > 0 && projetos.every((p) => selecionados.has(p.id));

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(projetos.map((p) => p.id)));
  }

  function limparSelecao() {
    setSelecionados(new Set());
  }

  function mudarStatus(status: string) {
    const ids = [...selecionados];
    startTransition(() => {
      atualizarStatusProjetosAction(ids, status);
    });
    limparSelecao();
  }

  function excluir() {
    const ids = [...selecionados];
    if (!window.confirm(`Excluir ${ids.length} projeto(s) selecionado(s)? Essa ação não pode ser desfeita.`)) {
      return;
    }
    startTransition(() => {
      removerProjetosAction(ids);
    });
    limparSelecao();
  }

  return (
    <div className="flex flex-col gap-3">
      {projetos.length > 0 && (
        <div className="flex items-center gap-3 border-b border-tertiary-fixed pb-3 text-body-md">
          <input
            type="checkbox"
            checked={todosSelecionados}
            onChange={alternarTodos}
            aria-label="Selecionar todos"
            className="h-6 w-6 shrink-0 cursor-pointer rounded border-outline-variant text-primary focus:ring-1 focus:ring-primary"
          />
          <span className="text-on-surface-variant">Selecionar todos</span>
        </div>
      )}

      {selecionados.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-tertiary-fixed bg-tertiary-fixed px-4 py-3 text-body-md">
          <span className="font-medium text-on-tertiary-fixed-variant">
            {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}
          </span>
          <select
            disabled={pending}
            defaultValue=""
            onChange={(e) => e.target.value && mudarStatus(e.target.value)}
            className="h-9 rounded-md border border-tertiary-fixed bg-surface-container-lowest px-2 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
          >
            <option value="" disabled>
              Mudar status para...
            </option>
            {STATUS_ORDEM.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={excluir}
            className="text-body-md font-medium text-error transition hover:underline disabled:opacity-60"
          >
            Excluir
          </button>
          <button
            type="button"
            onClick={limparSelecao}
            className="ml-auto text-body-md text-on-surface-variant transition hover:underline"
          >
            Limpar seleção
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {projetos.map((projeto) => {
          const marcado = selecionados.has(projeto.id);
          return (
            <li
              key={projeto.id}
              className={`flex items-center gap-3 rounded-lg border p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition ${
                marcado
                  ? "border-primary bg-primary-container/10"
                  : "border-tertiary-fixed bg-surface-container-lowest hover:border-primary"
              }`}
            >
              <input
                type="checkbox"
                checked={marcado}
                onChange={() => alternar(projeto.id)}
                aria-label={`Selecionar ${projeto.nome}`}
                className="h-6 w-6 shrink-0 cursor-pointer rounded border-outline-variant text-primary focus:ring-1 focus:ring-primary"
              />
              <Link
                href={`/projetos/${projeto.id}`}
                className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display font-semibold text-on-background">{projeto.nome}</p>
                  <p className="text-body-md text-on-surface-variant">{projeto.cliente}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-body-md">
                  <span className="text-on-surface-variant">{projeto.valorFormatado}</span>
                  <span className={projeto.margemNegativa ? "font-medium text-error" : "text-on-surface-variant"}>
                    {projeto.margemFormatada}
                  </span>
                  <span className="rounded-lg bg-tertiary-fixed px-2 py-0.5 text-primary text-label-bold">
                    {STATUS_LABELS[projeto.status]}
                  </span>
                  <span className={projeto.atrasado ? "font-medium text-error" : "text-on-surface-variant"}>
                    Prazo: {projeto.prazoFormatado}
                    {projeto.atrasado ? " (atrasado)" : ""}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
