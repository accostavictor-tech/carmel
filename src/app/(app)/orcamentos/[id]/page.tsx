import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getInsumosAtivos } from "@/lib/insumos-cache";
import { formatarMoeda, formatarDataHora } from "@/lib/format";
import { calcularItem, totalAmbiente } from "@/lib/orcamentos";
import { calcularValidade } from "@/lib/compartilhamento";
import { CategoriaInsumo } from "@prisma/client";
import {
  adicionarEncargoOrcamentoAction,
  adicionarMaterialAction,
  aprovarOrcamentoAction,
  atualizarAmbienteAction,
  atualizarContatoOrcamentoAction,
  atualizarImpostoOrcamentoAction,
  atualizarItemAction,
  atualizarPercentuaisItemAction,
  criarAmbienteAction,
  criarItemAction,
  gerarLinkCompartilhamentoAction,
  removerAmbienteAction,
  removerEncargoOrcamentoAction,
  removerItemAction,
  removerMaterialAction,
  renovarPrazoCompartilhamentoAction,
  revogarLinkCompartilhamentoAction,
} from "../actions";
import { StatusOrcamentoSelector } from "./StatusOrcamentoSelector";
import { InsumoPicker } from "./InsumoPicker";
import { CopyLinkButton } from "./CopyLinkButton";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const PAINEL = "rounded-lg border border-tertiary-fixed bg-surface-container-low p-4";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60";
const LABEL = "text-label-bold text-on-surface-variant";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container disabled:opacity-60";
const BTN_SECONDARY = "inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-body-md font-medium text-on-secondary transition hover:opacity-90";
const BTN_TEXT = "text-body-md font-medium text-primary transition hover:underline";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

type Insumo = {
  id: string;
  nome: string;
  categoria: CategoriaInsumo;
  unidade: string;
  valorUnitario: number;
  percentualPerda: number;
};

type Encargo = { id: string; nome: string; percentual: number; nivel: number; ordem: number };

type Material = {
  id: string;
  descricao: string;
  unidade: string;
  valorUnitario: number;
  percentualPerda: number;
  quantidade: number;
};

type Item = {
  id: string;
  nome: string;
  descricao: string | null;
  percentualInsumosGerais: number;
  percentualLucro: number;
  materiais: Material[];
};

type Ambiente = {
  id: string;
  nome: string;
  itens: Item[];
};

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StepHeading({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
        {numero}
      </span>
      <p className={LABEL}>{titulo}</p>
    </div>
  );
}

