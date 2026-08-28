import { criarProjetoAction } from "../actions";
import { formatarDataInput } from "@/lib/format";

const INPUT = "rounded border border-tertiary-fixed bg-transparent px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary";
const LABEL = "text-label-bold text-on-surface-variant";

export default function NovoProjetoPage() {
  const hoje = formatarDataInput(new Date());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-headline-lg text-on-background">Novo projeto</h1>

      <form
        action={criarProjetoAction}
        className="flex max-w-xl flex-col gap-4 rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(29,45,61,0.05)]"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className={LABEL}>
            Nome do projeto *
          </label>
          <input
            id="nome"
            name="nome"
            required
            placeholder="Ex: Cozinha planejada — Ap 302"
            className={INPUT}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cliente" className={LABEL}>
            Cliente *
          </label>
          <input id="cliente" name="cliente" required className={INPUT} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="descricao" className={LABEL}>
            Descrição
          </label>
          <textarea id="descricao" name="descricao" rows={3} className={INPUT} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="valorVenda" className={LABEL}>
            Valor de venda (R$) *
          </label>
          <input
            id="valorVenda"
            name="valorVenda"
            type="number"
            step="0.01"
            min="0"
            required
            className={INPUT}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="dataFechamento" className={LABEL}>
              Data de fechamento *
            </label>
            <input
              id="dataFechamento"
              name="dataFechamento"
              type="date"
              defaultValue={hoje}
              required
              className={INPUT}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="prazoEntrega" className={LABEL}>
              Prazo de entrega *
            </label>
            <input id="prazoEntrega" name="prazoEntrega" type="date" required className={INPUT} />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
        >
          Criar projeto
        </button>
      </form>
    </div>
  );
}
