import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-semibold text-neutral-900">
              Marcenaria Carmel
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="text-neutral-600 hover:text-neutral-900">
                Painel
              </Link>
              <Link href="/projetos" className="text-neutral-600 hover:text-neutral-900">
                Projetos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <span>{session?.user?.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-neutral-500 hover:text-neutral-900 hover:underline">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
