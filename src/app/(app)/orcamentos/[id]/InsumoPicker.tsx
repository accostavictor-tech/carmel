"use client";

import { useMemo, useState } from "react";
import { formatarMoeda } from "@/lib/format";
import { CATEGORIA_INSUMO_LABELS } from "@/lib/orcamentos";
import type { CategoriaInsumo } from "@prisma/client";

type Insumo = {
  id: string;
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  valorUnitario: number;
};

const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

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

  const resultados = useMemo(() => {
    const termo = texto.trim().toLowerCase();
    if (!termo) return [];
    return insumos.filter((i) => i.nome.toLowerCase().includes(termo)).slice(0, 30);
  }, [texto, insumos]);

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
        placeholder="Buscar insumo do catálogo..."
        autoComplete="off"
        className={INPUT}
      />
      <input type="hidden" name={name} value={selecionado?.id ?? ""} />

      {aberto && texto.trim() && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-tertiary-fixed bg-surface-container-lowest shadow-lg">
          {resultados.length === 0 ? (
            <li className="px-3 py-2 text-body-md text-on-surface-variant">Nenhum insumo encontrado.</li>
          ) : (
            resultados.map((insumo) => (
              <li key={insumo.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelecionado({
                      id: insumo.id,
                      label: `${insumo.nome} (${insumo.unidade}) · ${formatarMoeda(insumo.valorUnitario)}`,
                    });
                    setTexto("");
                    setAberto(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-md hover:bg-surface-container-low"
                >
                  <span className="text-on-background">{insumo.nome}</span>
                  <span className="shrink-0 text-on-surface-variant">
                    {CATEGORIA_INSUMO_LABELS[insumo.categoria]} · {formatarMoeda(insumo.valorUnitario)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
