import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/format";
import { calcularAmbiente, totalOrcamento } from "@/lib/orcamentos";
import { calcularValidade, pareceBot } from "@/lib/compartilhamento";

async function buscarOrcamento(token: string) {
  return prisma.orcamento.findUnique({
    where: { linkToken: token },
    include: {
      ambientes: {
        orderBy: { ordem: "asc" },
        include: { itens: true },
      },
      encargos: { orderBy: { ordem: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const orcamento = await buscarOrcamento(token);
  if (!orcamento) return { title: "Orçamento não encontrado" };
  return { title: `Orçamento — ${orcamento.cliente} · Marcenaria Carmel` };
}

export default async function OrcamentoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const orcamento = await buscarOrcamento(token);

  if (!orcamento) notFound();

  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent");
  if (!pareceBot(userAgent)) {
    await prisma.visualizacaoOrcamento.create({
      data: { orcamentoId: orcamento.id, userAgent: userAgent ?? undefined },
    }).catch(() => {});
  }

  const total = totalOrcamento(orcamento.ambientes, orcamento.encargos);
  const validade = orcamento.compartilhadoEm ? calcularValidade(orcamento.compartilhadoEm) : null;

  return (
    <div className="flex min-h-full flex-col bg-surface-container-low">
      <header className="bg-primary">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Image
            src="/brand/carmel-logo-horizontal.png"
            alt="Marcenaria Carmel"
            width={140}
            height={41}
            priority
            className="h-9 w-auto shrink-0 brightness-0 invert"
          />
          <div className="flex flex-col gap-0.5 text-body-md text-on-primary/80 sm:text-right">
            <p>(82) 9 9420-2121 · @marcenariacarmel</p>
            <p>contato@marcenariacarmel.com.br</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-1">
          <p className="text-body-md text-on-surface-variant">{formatarData(orcamento.criadoEm)}</p>
          <h1 className="text-headline-lg text-on-background">Orçamento</h1>
          <p className="text-body-md text-on-surface-variant">Cliente: {orcamento.cliente}</p>
        </div>

        {validade && (
          <div
            className={`rounded-lg border p-4 text-body-md font-medium ${
              validade.expirado
                ? "border-error/30 bg-error-container text-on-error-container"
                : "border-tertiary-fixed bg-tertiary-fixed text-on-tertiary-fixed-variant"
            }`}
          >
            {validade.expirado
              ? `Este orçamento expirou em ${formatarData(validade.validoAte)}. Entre em contato para revalidar.`
              : `Orçamento válido até ${formatarData(validade.validoAte)} — faltam ${validade.diasRestantes} ${validade.diasRestantes === 1 ? "dia" : "dias"}.`}
          </div>
        )}

        <ul className="flex flex-col gap-1.5 text-body-md text-on-surface-variant">
          <li>
            ● Não estão inclusos neste orçamento serviços e adaptações elétricas e/ou hidráulicas.
          </li>
          <li>
            ● Não estão inclusos neste orçamento serviços de desmontagens de móveis que estejam
            ocupando o local onde será instalado o novo, podendo ser acordado previamente este
            serviço à parte.
          </li>
        </ul>

        <div className="flex flex-col gap-6 rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]">
          {orcamento.ambientes.map((ambiente) => {
            const resultado = calcularAmbiente(ambiente, orcamento.encargos);

            return (
              <div key={ambiente.id} className="flex flex-col border-b border-tertiary-fixed last:border-0">
                <div className="bg-primary px-5 py-2.5">
                  <p className="text-label-bold uppercase tracking-wide text-on-primary">{ambiente.nome}</p>
                </div>

                {ambiente.descricao && (
                  <p className="whitespace-pre-line px-5 py-4 text-body-md text-on-background">
                    {ambiente.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between bg-surface-container-low px-5 py-2.5 text-body-md">
                  <span className="font-medium text-on-background">Total {ambiente.nome}</span>
                  <span className="font-semibold text-primary">{formatarMoeda(resultado.totalFinal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-primary px-5 py-4">
          <span className="text-body-md font-medium text-on-primary">Valor total do orçamento</span>
          <span className="text-2xl font-semibold text-on-primary">{formatarMoeda(total)}</span>
        </div>
      </main>

      <footer className="border-t border-tertiary-fixed px-6 py-6 text-center text-body-md text-on-surface-variant">
        Marcenaria Carmel · Avenida Belmiro Amorim, nº417, Santa Lúcia, Maceió/AL
      </footer>
    </div>
  );
}
