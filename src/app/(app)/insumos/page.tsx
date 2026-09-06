import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIA_INSUMO_LABELS, CATEGORIA_INSUMO_ORDEM } from "@/lib/orcamentos";
import { CategoriaInsumo, Prisma } from "@prisma/client";
import {
  arquivarInsumoAction,
  atualizarInsumoAction,
  criarInsumoAction,
  reativarInsumoAction,
} from "./actions";
import { BuscaInsumo } from "./BuscaInsumo";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const INPUT_TABLE = "h-9 w-full rounded-md border border-tertiary-fixed bg-transparent px-2 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container";
const BTN_TEXT = "text-body-md font-medium text-primary transition hover:underline";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

const POR_PAGINA = 40;

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

function chavePagina(categoria: CategoriaInsumo | "ARQUIVADOS") {
  return `p_${categoria}`;
}

function construirQuery(atuais: Record<string, string | undefined>, mudanca: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries({ ...atuais, ...mudanca })) {
    if (valor) params.set(chave, valor);
  }
  const texto = params.toString();
  return texto ? `?${texto}` : "?";
}

function paginar<T>(lista: T[], pagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaValida - 1) * POR_PAGINA;
  return { itens: lista.slice(inicio, inicio + POR_PAGINA), totalPaginas, pagina: paginaValida };
}

export default async function InsumosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const termo = (params.q ?? "").trim();

  const insumos = await prisma.insumo.findMany({
    where: termo
      ? { nome: { contains: termo, mode: Prisma.QueryMode.insensitive } }
      : undefined,
    orderBy: { nome: "asc" },
  });
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

      <BuscaInsumo termoInicial={termo} />

      {ativos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          {termo ? `Nenhum insumo encontrado para "${termo}".` : "Nenhum insumo cadastrado ainda."}
        </p>
      ) : termo ? (
        <TabelaInsumos
          titulo={`Resultados para "${termo}"`}
          insumos={ativos}
          abertoPorPadrao
        />
      ) : (
        <div className="flex flex-col gap-4">
          {CATEGORIA_INSUMO_ORDEM.map((categoria, indice) => {
            const doGrupo = ativos.filter((i) => i.categoria === categoria);
            if (doGrupo.length === 0) return null;
            const pagina = Number(params[chavePagina(categoria)]) || 1;
            const { itens, totalPaginas, pagina: paginaAtual } = paginar(doGrupo, pagina);
            return (
              <TabelaInsumos
                key={categoria}
                titulo={CATEGORIA_INSUMO_LABELS[categoria]}
                insumos={itens}
                total={doGrupo.length}
                abertoPorPadrao={indice === 0}
                paginacao={{
                  paginaAtual,
                  totalPaginas,
                  hrefAnterior: construirQuery(params, { [chavePagina(categoria)]: String(paginaAtual - 1) }),
                  hrefProxima: construirQuery(params, { [chavePagina(categoria)]: String(paginaAtual + 1) }),
                }}
              />
            );
          })}
        </div>
      )}

      {!termo && arquivados.length > 0 && (
        <TabelaInsumos titulo="Arquivados" insumos={arquivados} abertoPorPadrao={false} />
      )}
    </div>
  );
}

function TabelaInsumos({
  titulo,
  insumos,
  total,
  abertoPorPadrao,
  paginacao,
}: {
  titulo: string;
  insumos: InsumoRow[];
  total?: number;
  abertoPorPadrao: boolean;
  paginacao?: {
    paginaAtual: number;
    totalPaginas: number;
    hrefAnterior: string;
    hrefProxima: string;
  };
}) {
  return (
    <details open={abertoPorPadrao} className="group flex flex-col gap-3">
      <summary className={`cursor-pointer list-none ${FIELD_LABEL}`}>
        <span className="inline-block transition group-open:rotate-90">▸</span> {titulo}{" "}
        <span className="normal-case text-on-surface-variant">({total ?? insumos.length})</span>
      </summary>

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

      {paginacao && paginacao.totalPaginas > 1 && (
        <div className="flex items-center justify-end gap-3 text-body-md text-on-surface-variant">
          <span>
            Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
          </span>
          {paginacao.paginaAtual > 1 ? (
            <Link href={paginacao.hrefAnterior} className={BTN_TEXT}>
              Anterior
            </Link>
          ) : (
            <span className="opacity-40">Anterior</span>
          )}
          {paginacao.paginaAtual < paginacao.totalPaginas ? (
            <Link href={paginacao.hrefProxima} className={BTN_TEXT}>
              Próxima
            </Link>
          ) : (
            <span className="opacity-40">Próxima</span>
          )}
        </div>
      )}
    </details>
  );
}
