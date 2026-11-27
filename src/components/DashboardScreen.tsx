import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Leaf,
  MessageSquare,
  Plus,
  Sparkles,
  AlertTriangle,
  Check,
} from "lucide-react";
import { EcolarState, ScreenId } from "../types/ecolar";
import { formatBRL, formatNumberBR } from "../utils/formatters";
import { SafeConstructionImage } from "./SafeConstructionImage";

interface DashboardScreenProps {
  state: EcolarState;
  totalSavings: number;
  totalWaterSaved: number;
  totalCo2AvoidedKg: number;
  totalWasteDivertedKg: number;
  onNavigate: (screen: ScreenId) => void;
  onOpenNewDiary: () => void;
  onToggleWeeklyGoal: (id: string) => void;
  onToggleTaskStatus: (id: string, status: "feito" | "adiado" | "pendente") => void;
  onQuickProgressUpdate: (delta: number, note: string) => void;
}

export function DashboardScreen({
  state,
  totalSavings,
  totalWaterSaved,
  totalCo2AvoidedKg,
  totalWasteDivertedKg,
  onNavigate,
  onOpenNewDiary,
  onToggleWeeklyGoal,
  onToggleTaskStatus,
  onQuickProgressUpdate,
}: DashboardScreenProps) {
  const [quickAnswerSaved, setQuickAnswerSaved] = useState<string | null>(null);

  const openAlerts = state.alerts.filter((a) => !a.resolvido);
  const topAlert =
    openAlerts.find((a) => a.gravidade === "alta") ?? openAlerts[0] ?? null;

  const pendingTasks = state.assistantTasks.filter((t) => t.status === "pendente");
  const nextRecommendedTask = pendingTasks[0] ?? state.assistantTasks[0];
  const recentDiary = state.diary.slice(0, 2);

  const totalSpent = state.expenses.reduce((acc, item) => acc + item.valorPago, 0);
  const budgetUsedPct = Math.min(
    100,
    Math.round((totalSpent / Math.max(1, state.profile.orcamentoTotal)) * 100)
  );

  const handleQuickCheck = (choice: "sim" | "parcial" | "nao") => {
    if (choice === "sim") {
      onQuickProgressUpdate(2, "Check-in rápido: etapa do dia concluída sem desperdício.");
      setQuickAnswerSaved("Progresso atualizado (+2%) e registro salvo no resumo da semana.");
    } else if (choice === "parcial") {
      onQuickProgressUpdate(1, "Check-in rápido: avanço parcial registrado no canteiro.");
      setQuickAnswerSaved("Avanço parcial registrado (+1%). Confira o Assistente de Construção.");
    } else {
      setQuickAnswerSaved("Dia marcado sem avanço físico. O Assistente ajustou os lembretes.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho contextual da obra + ações principais */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Economize na obra sem perder qualidade · {state.profile.cidade}/{state.profile.uf}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {state.profile.nomeObra}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
              <span>
                Etapa atual:{" "}
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  {state.profile.etapaAtual}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{state.profile.metragem} m²</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Orçamento {formatBRL(state.profile.orcamentoTotal)} ({budgetUsedPct}% utilizado)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNewDiary}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar atualização da obra
            </button>
            <button
              type="button"
              onClick={() => onNavigate("ia")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Conversar com a IA Engenheiro
            </button>
            <button
              type="button"
              onClick={() => onNavigate("assistente")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ver recomendações do dia
            </button>
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Progresso geral da obra
            </span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {state.profile.progressoGeral}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${state.profile.progressoGeral}%` }}
            />
          </div>
        </div>
      </section>

      {/* Alerta principal do dia + Resumo semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {topAlert && (
          <div className="lg:col-span-7 bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Alerta principal do dia</span>
                <span aria-hidden="true">·</span>
                <span>Gravidade {topAlert.gravidade}</span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {topAlert.titulo}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {topAlert.acaoRecomendada}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("alertas")}
                className="px-3.5 py-2 text-xs font-medium text-amber-950 dark:text-amber-100 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ver detalhes e resolver
              </button>
              <button
                type="button"
                onClick={() => onNavigate("ia")}
                className="text-xs font-medium text-amber-900 dark:text-amber-300 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Perguntar à IA Engenheiro
              </button>
            </div>
          </div>
        )}

        <div
          className={`${
            topAlert ? "lg:col-span-5" : "lg:col-span-12"
          } bg-emerald-900 dark:bg-emerald-950 border border-emerald-900 dark:border-emerald-800/70 text-white rounded-xl p-5 flex flex-col justify-between gap-4`}
        >
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-emerald-200 dark:text-emerald-300">
              Resumo semanal da obra
            </p>
            <p className="text-base font-semibold leading-snug text-white">
              Esta semana sua obra avançou 12%, economizou {formatBRL(1480)} e evitou aproximadamente 210 kg de resíduos.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-emerald-800 text-xs text-emerald-100">
            <span>
              {state.weeklyGoals.filter((g) => g.concluida).length} de{" "}
              {state.weeklyGoals.length} metas semanais cumpridas
            </span>
            <button
              type="button"
              onClick={() => onNavigate("impacto")}
              className="inline-flex items-center gap-1 font-medium text-white hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Abrir painel
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 principais cards obrigatórios em grade equilibrada */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Hoje na sua obra */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Hoje na sua obra
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {pendingTasks.length} tarefas para hoje
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Prioridade na etapa de {state.profile.etapaAtual}: conferir clima antes da execução e proteger areia com lona.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {state.assistantTasks.filter((t) => t.status === "feito").length} concluídas
            </span>
            <button
              type="button"
              onClick={() => onNavigate("assistente")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Abrir checklist
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* Card 2: Economia acumulada */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Economia acumulada
            </p>
            <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatBRL(totalSavings)}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Resultado das escolhas sustentáveis aplicadas e redução de desperdício de materiais.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Meta: {formatBRL(state.diagnosis.economiaPotencialEstimada)}
            </span>
            <button
              type="button"
              onClick={() => onNavigate("gastos")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ver gastos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* Card 3: Impacto ambiental */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Impacto ambiental
            </p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  CO₂ evitado
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatNumberBR(totalCo2AvoidedKg / 1000, 1)} t
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Droplets className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  Água economizada
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatNumberBR(totalWaterSaved)} L
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Resíduos desviados</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatNumberBR(totalWasteDivertedKg)} kg
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onNavigate("impacto")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Painel completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* Card 4: Próxima ação recomendada */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Próxima ação recomendada
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              {nextRecommendedTask ? nextRecommendedTask.titulo : "Todas as tarefas em dia"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {nextRecommendedTask
                ? nextRecommendedTask.mensagem
                : "Ótimo trabalho! Registre a evolução de hoje no Diário da Obra."}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {nextRecommendedTask && nextRecommendedTask.status === "pendente" ? (
              <button
                type="button"
                onClick={() => onToggleTaskStatus(nextRecommendedTask.id, "feito")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Marcar como feito
              </button>
            ) : (
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Concluída
              </span>
            )}
            <button
              type="button"
              onClick={() => onNavigate("melhorias")}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ver melhorias
            </button>
          </div>
        </article>
      </div>

      {/* Últimos registros do diário + Perguntas rápidas de recorrência e metas semanais */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 5: Últimos registros do diário */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Últimos registros do diário
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento com fotos, gastos e resumo automático do dia
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("diario")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ver linha do tempo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDiary.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Nenhum registro no diário desta obra ainda.{" "}
              <button
                type="button"
                onClick={onOpenNewDiary}
                className="font-semibold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
              >
                Adicionar primeiro registro
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentDiary.map((entry) => (
                <div
                  key={entry.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    <SafeConstructionImage
                      src={entry.fotoUrl}
                      alt={`Foto da etapa ${entry.etapaConcluida}`}
                      className="w-full h-full object-cover"
                      fallbackLabel={entry.etapaConcluida}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums">{entry.data}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {entry.etapaConcluida}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Clima: {entry.climaDoDia}</span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {entry.resumoAutomatico}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mão de obra: {entry.maoDeObra} · Gasto:{" "}
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatBRL(entry.valorGasto)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recorrência: Check-in rápido + Metas semanais */}
        <section className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atualização rápida de hoje</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              A obra avançou hoje conforme o planejado?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Responda em 1 toque para manter o progresso e a previsão de materiais sempre certos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickCheck("sim")}
                className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sim, etapa concluída
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheck("parcial")}
                className="px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Avançou parcialmente
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheck("nao")}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Obra parada hoje
              </button>
            </div>
            {quickAnswerSaved && (
              <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {quickAnswerSaved}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Metas da semana
            </h2>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.weeklyGoals.map((goal) => (
                <li key={goal.id} className="py-2.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => onToggleWeeklyGoal(goal.id)}
                    className="w-full text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        goal.concluida
                          ? "bg-emerald-700 dark:bg-emerald-600 border-emerald-700 dark:border-emerald-600 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-emerald-600 dark:group-hover:border-emerald-500"
                      }`}
                    >
                      {goal.concluida && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          goal.concluida
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {goal.titulo}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {goal.impactoTexto}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
