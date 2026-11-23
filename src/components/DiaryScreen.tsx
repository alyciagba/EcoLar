import { ChangeEvent, FormEvent, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import { DiaryEntry, StageBudget } from "../types/ecolar";
import { formatBRL, generateDiaryAutoSummary, STAGE_OPTIONS } from "../utils/formatters";
import { SafeConstructionImage } from "./SafeConstructionImage";

interface DiaryScreenProps {
  entries: DiaryEntry[];
  stageBudgets: StageBudget[];
  isProjectSetup: boolean;
  showNewModal: boolean;
  onSetShowNewModal: (open: boolean) => void;
  onAddEntry: (entry: DiaryEntry) => void;
}

const SAMPLE_PHOTOS = [
  {
    label: "Impermeabilização da viga",
    url: "/src/assets/images/diary_impermeabilizacao_1795373415970.jpg",
  },
  {
    label: "Alvenaria com ventilação",
    url: "/src/assets/images/diary_alvenaria_ventilacao_1795373415300.jpg",
  },
  {
    label: "Proteção de areia e madeira",
    url: "/src/assets/images/diary_madeira_reuso_1795373415336.jpg",
  },
  {
    label: "Telhado claro e cisterna",
    url: "/src/assets/images/diary_telhado_branco_1795373416006.jpg",
  },
];

function isDiaryClimate(value: string): value is DiaryEntry["climaDoDia"] {
  return (
    value === "Nao informado" ||
    value === "Ensolarado" ||
    value === "Nublado" ||
    value === "Chuvoso" ||
    value === "Vento forte"
  );
}

function isDiaryWasteLevel(
  value: string
): value is DiaryEntry["desperdicioPercebido"] {
  return (
    value === "Nao informado" ||
    value === "Nenhum relevante" ||
    value === "Baixo" ||
    value === "Medio" ||
    value === "Alto"
  );
}

export function DiaryScreen({
  entries,
  stageBudgets,
  isProjectSetup,
  showNewModal,
  onSetShowNewModal,
  onAddEntry,
}: DiaryScreenProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "galeria" | "gastos" | "problemas" | "comparacao"
  >("timeline");

  const [etapaConcluida, setEtapaConcluida] = useState(
    isProjectSetup ? "" : "Impermeabilização"
  );
  const [materiaisComprados, setMateriaisComprados] = useState("");
  const [quantidadeMateriais, setQuantidadeMateriais] = useState("");
  const [valorGasto, setValorGasto] = useState("");
  const [maoDeObra, setMaoDeObra] = useState(
    isProjectSetup ? "" : "1 pedreiro + 1 ajudante"
  );
  const [problemasEncontrados, setProblemasEncontrados] = useState(
    isProjectSetup ? "" : "Nenhum"
  );
  const [desperdicioPercebido, setDesperdicioPercebido] = useState<
    DiaryEntry["desperdicioPercebido"]
  >(isProjectSetup ? "Nao informado" : "Nenhum relevante");
  const [climaDoDia, setClimaDoDia] = useState<DiaryEntry["climaDoDia"]>(
    isProjectSetup ? "Nao informado" : "Ensolarado"
  );
  const [observacoes, setObservacoes] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string>(
    isProjectSetup ? "" : SAMPLE_PHOTOS[0].url
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericCost = Number(valorGasto);
    if (
      isProjectSetup &&
      (!valorGasto.trim() || !Number.isFinite(numericCost) || numericCost < 0)
    ) {
      setFormError(
        "Informe o gasto real do dia; use 0 somente se souber que não houve gasto."
      );
      return;
    }
    setFormError(null);
    const cost = Number(valorGasto) || 0;
    const baseData: Omit<DiaryEntry, "id" | "resumoAutomatico"> = {
      data: new Date().toISOString().slice(0, 10),
      etapaConcluida: etapaConcluida.trim(),
      materiaisComprados: isProjectSetup
        ? materiaisComprados.trim()
        : materiaisComprados.trim() || "Sem compra nova no dia",
      quantidadeMateriais: isProjectSetup
        ? quantidadeMateriais.trim()
        : quantidadeMateriais.trim() || "—",
      valorGasto: cost,
      maoDeObra: isProjectSetup
        ? maoDeObra.trim()
        : maoDeObra.trim() || "Equipe própria",
      problemasEncontrados: isProjectSetup
        ? problemasEncontrados.trim()
        : problemasEncontrados.trim() || "Nenhum",
      desperdicioPercebido,
      climaDoDia,
      observacoes: isProjectSetup
        ? observacoes.trim()
        : observacoes.trim() || "Registro diário salvo pelo Ecolar.",
      ...(fotoUrl ? { fotoUrl } : {}),
    };

    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      ...baseData,
      resumoAutomatico: generateDiaryAutoSummary(baseData),
    };

    onAddEntry(newEntry);
    setMateriaisComprados("");
    setQuantidadeMateriais("");
    setValorGasto("");
    setProblemasEncontrados(isProjectSetup ? "" : "Nenhum");
    setObservacoes("");
    if (isProjectSetup) {
      setEtapaConcluida("");
      setMaoDeObra("");
      setDesperdicioPercebido("Nao informado");
      setClimaDoDia("Nao informado");
      setFotoUrl("");
    }
    onSetShowNewModal(false);
  };

  const problemEntries = entries.filter(
    (e) =>
      e.problemasEncontrados.trim() !== "" &&
      e.problemasEncontrados.trim().toLowerCase() !== "nenhum"
  );
  const galleryEntries = isProjectSetup
    ? entries.filter((entry) => Boolean(entry.fotoUrl))
    : entries;

  const inputClass =
    "w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Diário da Obra
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Registre fotos, gastos, desperdício e problemas do dia. Cada registro gera um resumo automático.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSetShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo registro
        </button>
      </div>

      {/* Sub-navegação das 5 visões solicitadas */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-fit max-w-full overflow-x-auto">
        {[
          { id: "timeline", label: "Linha do tempo" },
          { id: "galeria", label: "Galeria de fotos" },
          { id: "gastos", label: "Histórico de gastos" },
          { id: "problemas", label: `Problemas (${problemEntries.length})` },
          { id: "comparacao", label: "Previsto vs Realizado" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "timeline" && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Nenhum registro no diário desta obra ainda. Clique em &ldquo;Novo registro&rdquo; para começar.
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-5"
              >
                <div className="w-full md:w-56 h-44 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                  {isProjectSetup && !entry.fotoUrl ? (
                    <div className="h-full flex items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Foto ainda não informada
                    </div>
                  ) : (
                    <SafeConstructionImage
                      src={entry.fotoUrl}
                      alt={`Foto da etapa ${entry.etapaConcluida || "não informada"}`}
                      className="w-full h-full object-cover"
                      fallbackLabel={entry.etapaConcluida || "Etapa não informada"}
                    />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {entry.data}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {entry.etapaConcluida || "Etapa ainda não informada"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Clima:{" "}
                      {entry.climaDoDia === "Nao informado"
                        ? "Não informado"
                        : entry.climaDoDia}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Desperdício:{" "}
                      {entry.desperdicioPercebido === "Nao informado"
                        ? "Não informado"
                        : entry.desperdicioPercebido}
                    </span>
                  </div>

                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    {entry.resumoAutomatico}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {entry.observacoes || "Ainda não informadas."}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">
                        Materiais e quantidade
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.materiaisComprados || "Ainda não informados"} (
                        {entry.quantidadeMateriais || "quantidade não informada"})
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">Mão de obra</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.maoDeObra || "Ainda não informada"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">
                        Valor gasto no dia
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatBRL(entry.valorGasto)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeTab === "galeria" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryEntries.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Nenhuma foto registrada nesta obra ainda.
            </div>
          ) : (
            galleryEntries.map((entry) => (
              <figure
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="h-52 w-full">
                  <SafeConstructionImage
                    src={entry.fotoUrl}
                    alt={entry.etapaConcluida}
                    className="w-full h-full object-cover"
                    fallbackLabel={entry.etapaConcluida}
                  />
                </div>
                <figcaption className="p-4 space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {entry.data} ·{" "}
                    {entry.climaDoDia === "Nao informado"
                      ? "Clima não informado"
                      : entry.climaDoDia}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {entry.etapaConcluida || "Etapa ainda não informada"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {entry.observacoes || "Observações ainda não informadas."}
                  </p>
                </figcaption>
              </figure>
            ))
          )}
        </div>
      )}

      {activeTab === "gastos" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4">Materiais registrados</th>
                <th className="py-3 px-4">Desperdício</th>
                <th className="py-3 px-4 text-right">Valor gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    {entry.data}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {entry.etapaConcluida || "Etapa ainda não informada"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {entry.materiaisComprados || "Ainda não informados"} (
                    {entry.quantidadeMateriais || "quantidade não informada"})
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {entry.desperdicioPercebido === "Nao informado"
                      ? "Não informado"
                      : entry.desperdicioPercebido}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatBRL(entry.valorGasto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "problemas" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
          {problemEntries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              {isProjectSetup
                ? "Nenhum problema foi registrado. Isso não significa que a obra foi avaliada e não possui problemas."
                : "Nenhum problema registrado até o momento."}
            </div>
          ) : (
            problemEntries.map((entry) => (
              <div key={entry.id} className="p-5 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums">{entry.data}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {entry.etapaConcluida}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {entry.problemasEncontrados}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{entry.observacoes}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "comparacao" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Comparação entre gasto previsto e realizado por etapa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhe o saldo de cada fase para evitar surpresas no orçamento.
            </p>
          </div>
          <div className="space-y-4">
            {isProjectSetup && stageBudgets.length === 0 && (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Os orçamentos por etapa ainda não foram informados. Esta comparação
                ficará disponível quando houver dados previstos e realizados.
              </p>
            )}
            {stageBudgets.map((sb) => {
              const pct = Math.min(100, Math.round((sb.realizado / Math.max(1, sb.previsto)) * 100));
              const over = sb.realizado > sb.previsto;
              return (
                <div key={sb.etapa} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {sb.etapa}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                      Realizado:{" "}
                      <strong
                        className={
                          over
                            ? "text-red-700 dark:text-red-400"
                            : "text-slate-900 dark:text-slate-100"
                        }
                      >
                        {formatBRL(sb.realizado)}
                      </strong>{" "}
                      / Previsto: {formatBRL(sb.previsto)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        over ? "bg-red-600 dark:bg-red-500" : "bg-emerald-700 dark:bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Novo Registro */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Novo registro no Diário da Obra"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Novo registro no Diário da Obra
              </h2>
              <button
                type="button"
                onClick={() => onSetShowNewModal(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                aria-label="Fechar janela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isProjectSetup && (
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Informações não preenchidas serão mostradas como não informadas.
                  Informe o valor gasto ou 0 se souber que não houve gasto.
                </p>
              )}
              {formError && (
                <p
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {formError}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Etapa concluída ou executada
                  </label>
                  <select
                    value={etapaConcluida}
                    onChange={(e) => setEtapaConcluida(e.target.value)}
                    className={inputClass}
                  >
                    {isProjectSetup && (
                      <option value="">Etapa ainda não informada</option>
                    )}
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clima do dia
                  </label>
                  <select
                    value={climaDoDia}
                    onChange={(e) => {
                      if (isDiaryClimate(e.target.value)) {
                        setClimaDoDia(e.target.value);
                      }
                    }}
                    className={inputClass}
                  >
                    {isProjectSetup && (
                      <option value="Nao informado">Ainda não informado</option>
                    )}
                    <option value="Ensolarado">Ensolarado</option>
                    <option value="Nublado">Nublado</option>
                    <option value="Chuvoso">Chuvoso</option>
                    <option value="Vento forte">Vento forte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Materiais comprados ou usados
                  </label>
                  <input
                    type="text"
                    value={materiaisComprados}
                    onChange={(e) => setMateriaisComprados(e.target.value)}
                    placeholder="Ex: Impermeabilizante, cimento, blocos..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quantidade de materiais
                  </label>
                  <input
                    type="text"
                    value={quantidadeMateriais}
                    onChange={(e) => setQuantidadeMateriais(e.target.value)}
                    placeholder="Ex: 10 sacos, 3 caixas..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valor gasto no dia (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={valorGasto}
                    required={isProjectSetup}
                    onChange={(e) => {
                      setValorGasto(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Ex: 780"
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mão de obra utilizada
                  </label>
                  <input
                    type="text"
                    value={maoDeObra}
                    onChange={(e) => setMaoDeObra(e.target.value)}
                    placeholder="Ex: 1 pedreiro + 1 servente"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Desperdício percebido
                  </label>
                  <select
                    value={desperdicioPercebido}
                    onChange={(e) => {
                      if (isDiaryWasteLevel(e.target.value)) {
                        setDesperdicioPercebido(e.target.value);
                      }
                    }}
                    className={inputClass}
                  >
                    {isProjectSetup && (
                      <option value="Nao informado">Ainda não informado</option>
                    )}
                    <option value="Nenhum relevante">Nenhum relevante</option>
                    <option value="Baixo">Baixo</option>
                    <option value="Medio">Médio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Problemas encontrados
                  </label>
                  <input
                    type="text"
                    value={problemasEncontrados}
                    onChange={(e) => setProblemasEncontrados(e.target.value)}
                    placeholder="Se não houver problema, escreva 'Nenhum'"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observações gerais
                </label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anote detalhes do serviço feito hoje..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isProjectSetup
                    ? "Foto do dia (opcional)"
                    : "Foto do dia (envie do aparelho ou selecione um modelo)"}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Enviar foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {!isProjectSetup && (
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PHOTOS.map((sp) => (
                        <button
                          key={sp.url}
                          type="button"
                          onClick={() => setFotoUrl(sp.url)}
                          className={`px-2.5 py-1.5 text-xs rounded-md border cursor-pointer ${
                            fotoUrl === sp.url
                              ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-medium"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onSetShowNewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  Salvar registro e gerar resumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
