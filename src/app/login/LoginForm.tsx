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
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="senha" className="text-sm font-medium text-neutral-700">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      {state?.erro && <p className="text-sm text-red-600">{state.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
