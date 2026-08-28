import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/format";
import {
  arquivarInsumoAction,
  atualizarInsumoAction,
  criarInsumoAction,
  reativarInsumoAction,
} from "./actions";

const INPUT = "rounded border border-tertiary-fixed bg-transparent px-2 py-1.5 text-body-md text-on-surface outline-none transition focus:border-primary";

export default async function InsumosPage() {
  const insumos = await prisma.insumo.findMany({ orderBy: { nome: "asc" } });
  const ativos = insumos.filter((i) => i.ativo);
  const arquivados = insumos.filter((i) => !i.ativo);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-lg text-on-background">Insumos</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Catálogo de materiais e ferragens usado para montar os orçamentos. Atualize o preço aqui
          quando o fornecedor mudar — os orçamentos já criados mantêm o preço da época.
        </p>
      </div>

      <form
        action={criarInsumoAction}
        className="grid grid-cols-1 gap-3 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)] sm:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <input name="nome" placeholder="Nome do insumo" required className={INPUT} />
        <input name="unidade" placeholder="Unidade (m², unid, par...)" required className={INPUT} />
        <input
          name="valorUnitario"
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

      <TabelaInsumos titulo="Ativos" insumos={ativos} vazio="Nenhum insumo cadastrado ainda." />

      {arquivados.length > 0 && (
        <TabelaInsumos titulo="Arquivados" insumos={arquivados} vazio="" />
      )}
    </div>
  );
}

function TabelaInsumos({
  titulo,
  insumos,
  vazio,
}: {
  titulo: string;
  insumos: { id: string; nome: string; unidade: string; valorUnitario: number; ativo: boolean }[];
  vazio: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-label-bold text-on-background">{titulo}</h2>

      {insumos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant">
          {vazio}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]">
          <table className="w-full min-w-[600px] text-body-md">
            <thead>
              <tr className="border-b border-tertiary-fixed text-left text-on-surface-variant">
                <th className="px-4 py-2 font-normal">Nome</th>
                <th className="px-4 py-2 font-normal">Unidade</th>
                <th className="px-4 py-2 font-normal">Valor</th>
                <th className="px-4 py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((insumo) => {
                const atualizarComId = atualizarInsumoAction.bind(null, insumo.id);
                const arquivarComId = arquivarInsumoAction.bind(null, insumo.id);
                const reativarComId = reativarInsumoAction.bind(null, insumo.id);
                const formId = `insumo-${insumo.id}`;
                return (
                  <tr key={insumo.id} className="border-b border-tertiary-fixed last:border-0">
                    <td className="px-4 py-2">
                      <input
                        form={formId}
                        name="nome"
                        defaultValue={insumo.nome}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        form={formId}
                        name="unidade"
                        defaultValue={insumo.unidade}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        form={formId}
                        name="valorUnitario"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={insumo.valorUnitario}
                        className={INPUT}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <form id={formId} action={atualizarComId} />
                        <button
                          form={formId}
                          type="submit"
                          className="text-primary transition hover:underline"
                        >
                          Salvar
                        </button>
                        <form action={insumo.ativo ? arquivarComId : reativarComId}>
                          <button
                            type="submit"
                            className="text-on-surface-variant transition hover:text-error"
                          >
                            {insumo.ativo ? "Arquivar" : "Reativar"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
