import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import { calcularMargem, estaAtrasado } from "@/lib/projetos";
import { KanbanProjetos } from "./KanbanProjetos";
import { ListaProjetos } from "./ListaProjetos";
import { ToggleVisualizacao } from "./ToggleVisualizacao";

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const modoKanban = view === "kanban";

  const projetos = await prisma.projeto.findMany({
    include: { custos: true },
    orderBy: { prazoEntrega: "asc" },
  });

  const linhas = projetos.map((projeto) => {
    const margem = calcularMargem(projeto);
    return {
      id: projeto.id,
      nome: projeto.nome,
      cliente: projeto.cliente,
      status: projeto.statusProducao,
      valorFormatado: formatarMoeda(projeto.valorVenda),
      margemFormatada: `Margem: ${margem !== null ? `${margem.toFixed(0)}%` : "—"}`,
      margemNegativa: margem !== null && margem < 0,
      prazoFormatado: formatarData(projeto.prazoEntrega),
      atrasado: estaAtrasado(projeto),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-headline-lg text-on-background">Projetos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleVisualizacao modoKanban={modoKanban} />
          <Link
            href="/projetos/novo"
            className="whitespace-nowrap rounded bg-secondary px-4 py-2 text-body-md font-medium text-on-secondary transition hover:opacity-90"
          >
            Novo projeto
          </Link>
        </div>
      </div>

      {modoKanban ? (
        <KanbanProjetos projetos={linhas} />
      ) : linhas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum projeto cadastrado ainda. Clique em &quot;Novo projeto&quot; para começar.
        </p>
      ) : (
        <ListaProjetos projetos={linhas} />
      )}
    </div>
  );
}
