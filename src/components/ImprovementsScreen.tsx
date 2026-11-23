import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { ImprovementItem } from "../types/ecolar";
import { formatBRL, formatNumberBR } from "../utils/formatters";

interface ImprovementsScreenProps {
  improvements: ImprovementItem[];
  isProjectSetup: boolean;
  onTogglePlan: (id: string) => void;
}

export function ImprovementsScreen({
  improvements,
  isProjectSetup,
  onTogglePlan,
}: ImprovementsScreenProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [costFilter, setCostFilter] = useState<string>("todos");
  const [impactFilter, setImpactFilter] = useState<string>("todos");

  const filtered = useMemo(() => {
    return improvements.filter((item) => {
      if (priorityFilter !== "todas" && item.prioridade !== priorityFilter) return false;
      if (impactFilter !== "todos" && item.impactoAmbiental !== impactFilter) return false;
      if (costFilter === "zero" && item.custoEstimado > 0) return false;
      if (costFilter === "baixo" && item.custoEstimado > 350) return false;
      if (costFilter === "medio" && item.custoEstimado <= 350) return false;
      return true;
    });
  }, [improvements, priorityFilter, costFilter, impactFilter]);

  const inPlan = improvements.filter((i) => i.adicionadaAoPlano);
  const totalPlannedEconomy = inPlan.reduce((s, i) => s + i.economiaEstimada, 0);
  const totalPlannedCost = inPlan.reduce((s, i) => s + i.custoEstimado, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Ranking de Melhorias
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isProjectSetup && improvements.length === 0
              ? "As melhorias e estimativas estarão disponíveis após informar os dados técnicos da obra."
              : "Soluções práticas ordenadas por economia real, impacto ambiental e facilidade de execução."}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">No plano da obra</p>
            <p className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {isProjectSetup && improvements.length === 0
                ? "Ainda não disponível"
                : `${inPlan.length} de ${improvements.length} soluções`}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Investimento estimado</p>
            <p className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {isProjectSetup && improvements.length === 0
                ? "Ainda não disponível"
                : formatBRL(totalPlannedCost)}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Economia projetada</p>
            <p className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {isProjectSetup && improvements.length === 0
                ? "Ainda não disponível"
                : formatBRL(totalPlannedEconomy)}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros divididos por prioridade, custo e impacto */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Prioridade:
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: "todas", label: "Todas" },
              { id: "Alta", label: "Alta" },
              { id: "Media", label: "Média" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPriorityFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  priorityFilter === opt.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Custo:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: "todos", label: "Todos" },
              { id: "zero", label: "Custo zero" },
              { id: "baixo", label: "Até R$ 350" },
              { id: "medio", label: "Acima de R$ 350" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCostFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  costFilter === opt.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Impacto:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: "todos", label: "Todos" },
              { id: "Alto", label: "Alto" },
              { id: "Medio", label: "Médio" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setImpactFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  impactFilter === opt.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de melhorias */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {isProjectSetup && improvements.length === 0
              ? "Nenhuma melhoria foi registrada. As recomendações ainda não estão disponíveis para esta obra."
              : "Nenhuma solução encontrada com esses filtros."}
          </p>
          {!(isProjectSetup && improvements.length === 0) && (
            <button
              type="button"
              onClick={() => {
                setPriorityFilter("todas");
                setCostFilter("todos");
                setImpactFilter("todos");
              }}
              className="mt-3 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item, idx) => (
            <article
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {String(idx + 1).padStart(2, "0")}. {item.categoria} · Prioridade{" "}
                    <strong
                      className={
                        item.prioridade === "Alta"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-300"
                      }
                    >
                      {item.prioridade}
                    </strong>
                  </span>
                  <span>Dificuldade: {item.dificuldade}</span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {item.nome}
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.explicacaoSimples}
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400">
                      Custo estimado
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {item.custoEstimado === 0 ? "R$ 0 (sem custo)" : formatBRL(item.custoEstimado)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400">
                      Economia estimada
                    </span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatBRL(item.economiaEstimada)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400">
                      Impacto ambiental
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.impactoAmbiental} ({formatNumberBR(item.co2EvitadoKg)} kg CO₂)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="font-medium text-slate-800 dark:text-slate-200">
                    Prazo ideal para decisão:
                  </strong>{" "}
                  {item.prazoIdeal} · {item.impactoResumo}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Evita ~{formatNumberBR(item.residuosEvitadosKg)} kg de resíduos
                </span>
                <button
                  type="button"
                  onClick={() => onTogglePlan(item.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    item.adicionadaAoPlano
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                      : "bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500"
                  }`}
                >
                  {item.adicionadaAoPlano ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      No plano da obra
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar ao plano da obra
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
