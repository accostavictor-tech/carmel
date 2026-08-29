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
export type EncargoCalc = { nome: string; percentual: number; nivel: number; ordem: number };

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

export function calcularItem(item: ItemCalc, encargos: EncargoCalc[]): ResultadoItem {
  const totalMateriais = totalMateriaisItem(item.materiais);
  const totalCompra = totalMateriais + (totalMateriais * item.percentualInsumosGerais) / 100;

  // "Lucro" é margem de lucro sobre o preço de venda (não markup sobre o custo):
  // margem = (venda - custo) / venda  →  venda = custo / (1 - margem/100).
  const margemLucro = Math.min(Math.max(item.percentualLucro, 0), 99.99);
  const totalVenda = margemLucro > 0 ? totalCompra / (1 - margemLucro / 100) : totalCompra;

  const numerosNiveis = [...new Set(encargos.map((e) => e.nivel))].sort((a, b) => a - b);

  let subtotal = totalVenda;
  const niveis: NivelCalculado[] = numerosNiveis.map((nivel) => {
    const baseInicial = subtotal;
    const encargosDoNivel = encargos
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

  return { totalMateriais, totalCompra, totalVenda, niveis, totalFinal: subtotal };
}

export function totalAmbiente(itens: ItemCalc[], encargos: EncargoCalc[]): number {
  return itens.reduce((soma, item) => soma + calcularItem(item, encargos).totalFinal, 0);
}

export function totalOrcamento(ambientes: { itens: ItemCalc[] }[], encargos: EncargoCalc[]): number {
  return ambientes.reduce((soma, ambiente) => soma + totalAmbiente(ambiente.itens, encargos), 0);
}

export function totalInsumosOrcamento(ambientes: { itens: ItemCalc[] }[], encargos: EncargoCalc[]): number {
  return ambientes.reduce(
    (soma, ambiente) =>
      soma + ambiente.itens.reduce((s, item) => s + calcularItem(item, encargos).totalCompra, 0),
    0
  );
}
