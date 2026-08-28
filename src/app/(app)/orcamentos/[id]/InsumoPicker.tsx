"use client";

import { useMemo, useState } from "react";
import { formatarMoeda } from "@/lib/format";
import { CATEGORIA_INSUMO_LABELS, CATEGORIA_INSUMO_ORDEM } from "@/lib/orcamentos";
import type { CategoriaInsumo } from "@prisma/client";

type Insumo = {
  id: string;
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  valorUnitario: number;
  percentualPerda: number;
};

const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest pl-3 pr-9 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const LIMITE_BUSCA = 40;

function rotuloInsumo(insumo: Insumo) {
  const perda = insumo.percentualPerda > 0 ? `, ${insumo.percentualPerda}% perda` : "";
  return `${insumo.nome} (${insumo.unidade}${perda}) · ${formatarMoeda(insumo.valorUnitario)}`;
}

function OpcaoInsumo({ insumo, onSelect }: { insumo: Insumo; onSelect: (insumo: Insumo) => void }) {
  return (
    <li>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSelect(insumo)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-md hover:bg-surface-container-low"
      >
        <span className="text-on-background">{insumo.nome}</span>
        <span className="shrink-0 text-on-surface-variant">
          {insumo.unidade}
          {insumo.percentualPerda > 0 ? ` · ${insumo.percentualPerda}% perda` : ""} · {formatarMoeda(insumo.valorUnitario)}
        </span>
      </button>
    </li>
  );
}

export function InsumoPicker({
  insumos,
  name,
  id,
}: {
  insumos: Insumo[];
  name: string;
  id?: string;
}) {
  const [texto, setTexto] = useState("");
  const [selecionado, setSelecionado] = useState<{ id: string; label: string } | null>(null);
  const [aberto, setAberto] = useState(false);

  const termo = texto.trim().toLowerCase();

  const resultadosBusca = useMemo(() => {
    if (!termo) return [];
    return insumos.filter((i) => i.nome.toLowerCase().includes(termo)).slice(0, LIMITE_BUSCA);
  }, [termo, insumos]);

  const gruposParaNavegar = useMemo(() => {
    if (termo) return [];
    return CATEGORIA_INSUMO_ORDEM.map((categoria) => ({
      categoria,
      itens: insumos.filter((i) => i.categoria === categoria),
    })).filter((grupo) => grupo.itens.length > 0);
  }, [termo, insumos]);

  function selecionar(insumo: Insumo) {
    setSelecionado({ id: insumo.id, label: rotuloInsumo(insumo) });
    setTexto("");
    setAberto(false);
  }

  return (
    <div className="relative">
      <input
        id={id}
        value={selecionado ? selecionado.label : texto}
        onChange={(e) => {
          setSelecionado(null);
          setTexto(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Buscar ou clique para escolher da lista..."
        autoComplete="off"
        className={INPUT}
      />
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setAberto((v) => !v)}
        aria-label="Abrir lista de insumos"
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-on-surface-variant"
      >
        <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${aberto ? "rotate-180" : ""}`}>
          <path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <input type="hidden" name={name} value={selecionado?.id ?? ""} />

      {aberto && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-tertiary-fixed bg-surface-container-lowest shadow-lg">
          {termo ? (
            <ul>
              {resultadosBusca.length === 0 ? (
                <li className="px-3 py-2 text-body-md text-on-surface-variant">Nenhum insumo encontrado.</li>
              ) : (
                resultadosBusca.map((insumo) => (
                  <OpcaoInsumo key={insumo.id} insumo={insumo} onSelect={selecionar} />
                ))
              )}
            </ul>
          ) : gruposParaNavegar.length === 0 ? (
            <p className="px-3 py-2 text-body-md text-on-surface-variant">Nenhum insumo cadastrado.</p>
          ) : (
            gruposParaNavegar.map((grupo) => (
              <div key={grupo.categoria}>
                <p className="sticky top-0 bg-surface-container-low px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {CATEGORIA_INSUMO_LABELS[grupo.categoria]}
                </p>
                <ul>
                  {grupo.itens.map((insumo) => (
                    <OpcaoInsumo key={insumo.id} insumo={insumo} onSelect={selecionar} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
