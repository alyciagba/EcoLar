import { DiaryEntry } from "../types/ecolar";

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumberBR(value: number, decimals = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function generateDiaryAutoSummary(entry: Omit<DiaryEntry, "id" | "resumoAutomatico">): string {
  const etapaTexto = entry.etapaConcluida.trim()
    ? `Hoje foi registrada a execução de ${entry.etapaConcluida.toLowerCase()}.`
    : "Hoje foi registrado o andamento diário da obra.";

  const gastoTexto =
    entry.valorGasto > 0
      ? `Foram gastos ${formatBRL(entry.valorGasto)} em materiais`
      : "Não houve compra de materiais registrada";

  const desperdicioTexto =
    entry.desperdicioPercebido === "Nenhum relevante"
      ? "e não houve desperdício relevante informado."
      : `com nível de desperdício informado como ${entry.desperdicioPercebido.toLowerCase()}.`;

  const problemaTexto =
    entry.problemasEncontrados.trim() &&
    entry.problemasEncontrados.trim().toLowerCase() !== "nenhum"
      ? ` Atenção ao ponto registrado: ${entry.problemasEncontrados.trim()}.`
      : "";

  return `${etapaTexto} ${gastoTexto} ${desperdicioTexto}${problemaTexto}`;
}

export const WORK_TYPE_LABELS: Record<string, string> = {
  construcao: "Construção nova",
  reforma: "Reforma",
  ampliacao: "Ampliação",
  regularizacao: "Regularização",
};

export const GOAL_LABELS: Record<string, string> = {
  economizar: "Economizar dinheiro",
  reduzir_impacto: "Reduzir impacto ambiental",
  conforto_termico: "Melhorar conforto térmico",
  acelerar_obra: "Acelerar a obra",
  evitar_desperdicio: "Evitar desperdício de materiais",
};

export const PRIORITY_SOCIAL_LABELS: Record<string, string> = {
  menor_custo: "Menor custo possível",
  durabilidade: "Durabilidade e baixa manutenção",
  conforto: "Conforto para a família",
  acessibilidade: "Acessibilidade e segurança",
  sustentabilidade: "Sustentabilidade prática",
};

export const STAGE_OPTIONS = [
  "Planejamento e Terreno",
  "Fundação e Alicerce",
  "Impermeabilização",
  "Alvenaria e Estrutura",
  "Cobertura e Telhado",
  "Instalações Hidráulicas e Elétricas",
  "Reboco e Piso",
  "Acabamento e Pintura",
];
