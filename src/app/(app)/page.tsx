import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import {
  STATUS_LABELS,
  STATUS_ORDEM,
  calcularMargem,
  diasParaPrazo,
  estaAtrasado,
} from "@/lib/projetos";
import { definirMetaAction } from "./actions";

export default async function DashboardPage() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const inicioProximoMes = new Date(Date.UTC(ano, mes, 1));

  const [meta, projetos, projetosDoMes] = await Promise.all([
    prisma.metaMensal.findUnique({ where: { ano_mes: { ano, mes } } }),
    prisma.projeto.findMany({ include: { custos: true } }),
    prisma.projeto.findMany({
      where: { dataFechamento: { gte: inicioMes, lt: inicioProximoMes } },
      include: { custos: true },
    }),
  ]);

  const faturamentoMes = projetosDoMes.reduce((soma, p) => soma + p.valorVenda, 0);
  const percentualMeta = meta ? (faturamentoMes / meta.valorMeta) * 100 : null;

  const margens = projetos
    .map((p) => calcularMargem(p))
    .filter((m): m is number => m !== null);
  const margemMedia = margens.length > 0 ? margens.reduce((a, b) => a + b, 0) / margens.length : null;

  const projetosAtrasados = projetos.filter((p) => estaAtrasado(p));
  const projetosProximosDoPrazo = projetos.filter(
    (p) =>
      p.statusProducao !== "CONCLUIDO" &&
      !estaAtrasado(p) &&
      diasParaPrazo(p.prazoEntrega) <= 7
  );

  const porEtapa = STATUS_ORDEM.map((status) => ({
    status,
    quantidade: projetos.filter((p) => p.statusProducao === status).length,
  }));

  const nomeMes = agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-neutral-900">Painel — {nomeMes}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Faturamento do mês</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{formatarMoeda(faturamentoMes)}</p>

          {meta ? (
            <>
              <p className="mt-1 text-sm text-neutral-500">
                Meta: {formatarMoeda(meta.valorMeta)} ({percentualMeta!.toFixed(0)}%)
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${percentualMeta! >= 100 ? "bg-emerald-600" : "bg-amber-700"}`}
                  style={{ width: `${Math.min(percentualMeta!, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <form action={definirMetaAction} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="ano" value={ano} />
              <input type="hidden" name="mes" value={mes} />
              <input
                name="valorMeta"
                type="number"
                step="0.01"
                min="0"
                placeholder="Definir meta (R$)"
                required
                className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-amber-700"
              />
              <button type="submit" className="rounded-md bg-amber-800 px-3 py-1 text-sm text-white hover:bg-amber-900">
                Salvar
              </button>
            </form>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Margem média (todos os projetos)</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              margemMedia !== null && margemMedia < 0 ? "text-red-600" : "text-neutral-900"
            }`}
          >
            {margemMedia !== null ? `${margemMedia.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">{projetos.length} projeto(s) no total</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Prazos</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{projetosAtrasados.length} atrasado(s)</p>
          <p className="mt-1 text-sm text-amber-700">
            {projetosProximosDoPrazo.length} vencendo nos próximos 7 dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Produção por etapa</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {porEtapa.map(({ status, quantidade }) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{STATUS_LABELS[status]}</span>
                <span className="font-medium text-neutral-900">{quantidade}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Projetos que precisam de atenção</h2>
          {projetosAtrasados.length === 0 && projetosProximosDoPrazo.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">Nenhum projeto atrasado ou com prazo próximo.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {[...projetosAtrasados, ...projetosProximosDoPrazo].map((projeto) => (
                <li key={projeto.id}>
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="flex items-center justify-between text-sm hover:underline"
                  >
                    <span className="text-neutral-800">{projeto.nome}</span>
                    <span className={estaAtrasado(projeto) ? "font-medium text-red-600" : "text-amber-700"}>
                      {formatarData(projeto.prazoEntrega)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
