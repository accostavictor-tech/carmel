import { prisma } from "@/lib/prisma";
import {
  arquivarFormaPagamentoAction,
  atualizarFormaPagamentoAction,
  criarFormaPagamentoAction,
  reativarFormaPagamentoAction,
} from "./actions";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const INPUT_TABLE = "h-9 w-full rounded-md border border-tertiary-fixed bg-transparent px-2 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container";
const BTN_TEXT = "text-body-md font-medium text-primary transition hover:underline";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default async function FormasPagamentoPage() {
  const formas = await prisma.formaPagamento.findMany({ orderBy: { ordem: "asc" } });
  const ativas = formas.filter((f) => f.ativo);
  const arquivadas = formas.filter((f) => !f.ativo);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg text-on-background">Formas de pagamento</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Cadastradas uma única vez aqui e reaproveitadas em todos os orçamentos. O percentual é um
          acréscimo (positivo, ex: cartão parcelado) ou desconto (negativo, ex: PIX) sobre o valor
          total do orçamento. Em cada orçamento você escolhe quais aparecem para o cliente.
        </p>
      </div>

      <form action={criarFormaPagamentoAction} className={`grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end ${CARD}`}>
        <Field label="Nome" htmlFor="nova-nome">
          <input id="nova-nome" name="nome" placeholder="Ex: PIX, Cartão 3x" required className={INPUT} />
        </Field>
        <Field label="Percentual (%)" htmlFor="nova-percentual">
          <input
            id="nova-percentual"
            name="percentual"
            type="number"
            step="0.01"
            defaultValue={0}
            className={INPUT}
          />
        </Field>
        <button type="submit" className={BTN_PRIMARY}>
          Adicionar
        </button>
      </form>

      {ativas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhuma forma de pagamento cadastrada ainda.
        </p>
      ) : (
        <Tabela titulo="Ativas" formas={ativas} />
      )}

      {arquivadas.length > 0 && <Tabela titulo="Arquivadas" formas={arquivadas} />}
    </div>
  );
}

function Tabela({
  titulo,
  formas,
}: {
  titulo: string;
  formas: { id: string; nome: string; percentual: number; ativo: boolean }[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={FIELD_LABEL}>{titulo}</h2>
      <div className="overflow-x-auto rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]">
        <table className="w-full min-w-[480px] text-body-md">
          <thead>
            <tr className="border-b border-tertiary-fixed bg-surface-container-low text-left">
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Nome</th>
              <th className={`px-4 py-3 font-normal ${FIELD_LABEL}`}>Percentual (%)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {formas.map((forma) => {
              const atualizarComId = atualizarFormaPagamentoAction.bind(null, forma.id);
              const arquivarComId = arquivarFormaPagamentoAction.bind(null, forma.id);
              const reativarComId = reativarFormaPagamentoAction.bind(null, forma.id);
              const formId = `forma-${forma.id}`;
              return (
                <tr key={forma.id} className="border-b border-tertiary-fixed last:border-0">
                  <td className="px-4 py-2.5">
                    <input form={formId} name="nome" defaultValue={forma.nome} className={INPUT_TABLE} />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      form={formId}
                      name="percentual"
                      type="number"
                      step="0.01"
                      defaultValue={forma.percentual}
                      className={INPUT_TABLE}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-4">
                      <form id={formId} action={atualizarComId} />
                      <button form={formId} type="submit" className={BTN_TEXT}>
                        Salvar
                      </button>
                      <form action={forma.ativo ? arquivarComId : reativarComId}>
                        <button type="submit" className={BTN_TEXT_DANGER}>
                          {forma.ativo ? "Arquivar" : "Reativar"}
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
    </section>
  );
}
