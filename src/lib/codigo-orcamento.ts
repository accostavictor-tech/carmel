// Código do orçamento no formato AAMM + sequência do mês + letra de revisão,
// ex: "2608" + "1" + "A" = "26081A" (1º orçamento de agosto/2026, revisão A).
// Uma nova revisão do mesmo orçamento reaproveita o prefixo e a sequência,
// avançando só a letra (B, C, ...).

const PADRAO_CODIGO = /^(\d{4})(\d+)([A-Z])$/;

export function prefixoDoMes(data: Date): string {
  const ano = String(data.getFullYear()).slice(-2);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${ano}${mes}`;
}

export function gerarProximoCodigo(existentes: string[], data: Date = new Date()): string {
  const prefixo = prefixoDoMes(data);

  const maiorSequencia = existentes.reduce((max, codigo) => {
    const partes = codigo.match(PADRAO_CODIGO);
    if (!partes || partes[1] !== prefixo) return max;
    return Math.max(max, Number(partes[2]));
  }, 0);

  return `${prefixo}${maiorSequencia + 1}A`;
}

// Próxima letra de revisão para um código existente (ex: "26081A" -> "26081B").
export function proximaRevisao(codigo: string): string | null {
  const partes = codigo.match(PADRAO_CODIGO);
  if (!partes) return null;

  const [, prefixo, sequencia, letra] = partes;
  const proximaLetra = String.fromCharCode(letra.charCodeAt(0) + 1);
  return `${prefixo}${sequencia}${proximaLetra}`;
}
