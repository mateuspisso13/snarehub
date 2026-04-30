export const MONTHS_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export const MONTHS_PT_SHORT = [
  "Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez",
];

export const FORMATS = ["Estático", "Carrossel", "Vídeo", "Reels", "Story"] as const;
export const CHANNELS = ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube"] as const;

export const STRATEGIC_PILLARS = [
  "Autoridade","Educação","Reconhecimento","Engajar","Inspirar",
  "Venda","Conexão","Institucional",
];

export const INTENTION_PILLARS = [
  "Educar","Inspirar","Engajar","Converter","Reter","Conexão","Reconhecimento",
];

export function pillarColor(pillar?: string | null): string {
  if (!pillar) return "muted";
  const p = pillar.toLowerCase();
  if (p.includes("autoridade")) return "pillar-autoridade";
  if (p.includes("educa") || p.includes("reconhec")) return "pillar-educacao";
  if (p.includes("engaj") || p.includes("inspir")) return "pillar-engajar";
  if (p.includes("vend") || p.includes("convert")) return "pillar-venda";
  if (p.includes("conex")) return "pillar-conexao";
  if (p.includes("instituc")) return "pillar-institucional";
  return "muted";
}
