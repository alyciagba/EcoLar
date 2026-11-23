import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import {
  DiagnosisResult,
  MainGoal,
  ProjectProfile,
  ScreenId,
  SocialPriority,
  WorkType,
} from "../types/ecolar";
import {
  formatBRL,
  GOAL_LABELS,
  PRIORITY_SOCIAL_LABELS,
  STAGE_OPTIONS,
  WORK_TYPE_LABELS,
} from "../utils/formatters";

interface DiagnosisScreenProps {
  profile: ProjectProfile;
  diagnosis: DiagnosisResult;
  onUpdateProfileAndDiagnosis: (
    updatedProfile: ProjectProfile,
    updatedDiagnosis: DiagnosisResult
  ) => void;
  onNavigate: (screen: ScreenId) => void;
}

export function DiagnosisScreen({
  profile,
  diagnosis,
  onUpdateProfileAndDiagnosis,
  onNavigate,
}: DiagnosisScreenProps) {
  const [form, setForm] = useState<ProjectProfile>(profile);
  const [viewMode, setViewMode] = useState<"resultado" | "questionario">("resultado");
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const computeLocalDiagnosis = (p: ProjectProfile): DiagnosisResult => {
    const baseCostPerSqm =
      p.tipoObra === "construcao"
        ? 1950
        : p.tipoObra === "ampliacao"
        ? 1450
        : p.tipoObra === "reforma"
        ? 890
        : 320;
    const estMin = Math.round(p.metragem * baseCostPerSqm * 0.85);
    const estMax = Math.round(p.metragem * baseCostPerSqm * 1.05);
    const hasProjectBonus =
      p.possuiProjetoArquitetonico === "sim_completo"
        ? 12
        : p.possuiProjetoArquitetonico === "basico"
        ? 6
        : 0;
    const notaSust = Math.min(96, 70 + hasProjectBonus + (p.objetivoPrincipal === "reduzir_impacto" ? 8 : 5));
    const notaEcon = Math.min(95, 74 + hasProjectBonus + (p.objetivoPrincipal === "economizar" ? 9 : 4));
    const notaEnerg = Math.min(92, 68 + (p.objetivoPrincipal === "conforto_termico" ? 14 : 8));
    const desperdicio = p.possuiProjetoArquitetonico === "nao" ? 16 : p.possuiProjetoArquitetonico === "basico" ? 9 : 5;
    const potencial = Math.round(Math.max(4500, p.orcamentoTotal * 0.21));

    return {
      notaSustentabilidade: notaSust,
      notaEconomia: notaEcon,
      notaEficienciaEnergetica: notaEnerg,
      custoEstimadoMin: estMin,
      custoEstimadoMax: estMax,
      desperdicioEstimadoPercentual: desperdicio,
      economiaPotencialEstimada: potencial,
      oportunidadesCusto: 8,
      solucoesConforto: 5,
      resumoDiagnostico:
        "Sua obra tem alto potencial de economia. Identificamos 8 oportunidades para reduzir custos e 5 soluções para melhorar o conforto térmico com baixo investimento.",
      principaisRiscos: [
        {
          titulo:
            p.possuiProjetoArquitetonico === "nao"
              ? "Falta de projeto executivo aumenta retrabalho"
              : "Perda de materiais no canteiro por chuva e dosagem",
          nivel: "alto",
          explicacao:
            p.possuiProjetoArquitetonico === "nao"
              ? "Construir sem planta básica eleva quebras de parede e compras fora de hora. Use o Assistente Ecolar antes de cada etapa."
              : "Sem proteção com lona e dosagem padrão de massa, o desperdício pode chegar a 15% do cimento e areia.",
        },
        {
          titulo: "Umidade e impermeabilização inadequada",
          nivel: "medio",
          explicacao:
            "Falhas na proteção da fundação e áreas molhadas geram infiltrações caras de corrigir depois da pintura.",
        },
        {
          titulo: `Desconforto térmico no clima (${p.climaRegiao.split("(")[0].trim()})`,
          nivel: "medio",
          explicacao:
            "Sem telhado claro e ventilação cruzada, os ambientes internos acumulam calor e exigem mais energia elétrica.",
        },
      ],
      atualizadoEm: new Date().toISOString().slice(0, 10),
    };
  };

  const handleRecalculate = async (useAi: boolean) => {
    setErrorMsg(null);
    if (!useAi) {
      const nextDiag = computeLocalDiagnosis(form);
      onUpdateProfileAndDiagnosis(form, nextDiag);
      setViewMode("resultado");
      return;
    }

    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao calcular diagnóstico inteligente.");
      }
      const d = data.diagnosis;
      const merged: DiagnosisResult = {
        notaSustentabilidade: d.notaSustentabilidade ?? 80,
        notaEconomia: d.notaEconomia ?? 85,
        notaEficienciaEnergetica: d.notaEficienciaEnergetica ?? 76,
        custoEstimadoMin: d.custoEstimadoMin ?? form.orcamentoTotal * 0.85,
        custoEstimadoMax: d.custoEstimadoMax ?? form.orcamentoTotal * 1.02,
        desperdicioEstimadoPercentual: d.desperdicioEstimadoPercentual ?? 9,
        economiaPotencialEstimada: d.economiaPotencialEstimada ?? Math.round(form.orcamentoTotal * 0.2),
        resumoDiagnostico: d.resumoDiagnostico,
        oportunidadesCusto: 8,
        solucoesConforto: 5,
        principaisRiscos: Array.isArray(d.principaisRiscos)
          ? d.principaisRiscos.map((r: { titulo: string; nivel: string; explicacao: string }) => ({
              titulo: r.titulo,
              nivel:
                r.nivel === "alto" || r.nivel === "medio" || r.nivel === "baixo"
                  ? r.nivel
                  : "medio",
              explicacao: r.explicacao,
            }))
          : diagnosis.principaisRiscos,
        atualizadoEm: new Date().toISOString().slice(0, 10),
      };
      onUpdateProfileAndDiagnosis(form, merged);
      setViewMode("resultado");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível conectar com a IA agora."
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const fieldClass =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Diagnóstico Inteligente
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Entenda os custos, riscos e oportunidades sustentáveis da sua obra em linguagem simples.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("resultado")}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === "resultado"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Resultado do diagnóstico
          </button>
          <button
            type="button"
            onClick={() => setViewMode("questionario")}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === "questionario"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Responder / Editar perguntas (13)
          </button>
        </div>
      </div>

      {viewMode === "resultado" ? (
        <div className="space-y-6">
          {/* Resumo principal do diagnóstico */}
          <section className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                Diagnóstico atualizado em {diagnosis.atualizadoEm} · {profile.nomeObra}
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {diagnosis.resumoDiagnostico}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Economia potencial estimada até o fim da obra:{" "}
                <strong className="font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
                  {formatBRL(diagnosis.economiaPotencialEstimada)}
                </strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate("melhorias")}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ver Ranking de Melhorias
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("questionario")}
                className="px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Refazer perguntas
              </button>
            </div>
          </section>

          {/* Notas e estimativas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Nota de sustentabilidade</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                {diagnosis.notaSustentabilidade}/100
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                  style={{ width: `${diagnosis.notaSustentabilidade}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Nota de economia</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                {diagnosis.notaEconomia}/100
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                  style={{ width: `${diagnosis.notaEconomia}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Eficiência energética</p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {diagnosis.notaEficienciaEnergetica}/100
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full"
                  style={{ width: `${diagnosis.notaEficienciaEnergetica}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Estimativa de custo da obra</p>
              <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {formatBRL(diagnosis.custoEstimadoMin)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                até {formatBRL(diagnosis.custoEstimadoMax)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Estimativa de desperdício</p>
              <p className="mt-1 text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                {diagnosis.desperdicioEstimadoPercentual}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Meta Ecolar: abaixo de 5%
              </p>
            </div>
          </div>

          {/* Principais riscos da obra */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Principais riscos identificados na sua obra
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {diagnosis.principaisRiscos.map((risco, idx) => (
                <div
                  key={idx}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={`font-semibold ${
                          risco.nivel === "alto"
                            ? "text-red-700 dark:text-red-400"
                            : risco.nivel === "medio"
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        Risco {risco.nivel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Atenção preventiva</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {risco.titulo}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {risco.explicacao}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate("ia")}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Tirar dúvida com IA
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Fluxo completo com todas as 13 perguntas solicitadas */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRecalculate(true);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Questionário da Obra (13 perguntas essenciais)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Preencha com o que você já sabe. As respostas ajustam o ranking de melhorias, os alertas e as respostas da IA Engenheiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                1. Tipo de obra
              </label>
              <select
                value={form.tipoObra}
                onChange={(e) => setForm({ ...form, tipoObra: e.target.value as WorkType })}
                className={fieldClass}
              >
                {Object.entries(WORK_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                2. Localização da obra (Cidade / Estado)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  placeholder="Ex: Contagem"
                  className={fieldClass}
                />
                <input
                  type="text"
                  maxLength={2}
                  value={form.uf}
                  onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                  placeholder="MG"
                  className="w-20 px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                3. Clima da região
              </label>
              <select
                value={form.climaRegiao}
                onChange={(e) => setForm({ ...form, climaRegiao: e.target.value })}
                className={fieldClass}
              >
                <option value="Tropical de altitude (verões quentes e chuvosos, noites amenas)">
                  Tropical de altitude (verões quentes e chuvosos)
                </option>
                <option value="Quente e úmido o ano todo (litoral / norte)">
                  Quente e úmido o ano todo
                </option>
                <option value="Quente e seco (semiárido / centro-oeste)">
                  Quente e seco (sol forte e baixa umidade)
                </option>
                <option value="Subtropical (verão quente e inverno frio)">
                  Subtropical (verão quente e inverno frio)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                4. Tamanho estimado da obra (m²)
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                value={form.metragem}
                onChange={(e) => setForm({ ...form, metragem: Number(e.target.value) || 0 })}
                className={`${fieldClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                5. Tipo de terreno
              </label>
              <select
                value={form.tipoTerreno}
                onChange={(e) => setForm({ ...form, tipoTerreno: e.target.value })}
                className={fieldClass}
              >
                <option value="Terreno plano com solo firme">Terreno plano com solo firme</option>
                <option value="Terreno em declive ou aclive">Terreno em declive ou aclive</option>
                <option value="Terreno úmido ou próximo a área de água">Terreno úmido ou com drenagem lenta</option>
                <option value="Aterro ou terreno já construído">Aterro / casa já existente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                6. Orçamento disponível (R$)
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                value={form.orcamentoTotal}
                onChange={(e) => setForm({ ...form, orcamentoTotal: Number(e.target.value) || 0 })}
                className={`${fieldClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                7. Renda aproximada da família
              </label>
              <select
                value={form.rendaFamilia}
                onChange={(e) => setForm({ ...form, rendaFamilia: e.target.value })}
                className={fieldClass}
              >
                <option value="Até 2 salários mínimos">Até 2 salários mínimos</option>
                <option value="Entre 2 e 4 salários mínimos">Entre 2 e 4 salários mínimos</option>
                <option value="Entre 4 e 8 salários mínimos">Entre 4 e 8 salários mínimos</option>
                <option value="Acima de 8 salários mínimos">Acima de 8 salários mínimos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                8. Objetivo principal
              </label>
              <select
                value={form.objetivoPrincipal}
                onChange={(e) => setForm({ ...form, objetivoPrincipal: e.target.value as MainGoal })}
                className={fieldClass}
              >
                {Object.entries(GOAL_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                9. Materiais já definidos ou comprados
              </label>
              <input
                type="text"
                value={form.materiaisDefinidos}
                onChange={(e) => setForm({ ...form, materiaisDefinidos: e.target.value })}
                placeholder="Ex: Bloco cerâmico, telha de fibrocimento, cimento CP-II..."
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                10. Etapa atual da obra
              </label>
              <select
                value={form.etapaAtual}
                onChange={(e) => setForm({ ...form, etapaAtual: e.target.value })}
                className={fieldClass}
              >
                {STAGE_OPTIONS.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                11. Existência de projeto arquitetônico
              </label>
              <select
                value={form.possuiProjetoArquitetonico}
                onChange={(e) =>
                  setForm({
                    ...form,
                    possuiProjetoArquitetonico: e.target.value as
                      | "sim_completo"
                      | "basico"
                      | "nao",
                  })
                }
                className={fieldClass}
              >
                <option value="sim_completo">Sim, projeto completo com engenheiro/arquiteto</option>
                <option value="basico">Tenho apenas croqui / planta básica</option>
                <option value="nao">Ainda não tenho projeto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                12. Acesso no terreno
              </label>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acessoInfraestrutura.agua}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        acessoInfraestrutura: {
                          ...form.acessoInfraestrutura,
                          agua: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-emerald-700 rounded"
                  />
                  Água encanada
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acessoInfraestrutura.energia}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        acessoInfraestrutura: {
                          ...form.acessoInfraestrutura,
                          energia: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-emerald-700 rounded"
                  />
                  Energia elétrica
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acessoInfraestrutura.saneamento}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        acessoInfraestrutura: {
                          ...form.acessoInfraestrutura,
                          saneamento: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-emerald-700 rounded"
                  />
                  Rede de esgoto / fossa
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                13. Prioridade social para sua família
              </label>
              <select
                value={form.prioridadeSocial}
                onChange={(e) =>
                  setForm({ ...form, prioridadeSocial: e.target.value as SocialPriority })
                }
                className={fieldClass}
              >
                {Object.entries(PRIORITY_SOCIAL_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-sm text-red-800 dark:text-red-300">
              {errorMsg}{" "}
              <button
                type="button"
                onClick={() => handleRecalculate(false)}
                className="font-semibold underline ml-2 cursor-pointer"
              >
                Calcular localmente agora
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode("resultado")}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleRecalculate(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Salvar e atualizar cálculo
              </button>
              <button
                type="submit"
                disabled={loadingAi}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {loadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando obra com IA...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Gerar Diagnóstico com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
