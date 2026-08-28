import { StatusProducao, CategoriaCusto } from "@/generated/prisma/enums";

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
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  OUTROS: "Outros",
};

type ProjetoComCustos = {
  valorVenda: number;
  custos: { valor: number }[];
};

export function totalCustos(projeto: ProjetoComCustos): number {
  return projeto.custos.reduce((soma, custo) => soma + custo.valor, 0);
}

export function calcularLucro(projeto: ProjetoComCustos): number {
  return projeto.valorVenda - totalCustos(projeto);
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
