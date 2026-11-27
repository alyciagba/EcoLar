import { ChangeEvent, FormEvent, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import { DiaryEntry, StageBudget } from "../types/ecolar";
import { formatBRL, generateDiaryAutoSummary, STAGE_OPTIONS } from "../utils/formatters";
import { SafeConstructionImage } from "./SafeConstructionImage";

interface DiaryScreenProps {
  entries: DiaryEntry[];
  stageBudgets: StageBudget[];
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

export function DiaryScreen({
  entries,
  stageBudgets,
  showNewModal,
  onSetShowNewModal,
  onAddEntry,
}: DiaryScreenProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "galeria" | "gastos" | "problemas" | "comparacao"
  >("timeline");

  const [etapaConcluida, setEtapaConcluida] = useState("Impermeabilização");
  const [materiaisComprados, setMateriaisComprados] = useState("");
  const [quantidadeMateriais, setQuantidadeMateriais] = useState("");
  const [valorGasto, setValorGasto] = useState("");
  const [maoDeObra, setMaoDeObra] = useState("1 pedreiro + 1 ajudante");
  const [problemasEncontrados, setProblemasEncontrados] = useState("Nenhum");
  const [desperdicioPercebido, setDesperdicioPercebido] = useState<
    DiaryEntry["desperdicioPercebido"]
  >("Nenhum relevante");
  const [climaDoDia, setClimaDoDia] = useState<DiaryEntry["climaDoDia"]>("Ensolarado");
  const [observacoes, setObservacoes] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string>(SAMPLE_PHOTOS[0].url);

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
    const numericCost = Number(valorGasto) || 0;
    const baseData: Omit<DiaryEntry, "id" | "resumoAutomatico"> = {
      data: new Date().toISOString().slice(0, 10),
      etapaConcluida,
      materiaisComprados: materiaisComprados.trim() || "Sem compra nova no dia",
      quantidadeMateriais: quantidadeMateriais.trim() || "—",
      valorGasto: numericCost,
      maoDeObra: maoDeObra.trim() || "Equipe própria",
      problemasEncontrados: problemasEncontrados.trim() || "Nenhum",
      desperdicioPercebido,
      climaDoDia,
      observacoes: observacoes.trim() || "Registro diário salvo pelo Ecolar.",
      fotoUrl,
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
    setProblemasEncontrados("Nenhum");
    setObservacoes("");
    onSetShowNewModal(false);
  };

  const problemEntries = entries.filter(
    (e) =>
      e.problemasEncontrados.trim() !== "" &&
      e.problemasEncontrados.trim().toLowerCase() !== "nenhum"
  );

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
                  <SafeConstructionImage
                    src={entry.fotoUrl}
                    alt={`Foto da etapa ${entry.etapaConcluida}`}
                    className="w-full h-full object-cover"
                    fallbackLabel={entry.etapaConcluida}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {entry.data}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {entry.etapaConcluida}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Clima: {entry.climaDoDia}</span>
                    <span aria-hidden="true">·</span>
                    <span>Desperdício: {entry.desperdicioPercebido}</span>
                  </div>

                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    {entry.resumoAutomatico}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {entry.observacoes}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">
                        Materiais e quantidade
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.materiaisComprados} ({entry.quantidadeMateriais})
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">Mão de obra</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.maoDeObra}
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
          {entries.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Nenhuma foto registrada nesta obra ainda.
            </div>
          ) : (
            entries.map((entry) => (
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
                    {entry.data} · {entry.climaDoDia}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {entry.etapaConcluida}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {entry.observacoes}
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
                    {entry.etapaConcluida}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {entry.materiaisComprados} ({entry.quantidadeMateriais})
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {entry.desperdicioPercebido}
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
              Nenhum problema registrado até o momento.
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
                    onChange={(e) => setClimaDoDia(e.target.value as DiaryEntry["climaDoDia"])}
                    className={inputClass}
                  >
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
                    onChange={(e) => setValorGasto(e.target.value)}
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
                    onChange={(e) =>
                      setDesperdicioPercebido(
                        e.target.value as DiaryEntry["desperdicioPercebido"]
                      )
                    }
                    className={inputClass}
                  >
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
                    placeholder="Nenhum ou descreva o problema"
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
                  Foto do dia (envie do aparelho ou selecione um modelo)
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
