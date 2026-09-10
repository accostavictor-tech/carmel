"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function estaAtivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

const ITENS = [
  { href: "/", label: "Painel" },
  { href: "/orcamentos", label: "Orçamentos" },
  { href: "/projetos", label: "Projetos" },
  { href: "/insumos", label: "Insumos" },
  { href: "/formas-pagamento", label: "Pagamentos" },
  { href: "/configuracoes", label: "Configurações" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden gap-6 text-body-md sm:flex">
      {ITENS.map(({ href, label }) => {
        const ativo = estaAtivo(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`border-b-2 pb-0.5 transition ${
              ativo
                ? "border-primary font-medium text-primary"
                : "border-transparent text-on-surface-variant hover:border-outline-variant hover:text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
