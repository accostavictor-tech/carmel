import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import { STATUS_LABELS, calcularMargem, estaAtrasado } from "@/lib/projetos";

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    include: { custos: true },
    orderBy: { prazoEntrega: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-background">Projetos</h1>
        <Link
          href="/projetos/novo"
          className="rounded bg-secondary px-4 py-2 text-body-md font-medium text-on-secondary transition hover:opacity-90"
        >
          Novo projeto
        </Link>
      </div>

      {projetos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum projeto cadastrado ainda. Clique em &quot;Novo projeto&quot; para começar.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projetos.map((projeto) => {
            const margem = calcularMargem(projeto);
            const atrasado = estaAtrasado(projeto);
            return (
              <li key={projeto.id}>
                <Link
                  href={`/projetos/${projeto.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)] transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display font-semibold text-on-background">{projeto.nome}</p>
                    <p className="text-body-md text-on-surface-variant">{projeto.cliente}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-body-md">
                    <span className="text-on-surface-variant">{formatarMoeda(projeto.valorVenda)}</span>
                    <span className={margem !== null && margem < 0 ? "font-medium text-error" : "text-on-surface-variant"}>
                      Margem: {margem !== null ? `${margem.toFixed(0)}%` : "—"}
                    </span>
                    <span className="rounded-lg bg-tertiary-fixed px-2 py-0.5 text-primary text-label-bold">
                      {STATUS_LABELS[projeto.statusProducao]}
                    </span>
                    <span className={atrasado ? "font-medium text-error" : "text-on-surface-variant"}>
                      Prazo: {formatarData(projeto.prazoEntrega)}
                      {atrasado ? " (atrasado)" : ""}
                    </span>
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
