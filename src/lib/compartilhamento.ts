import { randomBytes } from "crypto";

export const PRAZO_VALIDADE_DIAS = 21;

export function gerarLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

export type Validade = {
  validoAte: Date;
  diasRestantes: number;
  expirado: boolean;
};

export function calcularValidade(compartilhadoEm: Date): Validade {
  const validoAte = new Date(compartilhadoEm);
  validoAte.setDate(validoAte.getDate() + PRAZO_VALIDADE_DIAS);

  const diasRestantes = Math.ceil((validoAte.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return { validoAte, diasRestantes, expirado: diasRestantes < 0 };
}

// User-agents de bots que geram preview de link (WhatsApp, Telegram, redes sociais, etc.)
// — não devem contar como o cliente tendo aberto o orçamento.
const PADRAO_BOT = /bot|crawl|spider|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|linkedinbot|twitterbot|skypeuripreview|google-inspectiontool|pinterest|vkshare|w3c_validator|preview/i;

export function pareceBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return PADRAO_BOT.test(userAgent);
}
