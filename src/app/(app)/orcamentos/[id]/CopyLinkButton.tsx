"use client";

import { useState } from "react";

const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 font-mono text-sm text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary sm:flex-1";
const BTN_SECONDARY = "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-secondary px-4 text-body-md font-medium text-on-secondary transition hover:opacity-90";

export function CopyLinkButton({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — usuário pode selecionar e copiar manualmente
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className={INPUT}
      />
      <button type="button" onClick={copiar} className={BTN_SECONDARY}>
        {copiado ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
