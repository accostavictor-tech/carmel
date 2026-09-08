"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function ErroApp({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Image
        src="/brand/carmel-logo-horizontal.png"
        alt="Marcenaria Carmel"
        width={140}
        height={41}
        className="h-9 w-auto"
      />
      <p className="text-headline-lg text-on-background">Algo deu errado</p>
      <p className="max-w-sm text-body-md text-on-surface-variant">
        {error.message || "Não foi possível concluir essa ação. Tente novamente."}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="rounded border border-tertiary-fixed px-4 py-2 text-body-md font-medium text-on-background transition hover:bg-surface-container-low"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
