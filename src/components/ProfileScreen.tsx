import { FormEvent, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import {
  MainGoal,
  ProjectProfile,
  SocialPriority,
  WorkType,
} from "../types/ecolar";
import {
  GOAL_LABELS,
  PRIORITY_SOCIAL_LABELS,
  STAGE_OPTIONS,
  WORK_TYPE_LABELS,
} from "../utils/formatters";

interface ProfileScreenProps {
  profile: ProjectProfile;
  onSaveProfile: (updated: ProjectProfile) => void;
  onResetDemo: () => void;
}

export function ProfileScreen({
  profile,
  onSaveProfile,
  onResetDemo,
}: ProfileScreenProps) {
  const [form, setForm] = useState<ProjectProfile>(profile);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Perfil da Obra
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Mantenha os dados da construção atualizados para que alertas e recomendações da IA sejam sempre precisos.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemo}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar dados iniciais
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Nome da obra
            </label>
            <input
              type="text"
              required
              value={form.nomeObra}
              onChange={(e) => setForm({ ...form, nomeObra: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Endereço ou bairro
            </label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Cidade / Estado
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                maxLength={2}
                value={form.uf}
                onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                className="w-20 px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Tipo de obra
            </label>
            <select
              value={form.tipoObra}
              onChange={(e) => setForm({ ...form, tipoObra: e.target.value as WorkType })}
              className={inputClass}
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
              Metragem estimada (m²)
            </label>
            <input
              type="number"
              min={10}
              value={form.metragem}
              onChange={(e) => setForm({ ...form, metragem: Number(e.target.value) || 0 })}
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Orçamento total (R$)
            </label>
            <input
              type="number"
              min={1000}
              step={500}
              value={form.orcamentoTotal}
              onChange={(e) =>
                setForm({ ...form, orcamentoTotal: Number(e.target.value) || 0 })
              }
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Etapa atual
            </label>
            <select
              value={form.etapaAtual}
              onChange={(e) => setForm({ ...form, etapaAtual: e.target.value })}
              className={inputClass}
            >
              {STAGE_OPTIONS.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Progresso geral (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.progressoGeral}
              onChange={(e) =>
                setForm({
                  ...form,
                  progressoGeral: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                })
              }
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Data de início
            </label>
            <input
              type="date"
              value={form.dataInicio}
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Previsão de conclusão
            </label>
            <input
              type="date"
              value={form.previsaoConclusao}
              onChange={(e) => setForm({ ...form, previsaoConclusao: e.target.value })}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Objetivo principal
            </label>
            <select
              value={form.objetivoPrincipal}
              onChange={(e) =>
                setForm({ ...form, objetivoPrincipal: e.target.value as MainGoal })
              }
              className={inputClass}
            >
              {Object.entries(GOAL_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Número de pessoas beneficiadas
            </label>
            <input
              type="number"
              min={1}
              value={form.pessoasBeneficiadas}
              onChange={(e) =>
                setForm({ ...form, pessoasBeneficiadas: Number(e.target.value) || 1 })
              }
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Renda / faixa social (opcional)
            </label>
            <select
              value={form.rendaFamilia}
              onChange={(e) => setForm({ ...form, rendaFamilia: e.target.value })}
              className={inputClass}
            >
              <option value="Até 2 salários mínimos">Até 2 salários mínimos</option>
              <option value="Entre 2 e 4 salários mínimos">Entre 2 e 4 salários mínimos</option>
              <option value="Entre 4 e 8 salários mínimos">Entre 4 e 8 salários mínimos</option>
              <option value="Acima de 8 salários mínimos">Acima de 8 salários mínimos</option>
              <option value="Prefiro não informar">Prefiro não informar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Prioridade da obra
            </label>
            <select
              value={form.prioridadeSocial}
              onChange={(e) =>
                setForm({ ...form, prioridadeSocial: e.target.value as SocialPriority })
              }
              className={inputClass}
            >
              {Object.entries(PRIORITY_SOCIAL_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {savedNotice ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Informações da obra salvas com sucesso.
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Construa melhor, gastando menos e desperdiçando menos.
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
