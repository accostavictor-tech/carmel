import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/format";
import { calcularAmbiente, totalOrcamento } from "@/lib/orcamentos";
import {
  adicionarEncargoAction,
  adicionarItemAction,
  aprovarOrcamentoAction,
  atualizarAmbienteAction,
  atualizarImpostoOrcamentoAction,
  criarAmbienteAction,
  removerAmbienteAction,
  removerEncargoAction,
  removerItemAction,
} from "../actions";
import { StatusOrcamentoSelector } from "./StatusOrcamentoSelector";

const CARD = "rounded-lg border border-tertiary-fixed bg-surface-container-lowest p-4 shadow-[0_10px_30px_rgba(29,45,61,0.05)]";
const INPUT = "rounded border border-tertiary-fixed bg-transparent px-2 py-1.5 text-body-md text-on-surface outline-none transition focus:border-primary";
const LABEL = "text-label-bold text-on-surface-variant";

type Insumo = { id: string; nome: string; unidade: string; valorUnitario: number };

type Ambiente = {
  id: string;
  nome: string;
  percentualInsumosGerais: number;
  percentualLucro: number;
  itens: { id: string; descricao: string; unidade: string; valorUnitario: number; quantidade: number }[];
  encargos: { id: string; nome: string; percentual: number; nivel: number; ordem: number }[];
};

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-on-background">{orcamento.nome}</h1>
        <p className="text-body-md text-on-surface-variant">{orcamento.cliente}</p>
      </div>

      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${CARD}`}>
        <div className="flex flex-col gap-1">
          <p className={LABEL}>Valor total do orçamento</p>
          <p className="text-lg font-semibold text-on-background">{formatarMoeda(total)}</p>
          {orcamento.percentualImposto > 0 && (
            <p className="text-body-md text-on-surface-variant">
              Líquido (-{orcamento.percentualImposto}%): {formatarMoeda(totalComImposto)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Status</label>
            <StatusOrcamentoSelector
              orcamentoId={orcamento.id}
              statusAtual={orcamento.status}
              disabled={jaConvertido}
            />
          </div>

          <form action={atualizarImpostoComId} className="flex flex-col gap-1">
            <label htmlFor="percentualImposto" className={LABEL}>
              Imposto/comissão (%)
            </label>
            <div className="flex gap-2">
              <input
                id="percentualImposto"
                name="percentualImposto"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={orcamento.percentualImposto}
                disabled={jaConvertido}
                className={`${INPUT} w-24`}
              />
              {!jaConvertido && (
                <button type="submit" className="text-body-md text-primary transition hover:underline">
                  Salvar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {jaConvertido ? (
        <Link
          href={`/projetos/${orcamento.projetoId}`}
          className="rounded-lg border border-tertiary-fixed bg-tertiary-fixed p-4 text-body-md text-primary shadow-[0_10px_30px_rgba(29,45,61,0.05)] hover:underline"
        >
          Este orçamento já foi convertido em projeto — ver projeto →
        </Link>
      ) : (
        <form action={aprovarComId}>
          <button
            type="submit"
            className="rounded bg-secondary px-4 py-2 text-body-md font-medium text-on-secondary transition hover:opacity-90"
          >
            Aprovar e criar projeto
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
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
        <form
          action={criarAmbienteComId}
          className={`grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] ${CARD}`}
        >
          <input name="nome" placeholder="Nome do ambiente (ex: Cozinha)" required className={INPUT} />
          <input
            name="percentualInsumosGerais"
            type="number"
            step="0.01"
            min="0"
            placeholder="Insumos gerais (%)"
            className={INPUT}
          />
          <input
            name="percentualLucro"
            type="number"
            step="0.01"
            min="0"
            placeholder="Lucro (%)"
            className={INPUT}
          />
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
          >
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

  const atualizarComId = atualizarAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const removerAmbienteComId = removerAmbienteAction.bind(null, orcamentoId, ambiente.id);
  const adicionarItemComId = adicionarItemAction.bind(null, orcamentoId, ambiente.id);
  const adicionarEncargoComId = adicionarEncargoAction.bind(null, orcamentoId, ambiente.id);

  return (
    <section className={CARD}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form action={atualizarComId} className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:flex-1">
          <input
            name="nome"
            defaultValue={ambiente.nome}
            disabled={bloqueado}
            className={`${INPUT} font-display font-semibold`}
          />
          <div className="flex items-center gap-1">
            <input
              name="percentualInsumosGerais"
              type="number"
              step="0.01"
              min="0"
              defaultValue={ambiente.percentualInsumosGerais}
              disabled={bloqueado}
              className={INPUT}
            />
            <span className="text-body-md text-on-surface-variant">% insumos gerais</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              name="percentualLucro"
              type="number"
              step="0.01"
              min="0"
              defaultValue={ambiente.percentualLucro}
              disabled={bloqueado}
              className={INPUT}
            />
            <span className="text-body-md text-on-surface-variant">% lucro</span>
            {!bloqueado && (
              <button type="submit" className="ml-2 text-body-md text-primary transition hover:underline">
                Salvar
              </button>
            )}
          </div>
        </form>

        {!bloqueado && (
          <form action={removerAmbienteComId}>
            <button type="submit" className="text-body-md text-on-surface-variant transition hover:text-error">
              Remover ambiente
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <p className={LABEL}>Itens</p>

          {!bloqueado && (
            <form action={adicionarItemComId} className="flex flex-col gap-2 rounded border border-tertiary-fixed p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                <select name="insumoId" className={`${INPUT} min-w-0`} defaultValue="">
                  <option value="">— item avulso (preencher abaixo) —</option>
                  {insumos.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nome} ({insumo.unidade}) · {formatarMoeda(insumo.valorUnitario)}
                    </option>
                  ))}
                </select>
                <input name="quantidade" type="number" step="0.01" min="0" placeholder="Qtd" required className={INPUT} />
                <button
                  type="submit"
                  className="rounded bg-primary px-3 py-1.5 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
                >
                  Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input name="descricao" placeholder="Ou descrição do item avulso" className={INPUT} />
                <input name="unidade" placeholder="Unidade" className={INPUT} />
                <input name="valorUnitario" type="number" step="0.01" min="0" placeholder="Valor unit. (R$)" className={INPUT} />
              </div>
            </form>
          )}

          {ambiente.itens.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Nenhum item lançado.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-tertiary-fixed rounded border border-tertiary-fixed">
              {ambiente.itens.map((item) => {
                const removerItemComId = removerItemAction.bind(null, orcamentoId, item.id);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-body-md">
                    <div>
                      <p className="text-on-background">{item.descricao}</p>
                      <p className="text-on-surface-variant">
                        {item.quantidade} {item.unidade} × {formatarMoeda(item.valorUnitario)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-background">
                        {formatarMoeda(item.quantidade * item.valorUnitario)}
                      </span>
                      {!bloqueado && (
                        <form action={removerItemComId}>
                          <button type="submit" className="text-on-surface-variant transition hover:text-error">
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

          <div>
            <p className={LABEL}>Encargos (%)</p>
            <p className="text-body-md text-on-surface-variant">
              Encargos com o mesmo nível incidem sobre a mesma base e se somam; o próximo nível
              cascateia sobre o resultado.
            </p>
          </div>

          {!bloqueado && (
            <form
              action={adicionarEncargoComId}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <input name="nome" placeholder="Nome (ex: Margem, Nota Fiscal)" required className={INPUT} />
              <input name="percentual" type="number" step="0.01" min="0" placeholder="%" required className={INPUT} />
              <input
                name="nivel"
                type="number"
                step="1"
                min="1"
                defaultValue={proximoNivel}
                title="Nível: encargos do mesmo nível somam sobre a mesma base"
                className={INPUT}
              />
              <button
                type="submit"
                className="rounded bg-primary px-3 py-1.5 text-body-md font-medium text-on-primary transition hover:bg-primary-container"
              >
                Adicionar
              </button>
            </form>
          )}

          {ambiente.encargos.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Nenhum encargo lançado.</p>
          ) : (
            <div className="flex flex-col divide-y divide-tertiary-fixed rounded border border-tertiary-fixed">
              {resultado.niveis.map((nivelCalc) => (
                <div key={nivelCalc.nivel} className="flex flex-col gap-1 px-3 py-2">
                  <span className="text-label-bold text-on-surface-variant">Nível {nivelCalc.nivel}</span>
                  {ambiente.encargos
                    .filter((e) => e.nivel === nivelCalc.nivel)
                    .map((encargo) => {
                      const removerEncargoComId = removerEncargoAction.bind(null, orcamentoId, encargo.id);
                      return (
                        <div key={encargo.id} className="flex items-center justify-between gap-2 text-body-md">
                          <span className="text-on-background">{encargo.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface-variant">{encargo.percentual}%</span>
                            {!bloqueado && (
                              <form action={removerEncargoComId}>
                                <button type="submit" className="text-on-surface-variant transition hover:text-error">
                                  Remover
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1 rounded border border-tertiary-fixed p-3 text-body-md">
          <p className={LABEL}>Cascata de valores</p>
          <Linha nome="Total itens" valor={resultado.totalItens} />
          <Linha
            nome={`+ Insumos gerais (${ambiente.percentualInsumosGerais}%)`}
            valor={resultado.totalCompra - resultado.totalItens}
          />
          <Linha nome="Total compra" valor={resultado.totalCompra} destaque />
          <Linha nome={`+ Lucro (${ambiente.percentualLucro}%)`} valor={resultado.totalVenda - resultado.totalCompra} />
          <Linha nome="Total venda" valor={resultado.totalVenda} destaque />
          {resultado.niveis.map((nivelCalc) => (
            <div key={nivelCalc.nivel} className="mt-1">
              {nivelCalc.encargos.map((encargo, i) => (
                <Linha key={i} nome={`+ ${encargo.nome} (${encargo.percentual}%)`} valor={encargo.valorAcrescido} />
              ))}
              <Linha nome={`Subtotal (nível ${nivelCalc.nivel})`} valor={nivelCalc.subtotal} destaque />
            </div>
          ))}
          <div className="mt-2 border-t border-tertiary-fixed pt-2">
            <Linha nome="Total final do ambiente" valor={resultado.totalFinal} destaque grande />
          </div>
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
    <div className="flex items-center justify-between">
      <span className={destaque ? "font-medium text-on-background" : "text-on-surface-variant"}>{nome}</span>
      <span
        className={
          grande
            ? "text-lg font-semibold text-secondary"
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
