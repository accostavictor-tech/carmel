"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function estaAtivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function IconePainel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeOrcamentos({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 10h5M9.5 13.5h5M9.5 17h3" strokeLinecap="round" />
    </svg>
  );
}

function IconeProjetos({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3.5" y="8" width="17" height="11" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3.5 13h17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeInsumos({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 8l8 4.5L20 8M12 12.5V21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ITENS = [
  { href: "/", label: "Painel", Icone: IconePainel },
  { href: "/orcamentos", label: "Orçamentos", Icone: IconeOrcamentos },
  { href: "/projetos", label: "Projetos", Icone: IconeProjetos },
  { href: "/insumos", label: "Insumos", Icone: IconeInsumos },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-tertiary-fixed bg-surface-container-lowest sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITENS.map(({ href, label, Icone }) => {
        const ativo = estaAtivo(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
              ativo ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <Icone className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
