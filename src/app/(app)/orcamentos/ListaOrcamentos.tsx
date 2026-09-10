"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { StatusOrcamento } from "@prisma/client";
import { STATUS_ORCAMENTO_LABELS, STATUS_ORCAMENTO_ORDEM } from "@/lib/orcamentos";
import { atualizarStatusOrcamentosAction, removerOrcamentosAction } from "./actions";

export type OrcamentoListaItem = {
  id: string;
  nome: string;
  cliente: string;
  codigo: string | null;
  status: StatusOrcamento;
  totalFormatado: string;
  dataFormatada: string;
  bloqueado: boolean;
};

export function ListaOrcamentos({ orcamentos }: { orcamentos: OrcamentoListaItem[] }) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const selecionaveis = useMemo(() => orcamentos.filter((o) => !o.bloqueado), [orcamentos]);
  const todosSelecionados = selecionaveis.length > 0 && selecionaveis.every((o) => selecionados.has(o.id));

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(selecionaveis.map((o) => o.id)));
  }

  function limparSelecao() {
    setSelecionados(new Set());
  }

  function mudarStatus(status: string) {
    const ids = [...selecionados];
    startTransition(() => {
      atualizarStatusOrcamentosAction(ids, status);
    });
    limparSelecao();
  }

  function excluir() {
    const ids = [...selecionados];
    if (!window.confirm(`Excluir ${ids.length} orçamento(s) selecionado(s)? Essa ação não pode ser desfeita.`)) {
      return;
    }
    startTransition(() => {
      removerOrcamentosAction(ids);
    });
    limparSelecao();
  }

  return (
    <div className="flex flex-col gap-3">
      {selecionaveis.length > 0 && (
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
            {STATUS_ORCAMENTO_ORDEM.map((status) => (
              <option key={status} value={status}>
                {STATUS_ORCAMENTO_LABELS[status]}
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
        {orcamentos.map((orcamento) => {
          const marcado = selecionados.has(orcamento.id);
          return (
            <li
              key={orcamento.id}
              className={`flex items-center gap-3 rounded-lg border p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition ${
                marcado
                  ? "border-primary bg-primary-container/10"
                  : "border-tertiary-fixed bg-surface-container-lowest hover:border-primary"
              }`}
            >
              {orcamento.bloqueado ? (
                <span className="w-5 shrink-0" />
              ) : (
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => alternar(orcamento.id)}
                  aria-label={`Selecionar ${orcamento.nome}`}
                  className="h-6 w-6 shrink-0 cursor-pointer rounded border-outline-variant text-primary focus:ring-1 focus:ring-primary"
                />
              )}
              <Link
                href={`/orcamentos/${orcamento.id}`}
                className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-on-background">{orcamento.nome}</p>
                    {orcamento.codigo && (
                      <span className="rounded bg-tertiary-fixed px-1.5 py-0.5 text-xs font-semibold text-on-tertiary-fixed-variant">
                        {orcamento.codigo}
                      </span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant">{orcamento.cliente}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-body-md">
                  <span className="text-on-surface-variant">{orcamento.totalFormatado}</span>
                  <span className="rounded-lg bg-tertiary-fixed px-2 py-0.5 text-primary text-label-bold">
                    {STATUS_ORCAMENTO_LABELS[orcamento.status]}
                  </span>
                  <span className="text-on-surface-variant">{orcamento.dataFormatada}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
