export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataHora(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatarDataInput(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toISOString().slice(0, 10);
}
