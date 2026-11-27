import { EcolarState } from "../types/ecolar";
import { formatBRL, formatNumberBR } from "../utils/formatters";

interface ImpactPanelScreenProps {
  state: EcolarState;
  totalSavings: number;
  totalWaterSaved: number;
  totalCo2AvoidedKg: number;
  totalWasteDivertedKg: number;
  totalReusedKg: number;
}

export function ImpactPanelScreen({
  state,
  totalSavings,
  totalWaterSaved,
  totalCo2AvoidedKg,
  totalWasteDivertedKg,
  totalReusedKg,
}: ImpactPanelScreenProps) {
  const activeImprovements = state.improvements.filter((i) => i.adicionadaAoPlano);
  const expectedFinalSavings =
    totalSavings +
    activeImprovements.reduce((acc, i) => acc + Math.round(i.economiaEstimada * 0.45), 0);
  const wasteAvoidedPct = 58;
  const improvementPct = Math.min(
    94,
    Math.round(
      (state.diagnosis.notaSustentabilidade + state.diagnosis.notaEconomia) / 2 - 42
    )
  );

  const monthlySavingsSeries = [
    { mes: "Set", valor: 1120 },
    { mes: "Out", valor: 3980 },
    { mes: "Nov", valor: totalSavings },
    { mes: "Dez (prev.)", valor: Math.round(totalSavings * 1.35) },
    { mes: "Jan (prev.)", valor: expectedFinalSavings },
  ];
  const maxSeriesVal = Math.max(...monthlySavingsSeries.map((m) => m.valor), 1);

  const conventionalCost = state.profile.orcamentoTotal + expectedFinalSavings;
  const optimizedCost = state.profile.orcamentoTotal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Painel de Economia e Impacto
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Veja quanto sua obra já economizou em dinheiro, água, energia e resíduos desviados do aterro.
        </p>
      </div>

      {/* Todos os 9 indicadores principais solicitados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Economia acumulada</p>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatBRL(totalSavings)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dinheiro já poupado com compras planejadas e reúso
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Economia prevista até o fim da obra
          </p>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatBRL(expectedFinalSavings)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Considerando as {activeImprovements.length} soluções no plano
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Água economizada</p>
          <p className="mt-1 text-2xl font-bold font-mono text-sky-700 dark:text-sky-400 tabular-nums">
            {formatNumberBR(totalWaterSaved)} litros
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Equivale a cerca de 42 caixas d&apos;água de 1.000 L
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Energia prevista economizada
          </p>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            -{state.baseEnergyReductionPct}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Menos uso de ventilação artificial e lâmpadas de dia
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">CO₂ evitado</p>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(totalCo2AvoidedKg / 1000, 1)} toneladas
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Redução de cimento perdido e frete de curta distância
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resíduos desviados do aterro
          </p>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(totalWasteDivertedKg)} kg
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Entulho evitado e separado para reaproveitamento
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Materiais reaproveitados</p>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(totalReusedKg)} kg
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Madeira de fôrmas, sobras de bloco e esquadrias
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Desperdício evitado</p>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            {wasteAvoidedPct}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Em relação à média de obras sem acompanhamento
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Percentual de melhoria da obra
          </p>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            +{improvementPct}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Índice combinado de economia e sustentabilidade
          </p>
        </div>
      </div>

      {/* 4 gráficos simples e legíveis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Evolução da economia */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Evolução da economia acumulada
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crescimento mês a mês (realizado e projeção até a entrega)
            </p>
          </div>
          <div className="h-52 flex items-end gap-4 pt-6">
            {monthlySavingsSeries.map((pt, i) => {
              const heightPct = Math.max(12, Math.round((pt.valor / maxSeriesVal) * 100));
              const isProjected = i >= 3;
              return (
                <div
                  key={pt.mes}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatBRL(pt.valor)}
                  </span>
                  <div
                    className={`w-full max-w-[56px] rounded-t-md transition-all ${
                      isProjected
                        ? "bg-emerald-200 dark:bg-emerald-900/50 border border-dashed border-emerald-600 dark:border-emerald-500"
                        : "bg-emerald-700 dark:bg-emerald-500"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{pt.mes}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Gastos por etapa */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Gastos por etapa (Previsto vs Realizado)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Etapas já iniciadas e controle do orçamento
            </p>
          </div>
          <div className="space-y-3">
            {state.stageBudgets.slice(0, 6).map((sb) => {
              const maxBar = Math.max(sb.previsto, sb.realizado, 1);
              const realW = Math.round((sb.realizado / maxBar) * 100);
              return (
                <div key={sb.etapa} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {sb.etapa}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatBRL(sb.realizado)} / {formatBRL(sb.previsto)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${realW}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Impacto ambiental por solução */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Impacto ambiental por solução no plano
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CO₂ evitado (kg) e resíduos desviados por solução ativa
            </p>
          </div>
          {activeImprovements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6">
              Adicione soluções no Ranking de Melhorias para acompanhar o impacto individual aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {activeImprovements.slice(0, 5).map((imp) => {
                const w = Math.min(100, Math.round((imp.co2EvitadoKg / 800) * 100));
                return (
                  <div key={imp.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {imp.nome}
                      </span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums shrink-0">
                        {imp.co2EvitadoKg} kg CO₂
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Comparação obra convencional vs otimizada */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Obra convencional vs Obra otimizada Ecolar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparação prática de custo total, desperdício e conforto térmico
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Obra convencional (sem plano)
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                  {formatBRL(conventionalCost)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Desperdício médio de 18% · Sem reúso de água · Maior calor interno
              </p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Obra otimizada com Ecolar
                </span>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                  {formatBRL(optimizedCost)}
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Desperdício abaixo de 7% · Economia de {formatBRL(expectedFinalSavings)} ·{" "}
                -{state.baseEnergyReductionPct}% de energia prevista
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
