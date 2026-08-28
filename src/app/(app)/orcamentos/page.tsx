import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import { STATUS_ORCAMENTO_LABELS, totalOrcamento } from "@/lib/orcamentos";

export default async function OrcamentosPage() {
  const orcamentos = await prisma.orcamento.findMany({
    include: { ambientes: { include: { itens: true, encargos: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-background">Orçamentos</h1>
        <Link
          href="/orcamentos/novo"
          className="rounded bg-secondary px-4 py-2 text-body-md font-medium text-on-secondary transition hover:opacity-90"
        >
          Novo orçamento
        </Link>
      </div>

      {orcamentos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum orçamento cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orcamentos.map((orcamento) => {
            const total = totalOrcamento(orcamento.ambientes);
            return (
              <li key={orcamento.id}>
                <Link
                  href={`/orcamentos/${orcamento.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display font-semibold text-on-background">{orcamento.nome}</p>
                    <p className="text-body-md text-on-surface-variant">{orcamento.cliente}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-body-md">
                    <span className="text-on-surface-variant">{formatarMoeda(total)}</span>
                    <span className="rounded-lg bg-tertiary-fixed px-2 py-0.5 text-primary text-label-bold">
                      {STATUS_ORCAMENTO_LABELS[orcamento.status]}
                    </span>
                    <span className="text-on-surface-variant">{formatarData(orcamento.criadoEm)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
