import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-tertiary-fixed bg-surface-container-lowest">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/brand/carmel-logo-horizontal.png"
                alt="Marcenaria Carmel"
                width={112}
                height={33}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <nav className="flex gap-6 text-body-md">
              <Link href="/" className="text-on-surface-variant transition hover:text-primary">
                Painel
              </Link>
              <Link href="/orcamentos" className="text-on-surface-variant transition hover:text-primary">
                Orçamentos
              </Link>
              <Link href="/projetos" className="text-on-surface-variant transition hover:text-primary">
                Projetos
              </Link>
              <Link href="/insumos" className="text-on-surface-variant transition hover:text-primary">
                Insumos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-body-md text-on-surface-variant">
            <span>{session?.user?.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="transition hover:text-primary hover:underline">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
