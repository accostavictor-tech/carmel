import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import {
  CATEGORIA_LABELS,
  calcularLucro,
  calcularMargem,
  estaAtrasado,
  totalCustos,
} from "@/lib/projetos";
import { CategoriaCusto } from "@/generated/prisma/enums";
import { adicionarCustoAction, removerCustoAction } from "../actions";
import { StatusSelector } from "./StatusSelector";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "rounded border border-tertiary-fixed bg-transparent px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary";

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const projeto = await prisma.projeto.findUnique({
    where: { id },
    include: { custos: { orderBy: { data: "desc" } }, responsavel: true },
  });

  if (!projeto) notFound();

  const custos = totalCustos(projeto);
  const lucro = calcularLucro(projeto);
  const margem = calcularMargem(projeto);
  const atrasado = estaAtrasado(projeto);

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
        <Card titulo="Valor de venda" valor={formatarMoeda(projeto.valorVenda)} />
        <Card titulo="Custos lançados" valor={formatarMoeda(custos)} />
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
          {atrasado && <span className="font-medium text-error">Projeto atrasado</span>}
          {projeto.responsavel && (
            <span className="text-on-surface-variant">Responsável: {projeto.responsavel.nome}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-bold text-on-surface-variant">Status de produção</label>
          <StatusSelector projetoId={projeto.id} statusAtual={projeto.statusProducao} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-bold text-on-background">Custos</h2>

        <form
          action={adicionarCustoComId}
          className={`grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_1fr_auto] ${CARD}`}
        >
          <select name="categoria" defaultValue={CategoriaCusto.MATERIAL} className={INPUT}>
            {Object.entries(CATEGORIA_LABELS).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
          <input name="descricao" placeholder="Descrição do custo" required className={INPUT} />
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor (R$)"
            required
            className={INPUT}
          />
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
          >
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
                      <button type="submit" className="text-on-surface-variant transition hover:text-error" title="Remover">
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
  destaque,
}: {
  titulo: string;
  valor: string;
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
    </div>
  );
}
