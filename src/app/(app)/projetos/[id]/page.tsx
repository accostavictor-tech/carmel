import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import {
  CATEGORIA_LABELS,
  CATEGORIA_ORDEM,
  calcularImposto,
  calcularLucro,
  calcularMargem,
  calcularValorLiquido,
  estaAtrasado,
  resumoPorCategoria,
  totalCustos,
  totalOrcado,
} from "@/lib/projetos";
import { adicionarCustoAction, removerCustoAction } from "../actions";
import { StatusSelector } from "./StatusSelector";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

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

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const projeto = await prisma.projeto.findUnique({
    where: { id },
    include: {
      custos: { orderBy: { data: "desc" } },
      orcamentosCusto: true,
      responsavel: true,
    },
  });

  if (!projeto) notFound();

  const custos = totalCustos(projeto);
  const imposto = calcularImposto(projeto);
  const liquido = calcularValorLiquido(projeto);
  const lucro = calcularLucro(projeto);
  const margem = calcularMargem(projeto);
  const atrasado = estaAtrasado(projeto);
  const resumoCategorias = resumoPorCategoria(projeto.custos, projeto.orcamentosCusto);
  const orcadoTotal = totalOrcado(projeto.orcamentosCusto);

  const adicionarCustoComId = adicionarCustoAction.bind(null, projeto.id);
  const removerCustoComId = removerCustoAction.bind(null, projeto.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-on-background">{projeto.nome}</h1>
        <p className="text-body-md text-on-surface-variant">{projeto.cliente}</p>
        {projeto.descricao && <p className="mt-1 text-body-md text-on-surface-variant">{projeto.descricao}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card
          titulo="Valor de venda"
          valor={formatarMoeda(projeto.valorVenda)}
          subtitulo={
            projeto.percentualImposto > 0
              ? `Líquido (-${projeto.percentualImposto}%): ${formatarMoeda(liquido)}`
              : undefined
          }
        />
        <Card
          titulo="Custos lançados"
          valor={formatarMoeda(custos)}
          subtitulo={orcadoTotal > 0 ? `Orçado: ${formatarMoeda(orcadoTotal)}` : undefined}
        />
        <Card
          titulo="Lucro"
          valor={formatarMoeda(lucro)}
          destaque={lucro < 0 ? "negativo" : "positivo"}
        />
        <Card
          titulo="Margem"
          valor={margem !== null ? `${margem.toFixed(1)}%` : "—"}
          destaque={margem !== null && margem < 0 ? "negativo" : undefined}
        />
      </div>

      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${CARD}`}>
        <div className="flex flex-col gap-1 text-body-md">
          <span className="text-on-surface-variant">
            Fechado em {formatarData(projeto.dataFechamento)} · Prazo {formatarData(projeto.prazoEntrega)}
          </span>
          {projeto.percentualImposto > 0 && (
            <span className="text-on-surface-variant">
              Imposto/comissão: {formatarMoeda(imposto)} ({projeto.percentualImposto}%)
            </span>
          )}
          {atrasado && <span className="font-medium text-error">Projeto atrasado</span>}
          {projeto.responsavel && (
            <span className="text-on-surface-variant">Responsável: {projeto.responsavel.nome}</span>
          )}
        </div>

        <Field label="Status de produção">
          <StatusSelector projetoId={projeto.id} statusAtual={projeto.statusProducao} />
        </Field>
      </div>

      {resumoCategorias.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-label-bold text-on-background">Orçado x realizado</h2>
          <div className={`overflow-x-auto ${CARD}`}>
            <table className="w-full min-w-[480px] text-body-md">
              <thead>
                <tr className="border-b border-tertiary-fixed text-left text-on-surface-variant">
                  <th className="pb-2 font-normal">Categoria</th>
                  <th className="pb-2 font-normal">Orçado</th>
                  <th className="pb-2 font-normal">Realizado</th>
                  <th className="pb-2 font-normal">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {resumoCategorias.map((r) => (
                  <tr key={r.categoria} className="border-b border-tertiary-fixed last:border-0">
                    <td className="py-2 text-on-background">{CATEGORIA_LABELS[r.categoria]}</td>
                    <td className="py-2 text-on-surface-variant">{formatarMoeda(r.orcado)}</td>
                    <td className="py-2 text-on-surface-variant">{formatarMoeda(r.realizado)}</td>
                    <td className={`py-2 font-medium ${r.diferenca < 0 ? "text-error" : "text-on-background"}`}>
                      {r.diferenca < 0 ? "Estourou " : ""}
                      {formatarMoeda(Math.abs(r.diferenca))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-label-bold text-on-background">Custos</h2>

        <form
          action={adicionarCustoComId}
          className={`grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-end ${CARD}`}
        >
          <Field label="Categoria" htmlFor="custo-categoria">
            <select id="custo-categoria" name="categoria" defaultValue={CATEGORIA_ORDEM[0]} className={INPUT}>
              {CATEGORIA_ORDEM.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {CATEGORIA_LABELS[categoria]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descrição" htmlFor="custo-descricao">
            <input id="custo-descricao" name="descricao" required className={INPUT} />
          </Field>
          <Field label="Valor (R$)" htmlFor="custo-valor">
            <input id="custo-valor" name="valor" type="number" step="0.01" min="0" required className={INPUT} />
          </Field>
          <button type="submit" className={BTN_PRIMARY}>
            Adicionar
          </button>
        </form>

        {projeto.custos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant">
            Nenhum custo lançado ainda.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-tertiary-fixed rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]">
            {projeto.custos.map((custo) => {
              const removerEsteCusto = removerCustoComId.bind(null, custo.id);
              return (
                <li key={custo.id} className="flex items-center justify-between gap-3 px-4 py-3 text-body-md">
                  <div>
                    <p className="text-on-background">{custo.descricao}</p>
                    <p className="text-on-surface-variant">
                      {CATEGORIA_LABELS[custo.categoria]} · {formatarData(custo.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-on-background">{formatarMoeda(custo.valor)}</span>
                    <form action={removerEsteCusto}>
                      <button type="submit" className={BTN_TEXT_DANGER} title="Remover">
                        Remover
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({
  titulo,
  valor,
  subtitulo,
  destaque,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  destaque?: "positivo" | "negativo";
}) {
  return (
    <div className={CARD}>
      <p className="text-label-bold text-on-surface-variant">{titulo}</p>
      <p
        className={
          "mt-2 text-lg font-semibold " +
          (destaque === "negativo"
            ? "text-error"
            : destaque === "positivo"
              ? "text-secondary"
              : "text-on-background")
        }
      >
        {valor}
      </p>
      {subtitulo && <p className="mt-1 text-body-md text-on-surface-variant">{subtitulo}</p>}
    </div>
  );
}
