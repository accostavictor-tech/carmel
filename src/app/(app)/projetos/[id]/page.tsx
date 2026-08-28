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
        <h1 className="text-lg font-semibold text-neutral-900">{projeto.nome}</h1>
        <p className="text-sm text-neutral-500">{projeto.cliente}</p>
        {projeto.descricao && <p className="mt-1 text-sm text-neutral-600">{projeto.descricao}</p>}
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

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-500">
            Fechado em {formatarData(projeto.dataFechamento)} · Prazo {formatarData(projeto.prazoEntrega)}
          </span>
          {atrasado && <span className="font-medium text-red-600">Projeto atrasado</span>}
          {projeto.responsavel && (
            <span className="text-neutral-500">Responsável: {projeto.responsavel.nome}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500">Status de produção</label>
          <StatusSelector projetoId={projeto.id} statusAtual={projeto.statusProducao} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-neutral-900">Custos</h2>

        <form
          action={adicionarCustoComId}
          className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_2fr_1fr_auto]"
        >
          <select
            name="categoria"
            defaultValue={CategoriaCusto.MATERIAL}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          >
            {Object.entries(CATEGORIA_LABELS).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="descricao"
            placeholder="Descrição do custo"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor (R$)"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
          >
            Adicionar
          </button>
        </form>

        {projeto.custos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
            Nenhum custo lançado ainda.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white shadow-sm">
            {projeto.custos.map((custo) => {
              const removerEsteCusto = removerCustoComId.bind(null, custo.id);
              return (
                <li key={custo.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="text-neutral-900">{custo.descricao}</p>
                    <p className="text-neutral-500">
                      {CATEGORIA_LABELS[custo.categoria]} · {formatarData(custo.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900">{formatarMoeda(custo.valor)}</span>
                    <form action={removerEsteCusto}>
                      <button type="submit" className="text-neutral-400 hover:text-red-600" title="Remover">
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
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-500">{titulo}</p>
      <p
        className={
          "mt-1 text-lg font-semibold " +
          (destaque === "negativo"
            ? "text-red-600"
            : destaque === "positivo"
              ? "text-emerald-700"
              : "text-neutral-900")
        }
      >
        {valor}
      </p>
    </div>
  );
}
