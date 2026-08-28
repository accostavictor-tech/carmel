import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/format";
import {
  calcularAmbiente,
  totalOrcamento,
  CATEGORIA_INSUMO_LABELS,
  CATEGORIA_INSUMO_ORDEM,
} from "@/lib/orcamentos";
import { CategoriaInsumo } from "@prisma/client";
import {
  adicionarEncargoAction,
  adicionarItemAction,
  aprovarOrcamentoAction,
  atualizarAmbienteAction,
  atualizarImpostoOrcamentoAction,
  atualizarPercentuaisAmbienteAction,
  criarAmbienteAction,
  removerAmbienteAction,
  removerEncargoAction,
  removerItemAction,
} from "../actions";
import { StatusOrcamentoSelector } from "./StatusOrcamentoSelector";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const PAINEL = "rounded-lg border border-tertiary-fixed bg-surface-container-low p-4";
const INPUT = "h-10 w-full rounded-md border border-tertiary-fixed bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60";
const LABEL = "text-label-bold text-on-surface-variant";
const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-on-surface-variant";
const BTN_PRIMARY = "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-md font-medium text-on-primary transition hover:bg-primary-container disabled:opacity-60";
const BTN_SECONDARY = "inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-body-md font-medium text-on-secondary transition hover:opacity-90";
const BTN_TEXT = "text-body-md font-medium text-primary transition hover:underline";
const BTN_TEXT_DANGER = "text-body-md text-on-surface-variant transition hover:text-error";

type Insumo = { id: string; nome: string; categoria: CategoriaInsumo; unidade: string; valorUnitario: number };

