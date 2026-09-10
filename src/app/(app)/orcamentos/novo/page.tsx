import { criarOrcamentoAction } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

const INPUT = "h-10 rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
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

        <div className="flex flex-col gap-3 border-t border-tertiary-fixed pt-4">
          <p className={LABEL}>Contato</p>

          <div className="flex flex-col gap-1">
            <label htmlFor="cliente" className={LABEL}>
              Nome *
            </label>
            <input id="cliente" name="cliente" required className={INPUT} />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="clienteEmpresa" className={LABEL}>
              Empresa
            </label>
            <input id="clienteEmpresa" name="clienteEmpresa" className={INPUT} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="clienteTelefone" className={LABEL}>
                Telefone
              </label>
              <input id="clienteTelefone" name="clienteTelefone" className={INPUT} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="clienteEmail" className={LABEL}>
                E-mail
              </label>
              <input id="clienteEmail" name="clienteEmail" type="email" className={INPUT} />
            </div>
          </div>
        </div>

        <SubmitButton
          className="mt-2"
          labelPendente="Criando..."
          mostrarConfirmacao={false}
        >
          Criar orçamento
        </SubmitButton>
      </form>
    </div>
  );
}
