import { prisma } from "@/lib/prisma";
import { CATEGORIA_INSUMO_LABELS, CATEGORIA_INSUMO_ORDEM } from "@/lib/orcamentos";
import { CategoriaInsumo } from "@prisma/client";
import {
  arquivarInsumoAction,
  atualizarInsumoAction,
  criarInsumoAction,
  reativarInsumoAction,
} from "./actions";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const INPUT_TABLE = "h-9 w-full rounded-md border border-tertiary-fixed bg-transparent px-2 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container";
const BTN_TEXT = "text-body-md font-medium text-primary transition hover:underline";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

type InsumoRow = {
  id: string;
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  valorUnitario: number;
  percentualPerda: number;
  ativo: boolean;
};

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default async function InsumosPage() {
  const insumos = await prisma.insumo.findMany({ orderBy: { nome: "asc" } });
  const ativos = insumos.filter((i) => i.ativo);
  const arquivados = insumos.filter((i) => !i.ativo);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg text-on-background">Insumos</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Catálogo de materiais e ferragens usado para montar os orçamentos. Atualize o preço aqui
          quando o fornecedor mudar — os orçamentos já criados mantêm o preço da época.
        </p>
      </div>

      <form action={criarInsumoAction} className={`grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] sm:items-end ${CARD}`}>
        <Field label="Categoria" htmlFor="novo-categoria">
          <select id="novo-categoria" name="categoria" defaultValue="MDF" className={INPUT}>
            {CATEGORIA_INSUMO_ORDEM.map((categoria) => (
              <option key={categoria} value={categoria}>
                {CATEGORIA_INSUMO_LABELS[categoria]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nome do insumo" htmlFor="novo-nome">
          <input id="novo-nome" name="nome" required className={INPUT} />
        </Field>
        <Field label="Unidade" htmlFor="novo-unidade">
          <input id="novo-unidade" name="unidade" placeholder="m², unid, par..." required className={INPUT} />
        </Field>
        <Field label="Valor (R$)" htmlFor="novo-valor">
          <input
            id="novo-valor"
            name="valorUnitario"
            type="number"
            step="0.01"
            min="0"
            required
            className={INPUT}
          />
        </Field>
        <Field label="Perda (%)" htmlFor="novo-perda">
          <input
            id="novo-perda"
            name="percentualPerda"
            type="number"
            step="0.01"
            min="0"
            defaultValue={0}
            className={INPUT}
          />
        </Field>
        <button type="submit" className={BTN_PRIMARY}>
          Adicionar
        </button>
      </form>

      {ativos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum insumo cadastrado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORIA_INSUMO_ORDEM.map((categoria) => {
            const doGrupo = ativos.filter((i) => i.categoria === categoria);
            if (doGrupo.length === 0) return null;
            return (
              <TabelaInsumos key={categoria} titulo={CATEGORIA_INSUMO_LABELS[categoria]} insumos={doGrupo} />
            );
          })}
        </div>
      )}

      {arquivados.length > 0 && <TabelaInsumos titulo="Arquivados" insumos={arquivados} />}
    </div>
  );
}

function TabelaInsumos({ titulo, insumos }: { titulo: string; insumos: InsumoRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={FIELD_LABEL}>{titulo}</h2>

      <div className="overflow-x-auto rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]">
        <table className="w-full min-w-[680px] text-body-md">
          <thead>
            <tr className="border-b border-tertiary-fixed bg-surface-container-low text-left">
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Categoria</th>
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Nome</th>
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Unidade</th>
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Valor</th>
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Perda (%)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((insumo) => {
              const atualizarComId = atualizarInsumoAction.bind(null, insumo.id);
              const arquivarComId = arquivarInsumoAction.bind(null, insumo.id);
              const reativarComId = reativarInsumoAction.bind(null, insumo.id);
              const formId = `insumo-${insumo.id}`;
              return (
                <tr key={insumo.id} className="border-b border-tertiary-fixed last:border-0">
                  <td className="px-4 py-2.5">
                    <select form={formId} name="categoria" defaultValue={insumo.categoria} className={INPUT_TABLE}>
                      {CATEGORIA_INSUMO_ORDEM.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {CATEGORIA_INSUMO_LABELS[categoria]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <input form={formId} name="nome" defaultValue={insumo.nome} className={INPUT_TABLE} />
                  </td>
                  <td className="px-4 py-2.5">
                    <input form={formId} name="unidade" defaultValue={insumo.unidade} className={INPUT_TABLE} />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      form={formId}
                      name="valorUnitario"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={insumo.valorUnitario}
                      className={INPUT_TABLE}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      form={formId}
                      name="percentualPerda"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={insumo.percentualPerda}
                      className={INPUT_TABLE}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-4">
                      <form id={formId} action={atualizarComId} />
                      <button form={formId} type="submit" className={BTN_TEXT}>
                        Salvar
                      </button>
                      <form action={insumo.ativo ? arquivarComId : reativarComId}>
                        <button type="submit" className={BTN_TEXT_DANGER}>
                          {insumo.ativo ? "Arquivar" : "Reativar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
