import { criarProjetoAction } from "../actions";
import { formatarDataInput } from "@/lib/format";

export default function NovoProjetoPage() {
  const hoje = formatarDataInput(new Date());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-neutral-900">Novo projeto</h1>

      <form action={criarProjetoAction} className="flex max-w-xl flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="nome" className="text-sm font-medium text-neutral-700">
            Nome do projeto *
          </label>
          <input
            id="nome"
            name="nome"
            required
            placeholder="Ex: Cozinha planejada — Ap 302"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cliente" className="text-sm font-medium text-neutral-700">
            Cliente *
          </label>
          <input
            id="cliente"
            name="cliente"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="descricao" className="text-sm font-medium text-neutral-700">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows={3}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="valorVenda" className="text-sm font-medium text-neutral-700">
            Valor de venda (R$) *
          </label>
          <input
            id="valorVenda"
            name="valorVenda"
            type="number"
            step="0.01"
            min="0"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="dataFechamento" className="text-sm font-medium text-neutral-700">
              Data de fechamento *
            </label>
            <input
              id="dataFechamento"
              name="dataFechamento"
              type="date"
              defaultValue={hoje}
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="prazoEntrega" className="text-sm font-medium text-neutral-700">
              Prazo de entrega *
            </label>
            <input
              id="prazoEntrega"
              name="prazoEntrega"
              type="date"
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          Criar projeto
        </button>
      </form>
    </div>
  );
}
