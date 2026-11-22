import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Clock,
  CloudRain,
  MessageSquare,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { AssistantItemType, AssistantTask } from "../types/ecolar";

interface AssistantScreenProps {
  tasks: AssistantTask[];
  currentStage: string;
  onUpdateStatus: (id: string, status: "pendente" | "feito" | "adiado") => void;
  onAskAi: (question: string) => void;
  onAddToDiary: (task: AssistantTask) => void;
  onReportProblem: (task: AssistantTask, problemDesc: string) => void;
}

const TYPE_META: Record<
  AssistantItemType,
  { label: string; toneClass: string }
> = {
  clima: { label: "Alerta de clima", toneClass: "text-amber-800 dark:text-amber-300" },
  compra: { label: "Alerta de compra", toneClass: "text-sky-800 dark:text-sky-400" },
  desperdicio: { label: "Alerta de desperdício", toneClass: "text-red-700 dark:text-red-400" },
  tarefa: { label: "Tarefa de hoje", toneClass: "text-emerald-800 dark:text-emerald-400" },
  economia: { label: "Dica de economia", toneClass: "text-emerald-700 dark:text-emerald-400" },
  sustentabilidade: { label: "Sustentabilidade", toneClass: "text-emerald-700 dark:text-emerald-400" },
  lembrete: { label: "Lembrete da etapa", toneClass: "text-slate-700 dark:text-slate-300" },
  decisao: { label: "Decisão importante", toneClass: "text-amber-700 dark:text-amber-400" },
};

export function AssistantScreen({
  tasks,
  currentStage,
  onUpdateStatus,
  onAskAi,
  onAddToDiary,
  onReportProblem,
}: AssistantScreenProps) {
  const [filter, setFilter] = useState<"todos" | "pendente" | "feito" | "adiado">("todos");
  const [problemTaskId, setProblemTaskId] = useState<string | null>(null);
  const [problemText, setProblemText] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const visibleTasks = tasks.filter((t) =>
    filter === "todos" ? true : t.status === filter
  );

  const handleSubmitProblem = (task: AssistantTask) => {
    if (!problemText.trim()) return;
    onReportProblem(task, problemText.trim());
    setProblemText("");
    setProblemTaskId(null);
    setToastMsg("Problema registrado na tela de Alertas e no Diário da Obra.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Assistente de Construção
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Orientações práticas para hoje na etapa de{" "}
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {currentStage}
            </strong>
            .
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg self-start">
          {[
            { id: "todos", label: `Todos (${tasks.length})` },
            {
              id: "pendente",
              label: `Pendentes (${tasks.filter((t) => t.status === "pendente").length})`,
            },
            {
              id: "feito",
              label: `Feitos (${tasks.filter((t) => t.status === "feito").length})`,
            },
            {
              id: "adiado",
              label: `Adiados (${tasks.filter((t) => t.status === "adiado").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo diário de economia e clima */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
          <CloudRain className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Clima no canteiro hoje
            </p>
            <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">
              26 °C · Pancadas de chuva previstas à tarde. Proteja materiais secos.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <ShoppingCart className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Próxima compra crítica
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              12 sacos de cimento CP-II até sexta-feira para não parar a alvenaria.
            </p>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
          <Wrench className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              Dica rápida de economia
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
              Prepare massa em pequenas quantidades após 14h para evitar sobras no fim do dia.
            </p>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-emerald-900 dark:text-emerald-200">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Checklist e recomendações práticas */}
      <div className="space-y-4">
        {visibleTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Nenhum item nesta aba. Todas as orientações foram organizadas.
          </div>
        ) : (
          visibleTasks.map((task) => {
            const meta = TYPE_META[task.tipo];
            const isReporting = problemTaskId === task.id;
            return (
              <article
                key={task.id}
                className={`border rounded-xl p-5 space-y-4 ${
                  task.status === "feito"
                    ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className={`font-semibold ${meta.toneClass}`}>{meta.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>Etapa: {task.etapaRelacionada}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Estado:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {task.status === "feito"
                            ? "Feito"
                            : task.status === "adiado"
                            ? "Adiado"
                            : "Pendente"}
                        </strong>
                      </span>
                    </div>
                    <h2
                      className={`text-base font-semibold ${
                        task.status === "feito"
                          ? "line-through text-slate-500 dark:text-slate-500"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {task.titulo}
                    </h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {task.mensagem}
                    </p>
                  </div>
                </div>

                {/* Ações solicitadas no prompt */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(
                        task.id,
                        task.status === "feito" ? "pendente" : "feito"
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      task.status === "feito"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : "bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {task.status === "feito" ? "Concluído" : "Marcar como feito"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateStatus(
                        task.id,
                        task.status === "adiado" ? "pendente" : "adiado"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {task.status === "adiado" ? "Retomar hoje" : "Adiar"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setProblemTaskId(isReporting ? null : task.id)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Registrar problema
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onAskAi(
                        `Sobre "${task.titulo}" na etapa de ${task.etapaRelacionada}: ${task.mensagem} Como executar gastando menos e sem desperdício?`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    Perguntar à IA
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToDiary(task);
                      setToastMsg(`"${task.titulo}" adicionado ao Diário da Obra.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Adicionar ao diário
                  </button>
                </div>

                {isReporting && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={problemText}
                      onChange={(e) => setProblemText(e.target.value)}
                      placeholder="Descreva o problema encontrado (ex: parede ainda úmida, material atrasou)..."
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitProblem(task)}
                      className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Salvar problema
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
