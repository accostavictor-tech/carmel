import { StatusOrcamento, CategoriaInsumo } from "@prisma/client";

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

export const CATEGORIA_INSUMO_LABELS: Record<CategoriaInsumo, string> = {
  MDF: "MDF",
  FERRAGENS: "Ferragens",
  OUTROS: "Outros",
};

export const CATEGORIA_INSUMO_ORDEM: CategoriaInsumo[] = ["MDF", "FERRAGENS", "OUTROS"];

type ItemMaterialCalc = { valorUnitario: number; quantidade: number; percentualPerda: number };
export type ComissaoCalc = { nome: string; percentual: number; ordem: number };

// Imposto da nota fiscal: percentual fixo, aplicado sobre venda + comissões
// de cada item. Não é editável por orçamento (taxas de cartão ficarão nas
// formas de pagamento, quando essa funcionalidade existir).
export const PERCENTUAL_IMPOSTO_NF = 7;

// Um item (móvel/peça) dentro de um ambiente — é a unidade de custo/venda:
// materiais → +insumos gerais% → custo → +margem de lucro% → venda → cascata
// de encargos do orçamento → valor final do item.
export type ItemCalc = {
  percentualInsumosGerais: number;
  percentualLucro: number;
  materiais: ItemMaterialCalc[];
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

export type ResultadoItem = {
  totalMateriais: number;
  totalCompra: number;
  totalVenda: number;
  niveis: NivelCalculado[];
  totalFinal: number;
};

export function totalMateriaisItem(materiais: ItemMaterialCalc[]): number {
  return materiais.reduce(
    (soma, m) => soma + m.valorUnitario * m.quantidade * (1 + m.percentualPerda / 100),
    0
  );
}

export function calcularItem(item: ItemCalc, comissoes: ComissaoCalc[]): ResultadoItem {
  const totalMateriais = totalMateriaisItem(item.materiais);
  const totalCompra = totalMateriais + (totalMateriais * item.percentualInsumosGerais) / 100;

  // "Lucro" é margem de lucro sobre o preço de venda (não markup sobre o custo):
  // margem = (venda - custo) / venda  →  venda = custo / (1 - margem/100).
  const margemLucro = Math.min(Math.max(item.percentualLucro, 0), 99.99);
  const totalVenda = margemLucro > 0 ? totalCompra / (1 - margemLucro / 100) : totalCompra;

  // Nível 1: comissões (dinâmicas, definidas no orçamento) somam sobre a venda.
  const comissoesOrdenadas = [...comissoes].sort((a, b) => a.ordem - b.ordem);
  const comissoesCalculadas: EncargoCalculado[] = comissoesOrdenadas.map((c) => ({
    nome: c.nome,
    percentual: c.percentual,
    valorAcrescido: (totalVenda * c.percentual) / 100,
  }));
  const somaComissoes = comissoesCalculadas.reduce((soma, c) => soma + c.valorAcrescido, 0);
  const subtotalComissoes = totalVenda + somaComissoes;

  // Nível 2: imposto da NF, fixo, cascateando sobre venda + comissões.
  const valorImposto = (subtotalComissoes * PERCENTUAL_IMPOSTO_NF) / 100;
  const totalFinal = subtotalComissoes + valorImposto;

  const niveis: NivelCalculado[] = [
    {
      nivel: 1,
      baseInicial: totalVenda,
      encargos: comissoesCalculadas,
      somaAcrescimos: somaComissoes,
      subtotal: subtotalComissoes,
    },
    {
      nivel: 2,
      baseInicial: subtotalComissoes,
      encargos: [{ nome: "Imposto NF (fixo)", percentual: PERCENTUAL_IMPOSTO_NF, valorAcrescido: valorImposto }],
      somaAcrescimos: valorImposto,
      subtotal: totalFinal,
    },
  ];

  return { totalMateriais, totalCompra, totalVenda, niveis, totalFinal };
}

export function totalAmbiente(itens: ItemCalc[], comissoes: ComissaoCalc[]): number {
  return itens.reduce((soma, item) => soma + calcularItem(item, comissoes).totalFinal, 0);
}

export function totalOrcamento(ambientes: { itens: ItemCalc[] }[], comissoes: ComissaoCalc[]): number {
  return ambientes.reduce((soma, ambiente) => soma + totalAmbiente(ambiente.itens, comissoes), 0);
}

export function totalInsumosOrcamento(ambientes: { itens: ItemCalc[] }[], comissoes: ComissaoCalc[]): number {
  return ambientes.reduce(
    (soma, ambiente) =>
      soma + ambiente.itens.reduce((s, item) => s + calcularItem(item, comissoes).totalCompra, 0),
    0
  );
}

// Formas de pagamento incidem sobre o valor total do orçamento (não por
// item): é uma decisão tomada no fechamento da compra inteira.
export function totalComFormaPagamento(total: number, percentual: number): number {
  return total * (1 + percentual / 100);
}
