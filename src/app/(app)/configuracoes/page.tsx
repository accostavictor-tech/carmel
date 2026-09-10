import { getConfiguracaoOrcamento } from "@/lib/configuracao-orcamento";
import { atualizarConfiguracaoOrcamentoAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "h-10 w-full max-w-[10rem] rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";

function Field({ label, htmlFor, descricao, children }: { label: string; htmlFor: string; descricao: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
      <p className="max-w-md text-body-md text-on-surface-variant">{descricao}</p>
    </div>
  );
}

export default async function ConfiguracoesPage() {
  const config = await getConfiguracaoOrcamento();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg text-on-background">Configurações do orçamento</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Taxas e impostos aplicados no cálculo de todos os orçamentos — mudar aqui reflete
          imediatamente em todos eles, novos e já existentes.
        </p>
      </div>

      <form action={atualizarConfiguracaoOrcamentoAction} className={`flex flex-col gap-6 ${CARD}`}>
        <Field
          label="Imposto da NF (%)"
          htmlFor="percentualImpostoNF"
          descricao="Aplicado sobre venda + comissões de cada item, no fechamento do valor final."
        >
          <input
            id="percentualImpostoNF"
            name="percentualImpostoNF"
            type="number"
            step="0.01"
            min="0"
            defaultValue={config.percentualImpostoNF}
            className={INPUT}
          />
        </Field>

        <Field
          label="Insumos gerais (%)"
          htmlFor="percentualInsumosGerais"
          descricao="Acréscimo sobre o total de materiais de cada item (cola, fita de borda, parafusos etc.) para chegar no custo."
        >
          <input
            id="percentualInsumosGerais"
            name="percentualInsumosGerais"
            type="number"
            step="0.01"
            min="0"
            defaultValue={config.percentualInsumosGerais}
            className={INPUT}
          />
        </Field>

        <SubmitButton className="self-start">Salvar</SubmitButton>
      </form>
    </div>
  );
}
