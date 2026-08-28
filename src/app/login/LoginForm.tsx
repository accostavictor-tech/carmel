"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-label-bold text-on-surface-variant">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-tertiary-fixed bg-transparent px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="senha" className="text-label-bold text-on-surface-variant">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-tertiary-fixed bg-transparent px-3 py-2 text-body-md text-on-surface outline-none transition focus:border-primary"
        />
      </div>

      {state?.erro && <p className="text-body-md text-error">{state.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
