import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  EcolarState,
  MainGoal,
  ProjectPlanning,
  ProjectProfile,
  ProjectSetupState,
  ProjectState,
  ProjectStatus,
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
import { ProjectPlanningScreen } from "./ProjectPlanningScreen";

interface MyProjectsScreenProps {
  projects: ProjectState[];
  activeProjectId: string;
  onSelectAndOpenDashboard: (projectId: string) => void;
  onCreateProject: (nomeObra: string) => Promise<string>;
  onSaveProjectPlanning: (
    projectId: string,
    planning: ProjectPlanning
  ) => Promise<void>;
  onUpdateProjectInfo: (
    projectId: string,
    profile: ProjectProfile,
    status: ProjectStatus
  ) => void;
  onChangeStatus: (projectId: string, status: ProjectStatus) => void;
  onDeleteProject: (projectId: string) => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  em_andamento: "Em andamento",
  pausada: "Pausada",
  concluida: "Concluída",
};

const STATUS_TEXT_CLASS: Record<ProjectStatus, string> = {
  em_andamento: "text-emerald-700 dark:text-emerald-400",
  pausada: "text-amber-700 dark:text-amber-400",
  concluida: "text-slate-700 dark:text-slate-300",
};

const PLANNING_STATUS_LABELS: Record<
  ProjectSetupState["planning"]["status"],
  string
> = {
  nao_iniciado: "Planejamento não iniciado",
  em_andamento: "Planejamento em andamento",
  finalizado: "Planejamento finalizado",
};

function isProjectSetupState(
  project: ProjectState
): project is ProjectSetupState {
  return "kind" in project && project.kind === "setup";
}