type Ambiente = {
  id: string;
  nome: string;
  percentualInsumosGerais: number;
  percentualLucro: number;
  itens: { id: string; descricao: string; unidade: string; valorUnitario: number; quantidade: number }[];
  encargos: { id: string; nome: string; percentual: number; nivel: number; ordem: number }[];
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

  const [orcamento, insumos] = await Promise.all([
    prisma.orcamento.findUnique({
      where: { id },
      include: {
        ambientes: {
          orderBy: { ordem: "asc" },
          include: { itens: true, encargos: { orderBy: { ordem: "asc" } } },
        },
      },
    }),
    prisma.insumo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  if (!orcamento) notFound();

  const total = totalOrcamento(orcamento.ambientes);
  const totalComImposto = total - total * (orcamento.percentualImposto / 100);
  const jaConvertido = Boolean(orcamento.projetoId);

  const criarAmbienteComId = criarAmbienteAction.bind(null, orcamento.id);
  const aprovarComId = aprovarOrcamentoAction.bind(null, orcamento.id);
  const atualizarImpostoComId = atualizarImpostoOrcamentoAction.bind(null, orcamento.id);

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

        <div className="flex flex-wrap items-end gap-4">
          <Field label="Status">
            <StatusOrcamentoSelector
              orcamentoId={orcamento.id}
              statusAtual={orcamento.status}
              disabled={jaConvertido}
            />
          </Field>

          <form action={atualizarImpostoComId} className="flex items-end gap-2">
            <Field label="Imposto/comissão (%)" htmlFor="percentualImposto">
              <input
                id="percentualImposto"
                name="percentualImposto"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={orcamento.percentualImposto}
                disabled={jaConvertido}
                className={`${INPUT} w-28`}
              />
            </Field>
            {!jaConvertido && (
              <button type="submit" className={`${BTN_TEXT} h-10`}>
                Salvar
              </button>
            )}
          </form>
        </div>
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

      <div className="flex flex-col gap-6">
        {orcamento.ambientes.map((ambiente) => (
          <AmbienteCard
            key={ambiente.id}
            orcamentoId={orcamento.id}
            ambiente={ambiente}
            insumos={insumos}
            bloqueado={jaConvertido}
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
  bloqueado,
}: {
  orcamentoId: string;
  ambiente: Ambiente;
  insumos: Insumo[];
  bloqueado: boolean;
}) {
  const resultado = calcularAmbiente(ambiente);
  const proximoNivel = ambiente.encargos.reduce((max, e) => Math.max(max, e.nivel), 0) + 1;
  const uid = ambiente.id;

  const atualizarComId = atualizarAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const atualizarPercentuaisComId = atualizarPercentuaisAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const removerAmbienteComId = removerAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const adicionarItemComId = adicionarItemAction.bind(null, orcamentoId, ambiente.id);
  const adicionarEncargoComId = adicionarEncargoAction.bind(null, orcamentoId, ambiente.id);

  return (
    <section className={`flex flex-col gap-6 ${CARD}`}>
      {/* Nome do ambiente */}
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

      {/* 1. Materiais */}
      <div className="flex flex-col gap-4 border-t border-tertiary-fixed pt-6">
        <StepHeading numero={1} titulo="Materiais" />

        {!bloqueado && (
          <form action={adicionarItemComId} className={`flex flex-col gap-4 ${PAINEL}`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.6fr)_auto] sm:items-end">
              <Field label="Insumo do catálogo" htmlFor={`${uid}-insumoId`}>
                <select id={`${uid}-insumoId`} name="insumoId" className={`${INPUT} min-w-0`} defaultValue="">
                  <option value="">— item avulso (preencher abaixo) —</option>
                  {CATEGORIA_INSUMO_ORDEM.map((categoria) => {
                    const doGrupo = insumos.filter((i) => i.categoria === categoria);
                    if (doGrupo.length === 0) return null;
                    return (
                      <optgroup key={categoria} label={CATEGORIA_INSUMO_LABELS[categoria]}>
                        {doGrupo.map((insumo) => (
                          <option key={insumo.id} value={insumo.id}>
                            {insumo.nome} ({insumo.unidade}) · {formatarMoeda(insumo.valorUnitario)}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
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

            <div className="grid grid-cols-1 gap-3 border-t border-tertiary-fixed pt-4 sm:grid-cols-3">
              <Field label="Ou descrição do item avulso" htmlFor={`${uid}-descricao`}>
                <input id={`${uid}-descricao`} name="descricao" className={INPUT} />
              </Field>
              <Field label="Unidade" htmlFor={`${uid}-unidade`}>
                <input id={`${uid}-unidade`} name="unidade" placeholder="m², unid, par..." className={INPUT} />
              </Field>
              <Field label="Valor unitário (R$)" htmlFor={`${uid}-valorUnitario`}>
                <input
                  id={`${uid}-valorUnitario`}
                  name="valorUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  className={INPUT}
                />
              </Field>
            </div>
          </form>
        )}

        {ambiente.itens.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Nenhum material lançado ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-tertiary-fixed rounded-lg border border-tertiary-fixed">
            {ambiente.itens.map((item) => {
              const removerItemComId = removerItemAction.bind(null, orcamentoId, item.id);
              return (
                <li key={item.id} className="flex items-center justify-between gap-2 px-4 py-3 text-body-md">
                  <div>
                    <p className="text-on-background">{item.descricao}</p>
                    <p className="text-on-surface-variant">
                      {item.quantidade} {item.unidade} × {formatarMoeda(item.valorUnitario)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-on-background">
                      {formatarMoeda(item.quantidade * item.valorUnitario)}
                    </span>
                    {!bloqueado && (
                      <form action={removerItemComId}>
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

        <div className="flex flex-col gap-1 pt-1">
          <Linha nome="Total de material" valor={resultado.totalItens} destaque />
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
              defaultValue={ambiente.percentualInsumosGerais}
              disabled={bloqueado}
              className={`${INPUT} w-32`}
            />
          </Field>
          <Field label="Lucro (%)" htmlFor={`${uid}-lucro`}>
            <input
              id={`${uid}-lucro`}
              name="percentualLucro"
              type="number"
              step="0.01"
              min="0"
              defaultValue={ambiente.percentualLucro}
              disabled={bloqueado}
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
            nome={`+ Insumos gerais (${ambiente.percentualInsumosGerais}%)`}
            valor={resultado.totalCompra - resultado.totalItens}
          />
          <Linha nome="Total compra" valor={resultado.totalCompra} destaque />
          <Linha nome={`+ Lucro (${ambiente.percentualLucro}%)`} valor={resultado.totalVenda - resultado.totalCompra} />
          <Linha nome="Total venda" valor={resultado.totalVenda} destaque />
        </div>
      </div>

      {/* 3. Comissões e encargos */}
      <div className="flex flex-col gap-4 border-t border-tertiary-fixed pt-6">
        <div className="flex flex-col gap-1.5">
          <StepHeading numero={3} titulo="Comissões e encargos" />
          <p className="pl-8 text-body-md text-on-surface-variant">
            Encargos com o mesmo nível incidem sobre a mesma base e se somam; o próximo nível
            cascateia sobre o resultado — até chegar no valor de venda final.
          </p>
        </div>

        {!bloqueado && (
          <form
            action={adicionarEncargoComId}
            className={`grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] sm:items-end ${PAINEL}`}
          >
            <Field label="Nome do encargo" htmlFor={`${uid}-encargoNome`}>
              <input id={`${uid}-encargoNome`} name="nome" placeholder="Ex: Margem, Nota Fiscal" required className={INPUT} />
            </Field>
            <Field label="Percentual (%)" htmlFor={`${uid}-encargoPct`}>
              <input id={`${uid}-encargoPct`} name="percentual" type="number" step="0.01" min="0" required className={INPUT} />
            </Field>
            <Field label="Nível" htmlFor={`${uid}-encargoNivel`}>
              <input
                id={`${uid}-encargoNivel`}
                name="nivel"
                type="number"
                step="1"
                min="1"
                defaultValue={proximoNivel}
                title="Encargos do mesmo nível somam sobre a mesma base"
                className={INPUT}
              />
            </Field>
            <button type="submit" className={BTN_PRIMARY}>
              Adicionar
            </button>
          </form>
        )}

        {ambiente.encargos.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Nenhum encargo lançado.</p>
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
                {ambiente.encargos
                  .filter((e) => e.nivel === nivelCalc.nivel)
                  .map((encargo) => {
                    const removerEncargoComId = removerEncargoAction.bind(null, orcamentoId, encargo.id);
                    return (
                      <div key={encargo.id} className="flex items-center justify-between gap-2 text-body-md">
                        <span className="text-on-background">{encargo.nome}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-on-surface-variant">{encargo.percentual}%</span>
                          {!bloqueado && (
                            <form action={removerEncargoComId}>
                              <button type="submit" className={BTN_TEXT_DANGER}>
                                Remover
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                <Linha nome={`Subtotal (nível ${nivelCalc.nivel})`} valor={nivelCalc.subtotal} destaque />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-tertiary-fixed bg-tertiary-fixed px-4 py-3">
          <Linha nome="Valor de venda do ambiente" valor={resultado.totalFinal} destaque grande />
        </div>
      </div>
    </section>
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
