import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Marcenaria Carmel</h1>
        <p className="mt-1 text-sm text-neutral-500">Entre com sua conta para acessar a gestão.</p>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
