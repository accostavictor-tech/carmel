"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function BuscaInsumo({ termoInicial }: { termoInicial: string }) {
  const router = useRouter();
  const [termo, setTermo] = useState(termoInicial);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function aoDigitar(valor: string) {
    setTermo(valor);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (valor.trim()) params.set("q", valor.trim());
      router.push(params.toString() ? `/insumos?${params.toString()}` : "/insumos");
    }, 300);
  }

  return (
    <input
      type="search"
      value={termo}
      onChange={(e) => aoDigitar(e.target.value)}
      placeholder="Buscar insumo pelo nome..."
      className="h-10 w-full max-w-sm rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
    />
  );
}
