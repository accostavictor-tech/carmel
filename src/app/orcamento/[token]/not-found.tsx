import Image from "next/image";

export default function OrcamentoNaoEncontrado() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-surface-container-low px-6 py-16 text-center">
      <Image
        src="/brand/carmel-logo-horizontal.png"
        alt="Marcenaria Carmel"
        width={140}
        height={41}
        className="h-9 w-auto"
      />
      <p className="text-headline-lg text-on-background">Link não encontrado</p>
      <p className="max-w-sm text-body-md text-on-surface-variant">
        Este link de orçamento não existe ou foi desativado. Entre em contato com a Marcenaria
        Carmel para receber um novo link.
      </p>
    </div>
  );
}
