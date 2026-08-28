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

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";

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
      <h1 className="text-headline-lg text-on-background">Painel — {nomeMes}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={CARD}>
          <p className="text-label-bold text-on-surface-variant">Faturamento do mês</p>
          <p className="mt-2 text-2xl font-semibold text-on-background">{formatarMoeda(faturamentoMes)}</p>

          {meta ? (
            <>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Meta: {formatarMoeda(meta.valorMeta)} ({percentualMeta!.toFixed(0)}%)
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className={`h-full rounded-full ${percentualMeta! >= 100 ? "bg-secondary" : "bg-primary"}`}
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
                className="w-full rounded border border-tertiary-fixed bg-transparent px-2 py-1 text-body-md outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded bg-primary px-3 py-1 text-body-md text-on-primary hover:bg-primary-container"
              >
                Salvar
              </button>
            </form>
          )}
        </div>

        <div className={CARD}>
          <p className="text-label-bold text-on-surface-variant">Margem média</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              margemMedia !== null && margemMedia < 0 ? "text-error" : "text-on-background"
            }`}
          >
            {margemMedia !== null ? `${margemMedia.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-body-md text-on-surface-variant">{projetos.length} projeto(s) no total</p>
        </div>

        <div className={CARD}>
          <p className="text-label-bold text-on-surface-variant">Prazos</p>
          <p className="mt-2 text-2xl font-semibold text-error">{projetosAtrasados.length} atrasado(s)</p>
          <p className="mt-1 text-body-md text-secondary">
            {projetosProximosDoPrazo.length} vencendo nos próximos 7 dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={CARD}>
          <h2 className="text-label-bold text-on-background">Produção por etapa</h2>
          <ul className="mt-3 flex flex-col divide-y divide-tertiary-fixed">
            {porEtapa.map(({ status, quantidade }) => (
              <li key={status} className="flex items-center justify-between py-2 text-body-md">
                <span className="text-on-surface-variant">{STATUS_LABELS[status]}</span>
                <span className="font-medium text-on-background">{quantidade}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={CARD}>
          <h2 className="text-label-bold text-on-background">Projetos que precisam de atenção</h2>
          {projetosAtrasados.length === 0 && projetosProximosDoPrazo.length === 0 ? (
            <p className="mt-3 text-body-md text-on-surface-variant">Nenhum projeto atrasado ou com prazo próximo.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-tertiary-fixed">
              {[...projetosAtrasados, ...projetosProximosDoPrazo].map((projeto) => (
                <li key={projeto.id} className="py-2">
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="flex items-center justify-between text-body-md hover:text-primary"
                  >
                    <span className="text-on-background">{projeto.nome}</span>
                    <span className={estaAtrasado(projeto) ? "font-medium text-error" : "text-secondary"}>
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
