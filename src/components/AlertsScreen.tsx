import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { AlertItem, AlertType } from "../types/ecolar";

interface AlertsScreenProps {
  alerts: AlertItem[];
  isProjectSetup: boolean;
  onToggleResolve: (id: string) => void;
  onAskAi: (question: string) => void;
}

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  risco_desperdicio: "Risco de desperdício",
  clima: "Clima desfavorável",
  compra: "Compra necessária",
  orcamento: "Orçamento estourando",
  etapa_atrasada: "Etapa atrasada",
  oportunidade_economia: "Oportunidade de economia",
  decisao_sustentavel: "Decisão sustentável pendente",
  problema_tecnico: "Problema técnico registrado",
};

export function AlertsScreen({
  alerts,
  isProjectSetup,
  onToggleResolve,
  onAskAi,
}: AlertsScreenProps) {
  const [statusFilter, setStatusFilter] = useState<"abertos" | "todos" | "resolvidos">(
    "abertos"
  );
  const [gravityFilter, setGravityFilter] = useState<"todas" | "alta" | "media" | "baixa">(
    "todas"
  );

  const filtered = alerts.filter((a) => {
    if (statusFilter === "abertos" && a.resolvido) return false;
    if (statusFilter === "resolvidos" && !a.resolvido) return false;
    if (gravityFilter !== "todas" && a.gravidade !== gravityFilter) return false;
    return true;
  });

  const openCount = alerts.filter((a) => !a.resolvido).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Alertas da Obra
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isProjectSetup
              ? `${openCount} alertas registrados como ativos. A ausência de alertas não representa uma avaliação completa de riscos.`
              : `${openCount} alertas ativos exigindo atenção para evitar prejuízos, atrasos ou desperdício.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            {[
              { id: "abertos", label: `Abertos (${openCount})` },
              { id: "todos", label: "Todos" },
              {
                id: "resolvidos",
                label: `Resolvidos (${alerts.length - openCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            {[
              { id: "todas", label: "Gravidade: Todas" },
              { id: "alta", label: "Alta" },
              { id: "media", label: "Média" },
              { id: "baixa", label: "Baixa" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGravityFilter(tab.id as typeof gravityFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  gravityFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
          {isProjectSetup && alerts.length === 0
            ? "Nenhum alerta foi registrado. A obra ainda não passou por uma avaliação de riscos."
            : "Nenhum alerta encontrado para este filtro."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((al) => (
            <article
              key={al.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 space-y-3 ${
                al.resolvido
                  ? "border-slate-200 dark:border-slate-800 opacity-75"
                  : al.gravidade === "alta"
                  ? "border-red-200 dark:border-red-800/70"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-semibold ${
                      al.resolvido
                        ? "text-emerald-700 dark:text-emerald-400"
                        : al.gravidade === "alta"
                        ? "text-red-700 dark:text-red-400"
                        : al.gravidade === "media"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {al.resolvido ? "Resolvido" : `Gravidade ${al.gravidade}`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{ALERT_TYPE_LABELS[al.tipo]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{al.dataCriacao}</span>
                </div>
              </div>

              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {al.titulo}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {al.explicacao}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200">
                <strong className="font-semibold">Ação recomendada:</strong>{" "}
                {al.acaoRecomendada}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleResolve(al.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    al.resolvido
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      : "bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {al.resolvido ? "Reabrir alerta" : "Resolver"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskAi(
                      `Recebi este alerta na obra: "${al.titulo}". ${al.explicacao} Como resolvo isso da forma mais econômica?`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  Perguntar à IA
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
