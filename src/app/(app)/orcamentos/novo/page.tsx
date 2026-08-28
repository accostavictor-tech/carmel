import { criarOrcamentoAction } from "../actions";

const INPUT = "rounded border border-tertiary-fixed bg-transparent px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary";
const LABEL = "text-label-bold text-on-surface-variant";

export default function NovoOrcamentoPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-headline-lg text-on-background">Novo orçamento</h1>

      <form
        action={criarOrcamentoAction}
        className="flex max-w-xl flex-col gap-4 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(29,45,61,0.05)]"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className={LABEL}>
            Nome do orçamento *
          </label>
          <input
            id="nome"
            name="nome"
            required
            placeholder="Ex: Ana Paula - Apartamento novo"
            className={INPUT}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cliente" className={LABEL}>
            Cliente *
          </label>
          <input id="cliente" name="cliente" required className={INPUT} />
        </div>

        <button
          type="submit"
          className="mt-2 rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
        >
          Criar orçamento
        </button>
      </form>
    </div>
  );
}