export function MyProjectsScreen({
  projects,
  activeProjectId,
  onSelectAndOpenDashboard,
  onCreateProject,
  onSaveProjectPlanning,
  onUpdateProjectInfo,
  onChangeStatus,
  onDeleteProject,
}: MyProjectsScreenProps) {
  const [statusFilter, setStatusFilter] = useState<"todas" | ProjectStatus>("todas");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [planningProjectId, setPlanningProjectId] = useState<string | null>(null);
  const [createAttempt, setCreateAttempt] = useState<{
    nomeObra: string;
    existingProjectIds: Set<string>;
  } | null>(null);

  const [editingProject, setEditingProject] = useState<EcolarState | null>(null);
  const [editProfile, setEditProfile] = useState<ProjectProfile | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectStatus>("em_andamento");

  const [deleteTarget, setDeleteTarget] = useState<ProjectState | null>(null);

  const filteredProjects = useMemo(() => {
    if (statusFilter === "todas") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const counts = useMemo(() => {
    return {
      todas: projects.length,
      em_andamento: projects.filter((p) => p.status === "em_andamento").length,
      pausada: projects.filter((p) => p.status === "pausada").length,
      concluida: projects.filter((p) => p.status === "concluida").length,
    };
  }, [projects]);

  useEffect(() => {
    if (!createAttempt) return;
    const createdProject = projects.find(
      (project) =>
        !createAttempt.existingProjectIds.has(project.id) &&
        project.id === activeProjectId &&
        isProjectSetupState(project)
    );
    if (!createdProject) return;

    setPlanningProjectId(createdProject.id);
    setShowCreateModal(false);
    setCreateForm("");
    setCreateError(null);
    setCreateAttempt(null);
    setIsCreating(false);
  }, [activeProjectId, createAttempt, projects]);

  const handleOpenCreate = () => {
    if (!createAttempt) {
      setCreateForm("");
      setCreateError(null);
    }
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    if (isCreating) return;
    setShowCreateModal(false);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    const nomeObra = createAttempt?.nomeObra ?? createForm.trim();
    if (!nomeObra) {
      setCreateError("Informe o nome da obra para continuar.");
      return;
    }

    const attempt =
      createAttempt ?? {
        nomeObra,
        existingProjectIds: new Set(projects.map((project) => project.id)),
      };
    setCreateAttempt(attempt);
    setIsCreating(true);
    setCreateError(null);

    try {
      const createdProjectId = await onCreateProject(attempt.nomeObra);
      setPlanningProjectId(createdProjectId);
      setShowCreateModal(false);
      setCreateForm("");
      setCreateAttempt(null);
    } catch (error) {
      setCreateError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Não foi possível criar a obra. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (proj: EcolarState) => {
    setEditingProject(proj);
    setEditProfile({ ...proj.profile });
    setEditStatus(proj.status);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editProfile) return;
    onUpdateProjectInfo(editingProject.id, editProfile, editStatus);
    setEditingProject(null);
    setEditProfile(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    onDeleteProject(deleteTarget.id);
    setDeleteTarget(null);
  };

  const planningProject = projects.find(
    (project) => project.id === planningProjectId
  );
  if (planningProject && isProjectSetupState(planningProject)) {
    return (
      <ProjectPlanningScreen
        key={planningProject.id}
        project={planningProject}
        onSavePlanning={onSaveProjectPlanning}
        onExit={() => setPlanningProjectId(null)}
      />
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="space-y-6">
      {/* Cabeçalho da área Minhas Obras */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Minhas Obras
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gerencie e acompanhe cada obra separadamente com seu próprio diagnóstico, diário, gastos e IA Engenheiro.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar nova obra
        </button>
      </div>

      {/* Filtros por situação */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
          {[
            { id: "todas", label: `Todas (${counts.todas})` },
            { id: "em_andamento", label: `Em andamento (${counts.em_andamento})` },
            { id: "pausada", label: `Pausadas (${counts.pausada})` },
            { id: "concluida", label: `Concluídas (${counts.concluida})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Obras concluídas permanecem salvas no seu histórico para consulta.
        </p>
      </div>

      {/* Lista de cards das obras */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {projects.length === 0
              ? "Nenhuma obra cadastrada no momento"
              : "Nenhuma obra encontrada neste filtro"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {projects.length === 0
              ? "Cadastre sua primeira obra para iniciar o diagnóstico sustentável e o acompanhamento diário."
              : "Altere o filtro acima ou cadastre uma nova obra para acompanhar separadamente."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar nova obra
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            if (isProjectSetupState(proj)) {
              return (
                <article
                  key={proj.id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-6 flex flex-col justify-between gap-5 ${
                    isActive
                      ? "border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${STATUS_TEXT_CLASS[proj.status]}`}>
                        {STATUS_LABELS[proj.status]}
                      </span>
                      {isActive && (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Selecionada
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {proj.profile.nomeObra}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {PLANNING_STATUS_LABELS[proj.planning.status]}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(proj)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      aria-label={`Excluir ${proj.profile.nomeObra}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectAndOpenDashboard(proj.id)}
                      disabled={isActive}
                      aria-current={isActive ? "true" : undefined}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? "text-emerald-800 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 cursor-default"
                          : "text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
                      }`}
                    >
                      {isActive ? "Obra selecionada" : "Selecionar obra"}
                      {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </article>
              );
            }

            const totalSpent = proj.expenses.reduce((s, e) => s + e.valorPago, 0);

            return (
              <article
                key={proj.id}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-6 flex flex-col justify-between gap-5 ${
                  isActive
                    ? "border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-semibold ${STATUS_TEXT_CLASS[proj.status]}`}>
                        {STATUS_LABELS[proj.status]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {WORK_TYPE_LABELS[proj.profile.tipoObra] ?? proj.profile.tipoObra}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{proj.profile.metragem} m²</span>
                    </div>

                    {isActive && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Em acompanhamento agora
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {proj.profile.nomeObra}
                    </h2>
                    <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>
                        {proj.profile.endereco ? `${proj.profile.endereco} · ` : ""}
                        {proj.profile.cidade}/{proj.profile.uf}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Etapa atual:{" "}
                        <strong className="font-semibold text-slate-900 dark:text-slate-100">
                          {proj.profile.etapaAtual}
                        </strong>
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {proj.status === "concluida" ? 100 : proj.profile.progressoGeral}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          proj.status === "pausada"
                            ? "bg-amber-500"
                            : "bg-emerald-700 dark:bg-emerald-500"
                        }`}
                        style={{
                          width: `${
                            proj.status === "concluida"
                              ? 100
                              : proj.profile.progressoGeral
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">Orçamento</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatBRL(proj.profile.orcamentoTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">Gasto registrado</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatBRL(totalSpent)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400">Diário da obra</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {proj.diary.length} {proj.diary.length === 1 ? "registro" : "registros"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${proj.id}`} className="sr-only">
                      Situação da obra
                    </label>
                    <select
                      id={`status-${proj.id}`}
                      value={proj.status}
                      onChange={(e) =>
                        onChangeStatus(proj.id, e.target.value as ProjectStatus)
                      }
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="em_andamento">Em andamento</option>
                      <option value="pausada">Pausada</option>
                      <option value="concluida">Concluída</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(proj)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      aria-label={`Editar ${proj.profile.nomeObra}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(proj)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      aria-label={`Excluir ${proj.profile.nomeObra}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectAndOpenDashboard(proj.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Acessar acompanhamento
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: Adicionar nova obra */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Adicionar nova obra"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Adicionar nova obra
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Você poderá adicionar os detalhes da obra depois.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                disabled={isCreating}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Fechar cadastro"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-project-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Nome da obra *
                </label>
                <input
                  id="new-project-name"
                  type="text"
                  required
                  autoFocus
                  disabled={Boolean(createAttempt)}
                  value={createForm}
                  onChange={(e) => setCreateForm(e.target.value)}
                  placeholder="Ex: Reforma da minha casa"
                  className={inputClass}
                />
              </div>

              {createError && (
                <p
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {createError}
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating
                    ? "Salvando..."
                    : createAttempt
                      ? "Tentar novamente"
                      : "Cadastrar obra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar obra */}
      {editingProject && editProfile && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Editar obra"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Editar informações da obra
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setEditProfile(null);
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                aria-label="Fechar edição"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome da obra
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfile.nomeObra}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, nomeObra: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Situação da obra
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                    className={inputClass}
                  >
                    <option value="em_andamento">Em andamento</option>
                    <option value="pausada">Pausada</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de obra
                  </label>
                  <select
                    value={editProfile.tipoObra}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        tipoObra: e.target.value as WorkType,
                      })
                    }
                    className={inputClass}
                  >
                    {Object.entries(WORK_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Endereço ou bairro
                  </label>
                  <input
                    type="text"
                    value={editProfile.endereco}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, endereco: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cidade / UF
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editProfile.cidade}
                      onChange={(e) =>
                        setEditProfile({ ...editProfile, cidade: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      maxLength={2}
                      value={editProfile.uf}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          uf: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-16 px-2.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Etapa atual
                  </label>
                  <select
                    value={editProfile.etapaAtual}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, etapaAtual: e.target.value })
                    }
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
                    Metragem (m²)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={editProfile.metragem}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        metragem: Number(e.target.value) || 0,
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Orçamento (R$)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={editProfile.orcamentoTotal}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        orcamentoTotal: Number(e.target.value) || 0,
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Progresso geral (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editProfile.progressoGeral}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        progressoGeral: Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0)
                        ),
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Objetivo principal
                  </label>
                  <select
                    value={editProfile.objetivoPrincipal}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        objetivoPrincipal: e.target.value as MainGoal,
                      })
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
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditProfile(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer"
                >
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de exclusão */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão de obra"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Excluir obra cadastrada?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Você está prestes a excluir{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {deleteTarget.profile.nomeObra}
              </strong>
              . Todos os registros do diário, gastos e alertas desta obra serão removidos. As demais obras continuarão intactas.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Sim, excluir obra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
