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
        <h1 className="text-lg font-semibold text-neutral-900">Projetos</h1>
        <Link
          href="/projetos/novo"
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          Novo projeto
        </Link>
      </div>

      {projetos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
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
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-amber-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{projeto.nome}</p>
                    <p className="text-sm text-neutral-500">{projeto.cliente}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                    <span className="text-neutral-700">{formatarMoeda(projeto.valorVenda)}</span>
                    <span className={margem !== null && margem < 0 ? "font-medium text-red-600" : "text-neutral-600"}>
                      Margem: {margem !== null ? `${margem.toFixed(0)}%` : "—"}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                      {STATUS_LABELS[projeto.statusProducao]}
                    </span>
                    <span className={atrasado ? "font-medium text-red-600" : "text-neutral-500"}>
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
