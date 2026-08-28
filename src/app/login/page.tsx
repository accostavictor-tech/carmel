import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-container-low px-4">
      <div className="w-full max-w-sm rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-8 shadow-[0_10px_30px_rgba(7,24,40,0.08)]">
        <Image
          src="/brand/carmel-logo-horizontal.png"
          alt="Marcenaria Carmel"
          width={140}
          height={42}
          priority
          className="h-10 w-auto"
        />
        <p className="mt-4 text-body-md text-on-surface-variant">
          Entre com sua conta para acessar a gestão.
        </p>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
