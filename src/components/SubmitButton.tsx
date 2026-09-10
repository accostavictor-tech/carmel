"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Variante = "primary" | "secondary" | "text" | "danger";

const ESTILOS: Record<Variante, string> = {
  primary:
    "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
  secondary:
    "inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-body-md font-medium text-on-secondary transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
  text: "text-body-md font-medium text-primary transition hover:underline disabled:opacity-60 disabled:no-underline",
  danger: "text-body-md text-on-surface-variant transition hover:text-error disabled:opacity-60",
};

export function SubmitButton({
  children,
  labelPendente = "Salvando...",
  labelConfirmado = "Salvo ✓",
  mostrarConfirmacao = true,
  variante = "primary",
  className,
}: {
  children: React.ReactNode;
  labelPendente?: string;
  labelConfirmado?: string;
  mostrarConfirmacao?: boolean;
  variante?: Variante;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const [confirmado, setConfirmado] = useState(false);
  const foiPendente = useRef(false);

  useEffect(() => {
    if (pending) {
      foiPendente.current = true;
      return;
    }
    if (!foiPendente.current || !mostrarConfirmacao) return;
    foiPendente.current = false;
    setConfirmado(true);
    const t = setTimeout(() => setConfirmado(false), 1500);
    return () => clearTimeout(t);
  }, [pending, mostrarConfirmacao]);

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${ESTILOS[variante]} ${className ?? ""}`}
    >
      {pending ? labelPendente : confirmado ? labelConfirmado : children}
    </button>
  );
}
