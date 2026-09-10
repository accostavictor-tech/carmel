import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "./actions";
import { BottomNav } from "./BottomNav";
import { DesktopNav } from "./DesktopNav";
import { SubmitButton } from "@/components/SubmitButton";

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
            <DesktopNav />
          </div>

          <div className="flex items-center gap-4 text-body-md text-on-surface-variant">
            <span>{session?.user?.name}</span>
            <form action={logoutAction}>
              <SubmitButton variante="text" labelPendente="Saindo..." mostrarConfirmacao={false}>
                Sair
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 sm:px-6 sm:pb-8">{children}</main>

      <BottomNav />
    </div>
  );
}
