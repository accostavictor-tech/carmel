import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import { totalOrcamento } from "@/lib/orcamentos";
import { getConfiguracaoOrcamento } from "@/lib/configuracao-orcamento";
import { KanbanOrcamentos } from "./KanbanOrcamentos";
import { ListaOrcamentos } from "./ListaOrcamentos";
import { ToggleVisualizacao } from "./ToggleVisualizacao";

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const modoKanban = view !== "lista";

  const [orcamentos, config] = await Promise.all([
    prisma.orcamento.findMany({
      include: { ambientes: { include: { itens: { include: { materiais: true } } } }, comissoes: true },
      orderBy: { criadoEm: "desc" },
    }),
    getConfiguracaoOrcamento(),
  ]);

  const linhas = orcamentos.map((orcamento) => ({
    id: orcamento.id,
    nome: orcamento.nome,
    cliente: orcamento.cliente,
    codigo: orcamento.codigo,
    status: orcamento.status,
    totalFormatado: formatarMoeda(totalOrcamento(orcamento.ambientes, orcamento.comissoes, config)),
    dataFormatada: formatarData(orcamento.criadoEm),
    bloqueado: Boolean(orcamento.projetoId),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-headline-lg text-on-background">Orçamentos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleVisualizacao modoKanban={modoKanban} />
          <Link
            href="/orcamentos/novo"
            className="whitespace-nowrap rounded bg-secondary px-4 py-2 text-body-md font-medium text-on-secondary transition hover:opacity-90"
          >
            Novo orçamento
          </Link>
        </div>
      </div>

      {modoKanban ? (
        <KanbanOrcamentos orcamentos={linhas} />
      ) : linhas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum orçamento cadastrado ainda.
        </p>
      ) : (
        <ListaOrcamentos orcamentos={linhas} />
      )}
    </div>
  );
}
