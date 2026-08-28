import { StatusProducao, CategoriaCusto } from "@prisma/client";

export const STATUS_LABELS: Record<StatusProducao, string> = {
  FILA: "Fila",
  PRODUCAO: "Em produção",
  ACABAMENTO: "Acabamento",
  ENTREGA: "Entrega",
  CONCLUIDO: "Concluído",
};

export const STATUS_ORDEM: StatusProducao[] = [
  "FILA",
  "PRODUCAO",
  "ACABAMENTO",
  "ENTREGA",
  "CONCLUIDO",
];

export const CATEGORIA_LABELS: Record<CategoriaCusto, string> = {
  MATERIA_PRIMA: "Matéria-prima (madeira/MDF)",
  FERRAGENS_ACABAMENTO: "Ferragens e acabamento",
  MAO_DE_OBRA: "Mão de obra",
  TERCEIRIZADOS: "Terceirizados (instalação, entrega)",
  OUTROS: "Outros",
};

export const CATEGORIA_ORDEM: CategoriaCusto[] = [
  "MATERIA_PRIMA",
  "FERRAGENS_ACABAMENTO",
  "MAO_DE_OBRA",
  "TERCEIRIZADOS",
  "OUTROS",
];

type ProjetoComCustos = {
  valorVenda: number;
  percentualImposto: number;
  custos: { valor: number }[];
};

export function totalCustos(projeto: { custos: { valor: number }[] }): number {
  return projeto.custos.reduce((soma, custo) => soma + custo.valor, 0);
}

export function calcularImposto(projeto: { valorVenda: number; percentualImposto: number }): number {
  return projeto.valorVenda * (projeto.percentualImposto / 100);
}

export function calcularValorLiquido(projeto: { valorVenda: number; percentualImposto: number }): number {
  return projeto.valorVenda - calcularImposto(projeto);
}

export function calcularLucro(projeto: ProjetoComCustos): number {
  return calcularValorLiquido(projeto) - totalCustos(projeto);
}

export function calcularMargem(projeto: ProjetoComCustos): number | null {
  if (projeto.valorVenda === 0) return null;
  return (calcularLucro(projeto) / projeto.valorVenda) * 100;
}

export function estaAtrasado(projeto: {
  prazoEntrega: Date | string;
  dataEntregaReal: Date | string | null;
  statusProducao: StatusProducao;
}): boolean {
  if (projeto.statusProducao === "CONCLUIDO") return false;
  const prazo = new Date(projeto.prazoEntrega);
  return prazo.getTime() < Date.now();
}

export function diasParaPrazo(prazoEntrega: Date | string): number {
  const prazo = new Date(prazoEntrega);
  const diffMs = prazo.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export type ResumoCategoria = {
  categoria: CategoriaCusto;
  orcado: number;
  realizado: number;
  diferenca: number; // positivo = dentro do orçado, negativo = estourou
};

export function resumoPorCategoria(
  custos: { categoria: CategoriaCusto; valor: number }[],
  orcamentos: { categoria: CategoriaCusto; valor: number }[]
): ResumoCategoria[] {
  return CATEGORIA_ORDEM.map((categoria) => {
    const orcado = orcamentos.find((o) => o.categoria === categoria)?.valor ?? 0;
    const realizado = custos
      .filter((c) => c.categoria === categoria)
      .reduce((soma, c) => soma + c.valor, 0);
    return { categoria, orcado, realizado, diferenca: orcado - realizado };
  }).filter((r) => r.orcado > 0 || r.realizado > 0);
}

export function totalOrcado(orcamentos: { valor: number }[]): number {
  return orcamentos.reduce((soma, o) => soma + o.valor, 0);
}