export default async function OrcamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [orcamento, insumos, hdrs] = await Promise.all([
    prisma.orcamento.findUnique({
      where: { id },
      include: {
        ambientes: {
          orderBy: { ordem: "asc" },
          include: {
            itens: {
              orderBy: { ordem: "asc" },
              include: { materiais: true },
            },
          },
        },
        encargos: { orderBy: { ordem: "asc" } },
        visualizacoes: { orderBy: { criadoEm: "desc" }, take: 10 },
        _count: { select: { visualizacoes: true } },
      },
    }),
    getInsumosAtivos(),
    headers(),
  ]);

  if (!orcamento) notFound();

  const total = orcamento.ambientes.reduce(
    (soma, ambiente) => soma + totalAmbiente(ambiente.itens, orcamento.encargos),
    0
  );
  const totalComImposto = total - total * (orcamento.percentualImposto / 100);
  const jaConvertido = Boolean(orcamento.projetoId);

  const criarAmbienteComId = criarAmbienteAction.bind(null, orcamento.id);
  const aprovarComId = aprovarOrcamentoAction.bind(null, orcamento.id);
  const atualizarContatoComId = atualizarContatoOrcamentoAction.bind(null, orcamento.id);
  const atualizarImpostoComId = atualizarImpostoOrcamentoAction.bind(null, orcamento.id);
  const adicionarEncargoComId = adicionarEncargoOrcamentoAction.bind(null, orcamento.id);
  const gerarLinkComId = gerarLinkCompartilhamentoAction.bind(null, orcamento.id);
  const renovarPrazoComId = renovarPrazoCompartilhamentoAction.bind(null, orcamento.id);
  const revogarLinkComId = revogarLinkCompartilhamentoAction.bind(null, orcamento.id);
  const proximoNivelEncargo = orcamento.encargos.reduce((max, e) => Math.max(max, e.nivel), 0) + 1;

  const protocolo = hdrs.get("x-forwarded-proto") ?? "https";
  const host = hdrs.get("host");
  const linkPublico = orcamento.linkToken ? `${protocolo}://${host}/orcamento/${orcamento.linkToken}` : null;
  const validade = orcamento.compartilhadoEm ? calcularValidade(orcamento.compartilhadoEm) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-on-background">{orcamento.nome}</h1>
        <p className="text-body-md text-on-surface-variant">{orcamento.cliente}</p>
      </div>

      <div className={`flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between ${CARD}`}>
        <div className="flex flex-col gap-1">
          <p className={FIELD_LABEL}>Valor total do orçamento</p>
          <p className="text-2xl font-semibold text-on-background">{formatarMoeda(total)}</p>
          {orcamento.percentualImposto > 0 && (
            <p className="text-body-md text-on-surface-variant">
              Líquido (-{orcamento.percentualImposto}%): {formatarMoeda(totalComImposto)}
            </p>
          )}
        </div>

        <Field label="Status">
          <StatusOrcamentoSelector
            orcamentoId={orcamento.id}
            statusAtual={orcamento.status}
            disabled={jaConvertido}
          />
        </Field>
      </div>

      <div className={`flex flex-col gap-4 ${CARD}`}>
        <p className={LABEL}>Contato</p>
        <form action={atualizarContatoComId} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nome *" htmlFor="contato-nome">
              <input
                id="contato-nome"
                name="cliente"
                defaultValue={orcamento.cliente}
                required
                disabled={jaConvertido}
                className={INPUT}
              />
            </Field>
            <Field label="Empresa" htmlFor="contato-empresa">
              <input
                id="contato-empresa"
                name="clienteEmpresa"
                defaultValue={orcamento.clienteEmpresa ?? ""}
                disabled={jaConvertido}
                className={INPUT}
              />
            </Field>
            <Field label="Telefone" htmlFor="contato-telefone">
              <input
                id="contato-telefone"
                name="clienteTelefone"
                defaultValue={orcamento.clienteTelefone ?? ""}
                disabled={jaConvertido}
                className={INPUT}
              />
            </Field>
            <Field label="E-mail" htmlFor="contato-email">
              <input
                id="contato-email"
                name="clienteEmail"
                type="email"
                defaultValue={orcamento.clienteEmail ?? ""}
                disabled={jaConvertido}
                className={INPUT}
              />
            </Field>
          </div>
          {!jaConvertido && (
            <button type="submit" className={`${BTN_TEXT} self-start`}>
              Salvar contato
            </button>
          )}
        </form>
      </div>

      <div className={`flex flex-col gap-4 ${CARD}`}>
        <p className={LABEL}>Compartilhar com o cliente</p>

        {!linkPublico ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-md text-on-surface-variant">
              Gere um link público para o cliente ver este orçamento. Cada abertura fica registrada
              aqui, com data e hora.
            </p>
            <form action={gerarLinkComId}>
              <button type="submit" className={BTN_PRIMARY}>
                Gerar link
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <CopyLinkButton link={linkPublico} />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-md">
              {validade && (
                <span
                  className={
                    validade.expirado
                      ? "font-medium text-error"
                      : validade.diasRestantes <= 3
                        ? "font-medium text-secondary"
                        : "text-on-surface-variant"
                  }
                >
                  {validade.expirado
                    ? `Orçamento expirado em ${formatarDataHora(validade.validoAte)}`
                    : `Válido até ${formatarDataHora(validade.validoAte)} · ${validade.diasRestantes} ${validade.diasRestantes === 1 ? "dia" : "dias"} restantes`}
                </span>
              )}
              <span className="text-on-surface-variant">
                {orcamento._count.visualizacoes === 0
                  ? "Ainda não foi aberto pelo cliente"
                  : `Aberto ${orcamento._count.visualizacoes}x · última vez em ${formatarDataHora(orcamento.visualizacoes[0].criadoEm)}`}
              </span>
            </div>

            {orcamento.visualizacoes.length > 0 && (
              <details className="text-body-md">
                <summary className="cursor-pointer text-primary hover:underline">
                  Ver histórico de aberturas
                </summary>
                <ul className="mt-2 flex flex-col gap-1 text-on-surface-variant">
                  {orcamento.visualizacoes.map((v) => (
                    <li key={v.id}>{formatarDataHora(v.criadoEm)}</li>
                  ))}
                </ul>
              </details>
            )}

            {!jaConvertido && (
              <div className="flex flex-wrap gap-4">
                <form action={renovarPrazoComId}>
                  <button type="submit" className={BTN_TEXT}>
                    Renovar prazo (+21 dias)
                  </button>
                </form>
                <form action={revogarLinkComId}>
                  <button type="submit" className={BTN_TEXT_DANGER}>
                    Revogar link
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {jaConvertido ? (
        <Link
          href={`/projetos/${orcamento.projetoId}`}
          className="rounded-lg border border-tertiary-fixed bg-tertiary-fixed p-4 text-body-md font-medium text-primary shadow-[0_10px_30px_rgba(29,45,61,0.05)] hover:underline"
        >
          Este orçamento já foi convertido em projeto — ver projeto →
        </Link>
      ) : (
        <form action={aprovarComId}>
          <button type="submit" className={BTN_SECONDARY}>
            Aprovar e criar projeto
          </button>
        </form>
      )}

      <div className={`flex flex-col gap-4 ${CARD}`}>
        <div className="flex flex-col gap-1.5">
          <p className={LABEL}>Impostos e comissões do orçamento</p>
          <p className="text-body-md text-on-surface-variant">
            Definidos uma única vez aqui e aplicados sobre o valor de venda de todos os itens.
            Adicione uma comissão por pessoa (vendedor, sócio, etc.) — pode ser nenhuma, uma ou
            várias. Encargos com o mesmo nível incidem sobre a mesma base e se somam; o próximo
            nível cascateia sobre o resultado.
          </p>
        </div>

        <form action={atualizarImpostoComId} className={`flex items-end gap-3 ${PAINEL}`}>
          <Field label="Imposto (%)" htmlFor="percentualImposto">
            <input
              id="percentualImposto"
              name="percentualImposto"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={orcamento.percentualImposto}
              disabled={jaConvertido}
              className={`${INPUT} w-32`}
            />
          </Field>
          {!jaConvertido && (
            <button type="submit" className={`${BTN_TEXT} h-10`}>
              Salvar
            </button>
          )}
        </form>

        {!jaConvertido && (
          <form
            action={adicionarEncargoComId}
            className={`grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] sm:items-end ${PAINEL}`}
          >
            <Field label="Nome do encargo" htmlFor="orc-encargoNome">
              <input id="orc-encargoNome" name="nome" placeholder="Ex: Comissão, Cartão, Sócios" required className={INPUT} />
            </Field>
            <Field label="Percentual (%)" htmlFor="orc-encargoPct">
              <input id="orc-encargoPct" name="percentual" type="number" step="0.01" min="0" required className={INPUT} />
            </Field>
            <Field label="Nível" htmlFor="orc-encargoNivel">
              <input
                id="orc-encargoNivel"
                name="nivel"
                type="number"
                step="1"
                min="1"
                defaultValue={proximoNivelEncargo}
                title="Encargos do mesmo nível somam sobre a mesma base"
                className={INPUT}
              />
            </Field>
            <button type="submit" className={BTN_PRIMARY}>
              Adicionar
            </button>
          </form>
        )}

        {orcamento.encargos.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Nenhum encargo lançado.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-tertiary-fixed rounded-lg border border-tertiary-fixed">
            {orcamento.encargos.map((encargo) => {
              const removerEncargoComId = removerEncargoOrcamentoAction.bind(null, orcamento.id, encargo.id);
              return (
                <li key={encargo.id} className="flex items-center justify-between gap-2 px-4 py-3 text-body-md">
                  <span className="text-on-background">
                    {encargo.nome} <span className="text-on-surface-variant">· nível {encargo.nivel}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant">{encargo.percentual}%</span>
                    {!jaConvertido && (
                      <form action={removerEncargoComId}>
                        <button type="submit" className={BTN_TEXT_DANGER}>
                          Remover
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {orcamento.ambientes.map((ambiente, index) => (
          <AmbienteCard
            key={ambiente.id}
            orcamentoId={orcamento.id}
            ambiente={ambiente}
            insumos={insumos}
            encargos={orcamento.encargos}
            bloqueado={jaConvertido}
            abertoPorPadrao={index === orcamento.ambientes.length - 1}
          />
        ))}
      </div>

      {!jaConvertido && (
        <form action={criarAmbienteComId} className={`flex flex-col gap-3 sm:flex-row sm:items-end ${CARD}`}>
          <Field label="Nome do ambiente" htmlFor="novo-ambiente-nome" className="flex-1">
            <input
              id="novo-ambiente-nome"
              name="nome"
              placeholder="Ex: Cozinha"
              required
              className={INPUT}
            />
          </Field>
          <button type="submit" className={BTN_PRIMARY}>
            Adicionar ambiente
          </button>
        </form>
      )}
    </div>
  );
}

function AmbienteCard({
  orcamentoId,
  ambiente,
  insumos,
  encargos,
  bloqueado,
  abertoPorPadrao,
}: {
  orcamentoId: string;
  ambiente: Ambiente;
  insumos: Insumo[];
  encargos: Encargo[];
  bloqueado: boolean;
  abertoPorPadrao: boolean;
}) {
  const totalAmbienteValor = totalAmbiente(ambiente.itens, encargos);
  const uid = ambiente.id;

  const atualizarComId = atualizarAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const removerAmbienteComId = removerAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const criarItemComId = criarItemAction.bind(null, orcamentoId, ambiente.id);

  return (
    <details
      className="group overflow-hidden rounded-lg border border-tertiary-fixed bg-surface-container-lowest shadow-[0_10px_30px_rgba(29,45,61,0.05)]"
      open={abertoPorPadrao}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90"
          >
            <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate font-display text-lg font-semibold text-on-background">{ambiente.nome}</span>
          <span className="hidden shrink-0 text-body-md text-on-surface-variant sm:inline">
            {ambiente.itens.length} {ambiente.itens.length === 1 ? "item" : "itens"}
          </span>
        </div>
        <span className="shrink-0 text-lg font-semibold text-primary">{formatarMoeda(totalAmbienteValor)}</span>
      </summary>

      <div className="flex flex-col gap-6 border-t border-tertiary-fixed p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <form action={atualizarComId} className="flex flex-1 items-end gap-2">
            <Field label="Ambiente" htmlFor={`${uid}-nome`} className="flex-1 max-w-sm">
              <input
                id={`${uid}-nome`}
                name="nome"
                defaultValue={ambiente.nome}
                disabled={bloqueado}
                className={`${INPUT} font-display font-semibold`}
              />
            </Field>
            {!bloqueado && (
              <button type="submit" className={`${BTN_TEXT} h-10`}>
                Salvar
              </button>
            )}
          </form>

          {!bloqueado && (
            <form action={removerAmbienteComId}>
              <button type="submit" className={`${BTN_TEXT_DANGER} h-10`}>
                Remover ambiente
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {ambiente.itens.map((item, index) => (
            <ItemCard
              key={item.id}
              orcamentoId={orcamentoId}
              item={item}
              insumos={insumos}
              encargos={encargos}
              bloqueado={bloqueado}
              abertoPorPadrao={index === ambiente.itens.length - 1}
            />
          ))}
        </div>

        {!bloqueado && (
          <form action={criarItemComId} className={`flex flex-col gap-3 sm:flex-row sm:items-end ${PAINEL}`}>
            <Field label="Nome do item" htmlFor={`${uid}-novo-item`} className="flex-1">
              <input
                id={`${uid}-novo-item`}
                name="nome"
                placeholder="Ex: Prateleira, Rack, Armário"
                required
                className={INPUT}
              />
            </Field>
            <button type="submit" className={BTN_PRIMARY}>
              Adicionar item
            </button>
          </form>
        )}
      </div>
    </details>
  );
}

function ItemCard({
  orcamentoId,
  item,
  insumos,
  encargos,
  bloqueado,
  abertoPorPadrao,
}: {
  orcamentoId: string;
  item: Item;
  insumos: Insumo[];
  encargos: Encargo[];
  bloqueado: boolean;
  abertoPorPadrao: boolean;
}) {
  const resultado = calcularItem(item, encargos);
  const uid = item.id;

  const atualizarComId = atualizarItemAction.bind(null, orcamentoId, item.id);
  const atualizarPercentuaisComId = atualizarPercentuaisItemAction.bind(null, orcamentoId, item.id);
  const removerItemComId = removerItemAction.bind(null, orcamentoId, item.id);
  const adicionarMaterialComId = adicionarMaterialAction.bind(null, orcamentoId, item.id);

  return (
    <details
      className="group overflow-hidden rounded-lg border border-tertiary-fixed bg-surface-container-lowest"
      open={abertoPorPadrao}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-surface-container-low p-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90"
          >
            <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate font-display text-body-md font-semibold text-on-background">{item.nome}</span>
          <span className="hidden shrink-0 text-body-md text-on-surface-variant sm:inline">
            {item.materiais.length} {item.materiais.length === 1 ? "material" : "materiais"}
          </span>
        </div>
        <span className="shrink-0 font-semibold text-primary">{formatarMoeda(resultado.totalFinal)}</span>
      </summary>

      <div className="flex flex-col gap-6 border-t border-tertiary-fixed p-5">
        {/* Nome e descrição do item */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            {!bloqueado && (
              <form action={removerItemComId}>
                <button type="submit" className={`${BTN_TEXT_DANGER} h-10`}>
                  Remover item
                </button>
              </form>
            )}
          </div>

          <form action={atualizarComId} className="flex flex-col gap-3">
            <Field label="Nome do item" htmlFor={`${uid}-nome`} className="max-w-sm">
              <input
                id={`${uid}-nome`}
                name="nome"
                defaultValue={item.nome}
                disabled={bloqueado}
                className={`${INPUT} font-display font-semibold`}
              />
            </Field>

            <Field label="Descrição (aparece no link do cliente, junto com nome e valor)" htmlFor={`${uid}-descricao`}>
              <textarea
                id={`${uid}-descricao`}
                name="descricao"
                rows={2}
                defaultValue={item.descricao ?? ""}
                disabled={bloqueado}
                placeholder="Ex: Contendo 4 basculantes, em MDF Nogueira Imperial (Flora)"
                className={`${INPUT} h-auto resize-y py-2`}
              />
            </Field>

            {!bloqueado && (
              <button type="submit" className={`${BTN_TEXT} self-start`}>
                Salvar
              </button>
            )}
          </form>
        </div>

        {/* 1. Materiais */}
        <div className="flex flex-col gap-4 border-t border-tertiary-fixed pt-6">
          <StepHeading numero={1} titulo="Materiais" />

          {!bloqueado && (
            <form action={adicionarMaterialComId} className={`flex flex-col gap-4 ${PAINEL}`}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.6fr)_auto] sm:items-end">
                <Field label="Insumo do catálogo" htmlFor={`${uid}-insumoId`}>
                  <InsumoPicker
                    key={`picker-${item.id}-${item.materiais.length}`}
                    id={`${uid}-insumoId`}
                    name="insumoId"
                    insumos={insumos}
                  />
                </Field>
                <Field label="Quantidade" htmlFor={`${uid}-quantidade`}>
                  <input
                    id={`${uid}-quantidade`}
                    name="quantidade"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className={INPUT}
                  />
                </Field>
                <button type="submit" className={BTN_PRIMARY}>
                  Adicionar
                </button>
              </div>
            </form>
          )}

          {item.materiais.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Nenhum material lançado ainda.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-tertiary-fixed">
              <table className="w-full min-w-[560px] text-body-md">
                <thead>
                  <tr className="border-b border-tertiary-fixed bg-surface-container-low text-left">
                    <th className={`px-3 py-2 font-normal ${FIELD_LABEL}`}>Insumo</th>
                    <th className={`px-3 py-2 font-normal ${FIELD_LABEL}`}>Unid.</th>
                    <th className={`px-3 py-2 font-normal ${FIELD_LABEL}`}>Valor unit.</th>
                    <th className={`px-3 py-2 font-normal ${FIELD_LABEL}`}>Perda</th>
                    <th className={`px-3 py-2 font-normal ${FIELD_LABEL}`}>Qtd</th>
                    <th className={`px-3 py-2 text-right font-normal ${FIELD_LABEL}`}>Valor</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {item.materiais.map((material) => {
                    const removerMaterialComId = removerMaterialAction.bind(null, orcamentoId, material.id);
                    const valorTotal =
                      material.quantidade * material.valorUnitario * (1 + material.percentualPerda / 100);
                    return (
                      <tr key={material.id} className="border-b border-tertiary-fixed last:border-0">
                        <td className="px-3 py-2 text-on-background">{material.descricao}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{material.unidade}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{formatarMoeda(material.valorUnitario)}</td>
                        <td className="px-3 py-2 text-on-surface-variant">
                          {material.percentualPerda > 0 ? `${material.percentualPerda}%` : "—"}
                        </td>
                        <td className="px-3 py-2 text-on-surface-variant">{material.quantidade}</td>
                        <td className="px-3 py-2 text-right font-medium text-on-background">
                          {formatarMoeda(valorTotal)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!bloqueado && (
                            <form action={removerMaterialComId}>
                              <button type="submit" className={BTN_TEXT_DANGER}>
                                Remover
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-1 pt-1">
            <Linha nome="Total de material" valor={resultado.totalMateriais} destaque />
          </div>
        </div>

        {/* 2. Custo e lucro */}
        <div className="flex flex-col gap-4 border-t border-tertiary-fixed pt-6">
          <StepHeading numero={2} titulo="Custo e lucro" />

          <form action={atualizarPercentuaisComId} className={`flex flex-wrap items-end gap-4 ${PAINEL}`}>
            <Field label="Insumos gerais (%)" htmlFor={`${uid}-insumosGerais`}>
              <input
                id={`${uid}-insumosGerais`}
                name="percentualInsumosGerais"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item.percentualInsumosGerais}
                disabled={bloqueado}
                className={`${INPUT} w-32`}
              />
            </Field>
            <Field label="Margem de lucro (%)" htmlFor={`${uid}-lucro`}>
              <input
                id={`${uid}-lucro`}
                name="percentualLucro"
                type="number"
                step="0.01"
                min="0"
                max="99"
                defaultValue={item.percentualLucro}
                disabled={bloqueado}
                title="% do preço de venda que é lucro — não markup sobre o custo"
                className={`${INPUT} w-32`}
              />
            </Field>
            {!bloqueado && (
              <button type="submit" className={`${BTN_TEXT} h-10`}>
                Salvar
              </button>
            )}
          </form>

          <div className="flex flex-col gap-1">
            <Linha
              nome={`+ Insumos gerais (${item.percentualInsumosGerais}%)`}
              valor={resultado.totalCompra - resultado.totalMateriais}
            />
            <Linha nome="Total compra" valor={resultado.totalCompra} destaque />
            <Linha nome={`+ Margem de lucro (${item.percentualLucro}%)`} valor={resultado.totalVenda - resultado.totalCompra} />
            <Linha nome="Total venda" valor={resultado.totalVenda} destaque />
          </div>
        </div>

        {/* 3. Comissões e encargos (definidos no orçamento) */}
        <div className="flex flex-col gap-4 border-t border-tertiary-fixed pt-6">
          <div className="flex flex-col gap-1.5">
            <StepHeading numero={3} titulo="Comissões e encargos" />
            <p className="pl-8 text-body-md text-on-surface-variant">
              Definidos no topo do orçamento e aplicados aqui automaticamente.
            </p>
          </div>

          {encargos.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Nenhum encargo lançado no orçamento.</p>
          ) : (
            <div className="flex flex-col divide-y divide-tertiary-fixed rounded-lg border border-tertiary-fixed">
              {resultado.niveis.map((nivelCalc) => (
                <div key={nivelCalc.nivel} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className={FIELD_LABEL}>Nível {nivelCalc.nivel}</span>
                    <span className="text-body-md text-on-surface-variant">
                      base {formatarMoeda(nivelCalc.baseInicial)}
                    </span>
                  </div>
                  {nivelCalc.encargos.map((encargo) => (
                    <div key={encargo.nome} className="flex items-center justify-between gap-2 text-body-md">
                      <span className="text-on-background">{encargo.nome}</span>
                      <span className="text-on-surface-variant">{encargo.percentual}%</span>
                    </div>
                  ))}
                  <Linha nome={`Subtotal (nível ${nivelCalc.nivel})`} valor={nivelCalc.subtotal} destaque />
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-tertiary-fixed bg-tertiary-fixed px-4 py-3">
            <Linha nome="Valor de venda do item" valor={resultado.totalFinal} destaque grande />
          </div>
        </div>
      </div>
    </details>
  );
}

function Linha({
  nome,
  valor,
  destaque,
  grande,
}: {
  nome: string;
  valor: number;
  destaque?: boolean;
  grande?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-body-md">
      <span className={destaque ? "font-medium text-on-background" : "text-on-surface-variant"}>{nome}</span>
      <span
        className={
          grande
            ? "text-lg font-semibold text-primary"
            : destaque
              ? "font-medium text-on-background"
              : "text-on-surface-variant"
        }
      >
        {formatarMoeda(valor)}
      </span>
    </div>
  );
}
