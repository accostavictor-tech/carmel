import { StatusOrcamento } from "@prisma/client";

export const STATUS_ORCAMENTO_LABELS: Record<StatusOrcamento, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

export const STATUS_ORCAMENTO_ORDEM: StatusOrcamento[] = [
  "RASCUNHO",
  "ENVIADO",
  "APROVADO",
  "REJEITADO",
];

type ItemCalc = { valorUnitario: number; quantidade: number };
type EncargoCalc = { nome: string; percentual: number; nivel: number; ordem: number };

export type AmbienteCalc = {
  percentualInsumosGerais: number;
  percentualLucro: number;
  itens: ItemCalc[];
  encargos: EncargoCalc[];
};

export type EncargoCalculado = {
  nome: string;
  percentual: number;
  valorAcrescido: number;
};

export type NivelCalculado = {
  nivel: number;
  baseInicial: number;
  encargos: EncargoCalculado[];
  somaAcrescimos: number;
  subtotal: number;
};

export type ResultadoAmbiente = {
  totalItens: number;
  totalCompra: number;
  totalVenda: number;
  niveis: NivelCalculado[];
  totalFinal: number;
};

export function totalItensAmbiente(itens: ItemCalc[]): number {
  return itens.reduce((soma, item) => soma + item.valorUnitario * item.quantidade, 0);
}

export function calcularAmbiente(ambiente: AmbienteCalc): ResultadoAmbiente {
  const totalItens = totalItensAmbiente(ambiente.itens);
  const totalCompra = totalItens + (totalItens * ambiente.percentualInsumosGerais) / 100;
  const totalVenda = totalCompra + (totalCompra * ambiente.percentualLucro) / 100;

  const numerosNiveis = [...new Set(ambiente.encargos.map((e) => e.nivel))].sort((a, b) => a - b);

  let subtotal = totalVenda;
  const niveis: NivelCalculado[] = numerosNiveis.map((nivel) => {
    const baseInicial = subtotal;
    const encargosDoNivel = ambiente.encargos
      .filter((e) => e.nivel === nivel)
      .sort((a, b) => a.ordem - b.ordem);

    const encargosCalculados: EncargoCalculado[] = encargosDoNivel.map((e) => ({
      nome: e.nome,
      percentual: e.percentual,
      valorAcrescido: (baseInicial * e.percentual) / 100,
    }));

    const somaAcrescimos = encargosCalculados.reduce((soma, e) => soma + e.valorAcrescido, 0);
    subtotal = baseInicial + somaAcrescimos;

    return { nivel, baseInicial, encargos: encargosCalculados, somaAcrescimos, subtotal };
  });

  return { totalItens, totalCompra, totalVenda, niveis, totalFinal: subtotal };
}

export function totalOrcamento(ambientes: AmbienteCalc[]): number {
  return ambientes.reduce((soma, ambiente) => soma + calcularAmbiente(ambiente).totalFinal, 0);
}

export function totalInsumosOrcamento(ambientes: AmbienteCalc[]): number {
  return ambientes.reduce((soma, ambiente) => soma + calcularAmbiente(ambiente).totalCompra, 0);
}
