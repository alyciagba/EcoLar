import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  FolderKanban,
  Hammer,
  LayoutDashboard,
  Leaf,
  ListChecks,
  LogOut,
  Loader2,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import {
  createNewProjectState,
  INITIAL_ECOLAR_STATE,
  NewProjectInput,
} from "./data/initialData";
import {
  AlertItem,
  AssistantTask,
  ChatMessage,
  DiagnosisResult,
  DiaryEntry,
  EcolarState,
  ExpenseItem,
  ProjectProfile,
  ProjectStatus,
  ScreenId,
  ThemePreference,
} from "./types/ecolar";
import { generateDiaryAutoSummary } from "./utils/formatters";
import {
  createUserProject,
  deleteUserProject,
  loadUserProjects,
  ProjectConflictError,
  updateUserProject,
} from "./lib/projectsRepository";
import { DashboardScreen } from "./components/DashboardScreen";
import { MyProjectsScreen } from "./components/MyProjectsScreen";
import { DiagnosisScreen } from "./components/DiagnosisScreen";
import { ImprovementsScreen } from "./components/ImprovementsScreen";
import { AssistantScreen } from "./components/AssistantScreen";
import { DiaryScreen } from "./components/DiaryScreen";
import { AiEngineerScreen } from "./components/AiEngineerScreen";
import { ImpactPanelScreen } from "./components/ImpactPanelScreen";
import { ExpensesScreen } from "./components/ExpensesScreen";
import { AlertsScreen } from "./components/AlertsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SettingsScreen } from "./components/SettingsScreen";

const THEME_STORAGE_KEY = "ecolar_theme_preference_v1";

interface MultiProjectStore {
  activeProjectId: string;
  projects: EcolarState[];
}

type ProjectSaveOperation =
  | { kind: "create"; project: EcolarState }
  | { kind: "update"; apply: (project: EcolarState) => EcolarState }
  | { kind: "delete" };

interface SaveStatus {
  state: "saving" | "error";
  message?: string;
  requiresReload?: boolean;
}

const NAV_GROUPS: Array<{
  title: string;
  items: Array<{ id: ScreenId; label: string; icon: typeof LayoutDashboard }>;
}> = [
  {
    title: "Principal",
    items: [
      { id: "dashboard", label: "Início", icon: LayoutDashboard },
      { id: "obras", label: "Minhas Obras", icon: FolderKanban },
      { id: "diagnostico", label: "Diagnóstico", icon: ClipboardCheck },
      { id: "melhorias", label: "Ranking de Melhorias", icon: ListChecks },
      { id: "assistente", label: "Assistente Diário", icon: Hammer },
    ],
  },
  {
    title: "Acompanhamento",
    items: [
      { id: "diario", label: "Diário da Obra", icon: BookOpen },
      { id: "ia", label: "IA Engenheiro", icon: MessageSquare },
      { id: "impacto", label: "Economia e Impacto", icon: BarChart3 },
    ],
  },
  {
    title: "Controle da Obra",
    items: [
      { id: "gastos", label: "Gastos e Materiais", icon: Wallet },
      { id: "alertas", label: "Alertas", icon: Bell },
      { id: "perfil", label: "Perfil da Obra", icon: Building2 },
      { id: "configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

const SCREEN_TITLES: Record<ScreenId, string> = {
  dashboard: "Início",
  obras: "Minhas Obras",
  diagnostico: "Diagnóstico Inteligente",
  melhorias: "Ranking de Melhorias",
  assistente: "Assistente de Construção",
  diario: "Diário da Obra",
  ia: "IA Engenheiro",
  impacto: "Economia e Impacto",
  gastos: "Gastos e Materiais",
  alertas: "Alertas",
  perfil: "Perfil da Obra",
  configuracoes: "Configurações",
};

function loadInitialTheme(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "claro" || saved === "escuro" || saved === "automatico") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "claro";
}

interface AppProps {
  userId: string;
  onSignOut: () => Promise<void>;
}

export default function App({ userId, onSignOut }: AppProps) {
  const [store, setStore] = useState<MultiProjectStore>({
    activeProjectId: "",
    projects: [],
  });
  const storeRef = useRef(store);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveStatuses, setSaveStatuses] = useState<Record<string, SaveStatus>>({});
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const queuesRef = useRef(new Map<string, ProjectSaveOperation[]>());
  const processingProjectsRef = useRef(new Set<string>());
  const requestControllerRef = useRef<AbortController | null>(null);
  const sessionVersionRef = useRef(0);
  const sessionReadyRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const updatedAtByProjectRef = useRef(new Map<string, string>());
  const [themePreference, setThemePreference] = useState<ThemePreference>(loadInitialTheme);
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [activeScreen, setActiveScreen] = useState<ScreenId>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNewDiaryModal, setShowNewDiaryModal] = useState(false);
  const [pendingAiQuestion, setPendingAiQuestion] = useState<string | null>(null);

  const replaceStore = (nextStore: MultiProjectStore) => {
    storeRef.current = nextStore;
    setStore(nextStore);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    setSystemDark(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const resolvedTheme: "light" | "dark" =
    themePreference === "escuro" || (themePreference === "automatico" && systemDark)
      ? "dark"
      : "light";

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch {
      // ignore
    }
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themePreference, resolvedTheme]);

  const handleToggleQuickTheme = () => {
    setThemePreference(resolvedTheme === "dark" ? "claro" : "escuro");
  };

  useEffect(() => {
    const version = sessionVersionRef.current + 1;
    sessionVersionRef.current = version;
    const controller = new AbortController();
    requestControllerRef.current = controller;
    sessionActiveRef.current = true;
    sessionReadyRef.current = false;
    queuesRef.current.clear();
    processingProjectsRef.current.clear();
    updatedAtByProjectRef.current.clear();
    replaceStore({ activeProjectId: "", projects: [] });
    setSaveStatuses({});
    setLoadError(null);
    setIsLoadingProjects(true);

    void loadUserProjects(userId, controller.signal)
      .then((loadedProjects) => {
        if (
          controller.signal.aborted ||
          sessionVersionRef.current !== version ||
          !sessionActiveRef.current
        ) {
          return;
        }
        const projects = loadedProjects.map(({ project }) => project);
        updatedAtByProjectRef.current = new Map(
          loadedProjects.map(({ project, updatedAt }) => [project.id, updatedAt])
        );
        replaceStore({
          activeProjectId: projects[0]?.id ?? "",
          projects,
        });
        sessionReadyRef.current = true;
        setIsLoadingProjects(false);
      })
      .catch(() => {
        if (
          controller.signal.aborted ||
          sessionVersionRef.current !== version ||
          !sessionActiveRef.current
        ) {
          return;
        }
        setLoadError(
          "Não foi possível carregar suas obras. Verifique sua conexão e tente novamente."
        );
        setIsLoadingProjects(false);
      });

    return () => {
      sessionActiveRef.current = false;
      sessionReadyRef.current = false;
      controller.abort();
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      if (sessionVersionRef.current === version) {
        sessionVersionRef.current += 1;
      }
      queuesRef.current.clear();
      processingProjectsRef.current.clear();
      updatedAtByProjectRef.current.clear();
    };
  }, [userId, loadAttempt]);

  const activeProject = useMemo(() => {
    return (
      store.projects.find((p) => p.id === store.activeProjectId) ??
      store.projects[0] ??
      null
    );
  }, [store]);

  // Calcula indicadores dinâmicos isolados para a obra ativa
  const baselinePlanIds = useMemo(
    () => new Set(["imp-1", "imp-2", "imp-3", "imp-4", "imp-5", "imp-10"]),
    []
  );

  const deltaStats = useMemo(() => {
    if (!activeProject) {
      return {
        totalSavings: 0,
        totalWaterSaved: 0,
        totalCo2AvoidedKg: 0,
        totalWasteDivertedKg: 0,
        totalReusedKg: 0,
      };
    }

    const isSeedProject = activeProject.id === INITIAL_ECOLAR_STATE.id;
    let extraSavings = 0;
    let extraWater = 0;
    let extraCo2 = 0;
    let extraWaste = 0;

    activeProject.improvements.forEach((imp) => {
      const wasDefault = isSeedProject && baselinePlanIds.has(imp.id);
      if (imp.adicionadaAoPlano && !wasDefault) {
        extraSavings += Math.round(imp.economiaEstimada * 0.4);
        extraWater += imp.aguaEconomizadaLitros;
        extraCo2 += imp.co2EvitadoKg;
        extraWaste += imp.residuosEvitadosKg;
      } else if (!imp.adicionadaAoPlano && wasDefault) {
        extraSavings -= Math.round(imp.economiaEstimada * 0.25);
        extraWater -= Math.round(imp.aguaEconomizadaLitros * 0.5);
        extraCo2 -= Math.round(imp.co2EvitadoKg * 0.5);
        extraWaste -= Math.round(imp.residuosEvitadosKg * 0.5);
      }
    });

    return {
      totalSavings: Math.max(0, activeProject.baseSavings + extraSavings),
      totalWaterSaved: Math.max(0, activeProject.baseWaterSavedLiters + extraWater),
      totalCo2AvoidedKg: Math.max(0, activeProject.baseCo2AvoidedKg + extraCo2),
      totalWasteDivertedKg: Math.max(0, activeProject.baseWasteDivertedKg + extraWaste),
      totalReusedKg: Math.max(
        0,
        activeProject.baseReusedMaterialsKg + Math.round(extraWaste * 0.4)
      ),
    };
  }, [activeProject, baselinePlanIds]);

  const openAlertsCount = activeProject
    ? activeProject.alerts.filter((a) => !a.resolvido).length
    : 0;

  const processProjectQueue = async (projectId: string) => {
    if (
      processingProjectsRef.current.has(projectId) ||
      !sessionReadyRef.current ||
      !sessionActiveRef.current
    ) {
      return;
    }

    const queue = queuesRef.current.get(projectId);
    const controller = requestControllerRef.current;
    if (!queue?.length || !controller) return;

    const version = sessionVersionRef.current;
    processingProjectsRef.current.add(projectId);

    try {
      while (
        queue.length > 0 &&
        !controller.signal.aborted &&
        sessionVersionRef.current === version &&
        sessionActiveRef.current
      ) {
        const operation = queue[0];
        const currentProject = storeRef.current.projects.find(
          (project) => project.id === projectId
        );
        let nextStore: MultiProjectStore;

        if (operation.kind === "create") {
          const updatedAt = await createUserProject(
            userId,
            operation.project,
            controller.signal
          );
          updatedAtByProjectRef.current.set(operation.project.id, updatedAt);
          nextStore = {
            activeProjectId: operation.project.id,
            projects: [
              operation.project,
              ...storeRef.current.projects.filter(
                (project) => project.id !== operation.project.id
              ),
            ],
          };
        } else if (operation.kind === "update") {
          if (!currentProject) {
            throw new Error("A obra não está mais disponível nesta sessão.");
          }
          const updatedProject = operation.apply(currentProject);
          const expectedUpdatedAt =
            updatedAtByProjectRef.current.get(projectId);
          if (!expectedUpdatedAt) {
            throw new Error("A data de atualização da obra não está disponível.");
          }
          const updatedAt = await updateUserProject(
            userId,
            updatedProject,
            expectedUpdatedAt,
            controller.signal
          );
          updatedAtByProjectRef.current.set(projectId, updatedAt);
          nextStore = {
            ...storeRef.current,
            projects: storeRef.current.projects.map((project) =>
              project.id === projectId ? updatedProject : project
            ),
          };
        } else {
          const expectedUpdatedAt =
            updatedAtByProjectRef.current.get(projectId);
          if (!expectedUpdatedAt) {
            throw new Error("A data de atualização da obra não está disponível.");
          }
          await deleteUserProject(
            userId,
            projectId,
            expectedUpdatedAt,
            controller.signal
          );
          updatedAtByProjectRef.current.delete(projectId);
          const remainingProjects = storeRef.current.projects.filter(
            (project) => project.id !== projectId
          );
          nextStore = {
            activeProjectId:
              storeRef.current.activeProjectId === projectId
                ? remainingProjects[0]?.id ?? ""
                : storeRef.current.activeProjectId,
            projects: remainingProjects,
          };
        }

        if (
          controller.signal.aborted ||
          sessionVersionRef.current !== version ||
          !sessionActiveRef.current
        ) {
          return;
        }

        replaceStore(nextStore);
        queue.shift();
        if (queue.length === 0) {
          queuesRef.current.delete(projectId);
          setSaveStatuses((previous) => {
            const next = { ...previous };
            delete next[projectId];
            return next;
          });
        } else {
          setSaveStatuses((previous) => ({
            ...previous,
            [projectId]: { state: "saving" },
          }));
        }
      }
    } catch (error) {
      if (
        !controller.signal.aborted &&
        sessionVersionRef.current === version &&
        sessionActiveRef.current
      ) {
        const failedOperation = queue[0];
        const isConflict = error instanceof ProjectConflictError;
        const message = isConflict
          ? "Esta obra foi alterada em outra sessão. Esta alteração não foi salva; atualize as obras e aplique-a novamente."
          : failedOperation?.kind === "create"
            ? "Não foi possível criar a obra. Ela ainda não foi salva; tente novamente."
            : failedOperation?.kind === "delete"
              ? "Não foi possível excluir a obra. Ela continua salva; tente novamente."
              : "Não foi possível salvar as alterações da obra. Os dados anteriores continuam salvos; tente novamente.";
        setSaveStatuses((previous) => ({
          ...previous,
          [projectId]: {
            state: "error",
            message,
            requiresReload: isConflict,
          },
        }));
      }
    } finally {
      processingProjectsRef.current.delete(projectId);
    }
  };

  const enqueueProjectOperation = (
    projectId: string,
    operation: ProjectSaveOperation
  ) => {
    if (!sessionReadyRef.current || !sessionActiveRef.current) return;
    const queue = queuesRef.current.get(projectId) ?? [];
    queue.push(operation);
    queuesRef.current.set(projectId, queue);
    setSaveStatuses((previous) => ({
      ...previous,
      [projectId]: { state: "saving" },
    }));
    void processProjectQueue(projectId);
  };

  const retryFailedSaves = () => {
    const failedIds = Object.entries(saveStatuses)
      .filter(
        ([, saveStatus]) =>
          saveStatus.state === "error" && !saveStatus.requiresReload
      )
      .map(([projectId]) => projectId);

    for (const projectId of failedIds) {
      setSaveStatuses((previous) => ({
        ...previous,
        [projectId]: { state: "saving" },
      }));
      void processProjectQueue(projectId);
    }
  };

  const handleAppSignOut = async () => {
    setSignOutError(null);
    if (
      processingProjectsRef.current.size > 0 ||
      Object.values(saveStatuses).some((status) => status.state === "saving")
    ) {
      setSignOutError("Aguarde a conclusão do salvamento antes de sair da conta.");
      return;
    }

    try {
      await onSignOut();
    } catch {
      setSignOutError("Não foi possível encerrar a sessão. Tente novamente.");
    }
  };

  const updateActiveProject = (updater: (prev: EcolarState) => EcolarState) => {
    const currentStore = storeRef.current;
    const projectId =
      currentStore.projects.find(
        (project) => project.id === currentStore.activeProjectId
      )?.id ?? currentStore.projects[0]?.id;
    if (!projectId) return;
    enqueueProjectOperation(projectId, { kind: "update", apply: updater });
  };

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    setMobileMenuOpen(false);
  };

  const handleOpenNewDiary = () => {
    setActiveScreen("diario");
    setShowNewDiaryModal(true);
    setMobileMenuOpen(false);
  };

  const handleAskAi = (question: string) => {
    setPendingAiQuestion(question);
    setActiveScreen("ia");
    setMobileMenuOpen(false);
  };

  const handleToggleImprovement = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      improvements: prev.improvements.map((item) =>
        item.id === id
          ? { ...item, adicionadaAoPlano: !item.adicionadaAoPlano }
          : item
      ),
    }));
  };

  const handleUpdateTaskStatus = (
    id: string,
    status: "pendente" | "feito" | "adiado"
  ) => {
    updateActiveProject((prev) => ({
      ...prev,
      assistantTasks: prev.assistantTasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }));
  };

  const handleAddTaskToDiary = (task: AssistantTask) => {
    const baseData: Omit<DiaryEntry, "id" | "resumoAutomatico"> = {
      data: new Date().toISOString().slice(0, 10),
      etapaConcluida: task.etapaRelacionada,
      materiaisComprados: "Ação orientada pelo Assistente Ecolar",
      quantidadeMateriais: "—",
      valorGasto: 0,
      maoDeObra: "Equipe da obra",
      problemasEncontrados: "Nenhum",
      desperdicioPercebido: "Nenhum relevante",
      climaDoDia: "Nublado",
      observacoes: `${task.titulo}: ${task.mensagem}`,
    };
    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      ...baseData,
      resumoAutomatico: generateDiaryAutoSummary(baseData),
    };
    updateActiveProject((prev) => ({
      ...prev,
      diary: [newEntry, ...prev.diary],
    }));
  };

  const handleReportProblemFromTask = (
    task: AssistantTask,
    problemDesc: string
  ) => {
    const newAlert: AlertItem = {
      id: `al-${Date.now()}`,
      tipo: "problema_tecnico",
      titulo: `Problema registrado em: ${task.titulo}`,
      gravidade: "media",
      explicacao: problemDesc,
      acaoRecomendada:
        "Avalie o impacto na etapa atual ou consulte a IA Engenheiro antes de continuar.",
      resolvido: false,
      dataCriacao: new Date().toISOString().slice(0, 10),
    };
    const baseData: Omit<DiaryEntry, "id" | "resumoAutomatico"> = {
      data: new Date().toISOString().slice(0, 10),
      etapaConcluida: task.etapaRelacionada,
      materiaisComprados: "—",
      quantidadeMateriais: "—",
      valorGasto: 0,
      maoDeObra: "Equipe da obra",
      problemasEncontrados: problemDesc,
      desperdicioPercebido: "Baixo",
      climaDoDia: "Nublado",
      observacoes: `Ocorrência registrada a partir da recomendação "${task.titulo}".`,
    };
    const newDiary: DiaryEntry = {
      id: `diary-${Date.now() + 1}`,
      ...baseData,
      resumoAutomatico: generateDiaryAutoSummary(baseData),
    };
    updateActiveProject((prev) => ({
      ...prev,
      alerts: [newAlert, ...prev.alerts],
      diary: [newDiary, ...prev.diary],
    }));
  };

  const handleAddDiaryEntry = (entry: DiaryEntry) => {
    updateActiveProject((prev) => {
      const nextBudgets = prev.stageBudgets.map((sb) =>
        sb.etapa === entry.etapaConcluida
          ? { ...sb, realizado: sb.realizado + entry.valorGasto }
          : sb
      );
      return {
        ...prev,
        diary: [entry, ...prev.diary],
        stageBudgets: nextBudgets,
        profile: {
          ...prev.profile,
          progressoGeral: Math.min(100, prev.profile.progressoGeral + 2),
        },
      };
    });
  };

  const handleAddExpense = (expense: ExpenseItem) => {
    updateActiveProject((prev) => {
      const nextBudgets = prev.stageBudgets.map((sb) =>
        sb.etapa === expense.etapa
          ? { ...sb, realizado: sb.realizado + expense.valorPago }
          : sb
      );
      return {
        ...prev,
        expenses: [expense, ...prev.expenses],
        stageBudgets: nextBudgets,
      };
    });
  };

  const handleToggleAlert = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === id ? { ...a, resolvido: !a.resolvido } : a
      ),
    }));
  };

  const handleToggleWeeklyGoal = (id: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.map((g) =>
        g.id === id ? { ...g, concluida: !g.concluida } : g
      ),
    }));
  };

  const handleQuickProgressUpdate = (delta: number, note: string) => {
    if (!activeProject) return;
    const baseData: Omit<DiaryEntry, "id" | "resumoAutomatico"> = {
      data: new Date().toISOString().slice(0, 10),
      etapaConcluida: activeProject.profile.etapaAtual,
      materiaisComprados: "Atualização rápida",
      quantidadeMateriais: "—",
      valorGasto: 0,
      maoDeObra: "Equipe da obra",
      problemasEncontrados: "Nenhum",
      desperdicioPercebido: "Nenhum relevante",
      climaDoDia: "Ensolarado",
      observacoes: note,
    };
    const quickEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      ...baseData,
      resumoAutomatico: generateDiaryAutoSummary(baseData),
    };
    updateActiveProject((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        progressoGeral: Math.min(100, prev.profile.progressoGeral + delta),
      },
      diary: [quickEntry, ...prev.diary],
    }));
  };

  const handleUpdateProfileAndDiagnosis = (
    updatedProfile: ProjectProfile,
    updatedDiagnosis: DiagnosisResult
  ) => {
    updateActiveProject((prev) => ({
      ...prev,
      profile: updatedProfile,
      diagnosis: updatedDiagnosis,
    }));
  };

  const handleSaveProfile = (updatedProfile: ProjectProfile) => {
    updateActiveProject((prev) => ({
      ...prev,
      profile: updatedProfile,
    }));
  };

  const handleAddChatMessage = (msg: ChatMessage) => {
    updateActiveProject((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg],
    }));
  };

  const handleResetDemo = () => {
    if (!activeProject) return;
    if (activeProject.id === INITIAL_ECOLAR_STATE.id) {
      updateActiveProject(() => INITIAL_ECOLAR_STATE);
    } else {
      updateActiveProject((prev) => ({
        ...prev,
        diary: [],
        expenses: [],
        alerts: [],
      }));
    }
  };

  // Handlers de gerenciamento de múltiplas obras
  const handleSwitchProject = (projectId: string) => {
    setPendingAiQuestion(null);
    setShowNewDiaryModal(false);
    replaceStore({
      ...storeRef.current,
      activeProjectId: projectId,
    });
  };

  const handleSelectAndOpenDashboard = (projectId: string) => {
    setPendingAiQuestion(null);
    setShowNewDiaryModal(false);
    replaceStore({
      ...storeRef.current,
      activeProjectId: projectId,
    });
    setActiveScreen("dashboard");
  };

  const handleCreateProject = (input: NewProjectInput) => {
    const created = createNewProjectState(input);
    enqueueProjectOperation(created.id, { kind: "create", project: created });
  };

  const handleUpdateProjectInfo = (
    projectId: string,
    profile: ProjectProfile,
    status: ProjectStatus
  ) => {
    enqueueProjectOperation(projectId, {
      kind: "update",
      apply: (project) => ({
        ...project,
        status,
        profile: {
          ...profile,
          progressoGeral:
            status === "concluida" ? 100 : profile.progressoGeral,
        },
      }),
    });
  };

  const handleChangeProjectStatus = (
    projectId: string,
    status: ProjectStatus
  ) => {
    enqueueProjectOperation(projectId, {
      kind: "update",
      apply: (project) => ({
        ...project,
        status,
        profile: {
          ...project.profile,
          progressoGeral:
            status === "concluida" ? 100 : project.profile.progressoGeral,
        },
      }),
    });
  };

  const handleDeleteProject = (projectId: string) => {
    enqueueProjectOperation(projectId, { kind: "delete" });
  };

  const isSaving = Object.values(saveStatuses).some(
    (status) => status.state === "saving"
  );
  const saveError = Object.values(saveStatuses).find(
    (status) => status.state === "error"
  )?.message;
  const hasConflicts = Object.values(saveStatuses).some(
    (status) => status.state === "error" && status.requiresReload
  );

  if (isLoadingProjects) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-400" />
            <span>Carregando suas obras...</span>
          </div>
          <button
            type="button"
            onClick={() => void handleAppSignOut()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
          {signOutError && (
            <p className="max-w-md text-center text-sm text-red-700 dark:text-red-300" role="alert">
              {signOutError}
            </p>
          )}
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-9">
          <h1 className="text-xl font-bold">Não foi possível abrir suas obras</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400" role="alert">
            {loadError}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => void handleAppSignOut()}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Desktop (260px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Ecolar
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Navegação principal">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.id === "alertas" && openAlertsCount > 0 && (
                      <span className="font-mono text-xs font-semibold text-red-700 dark:text-red-400 tabular-nums">
                        {openAlertsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleToggleQuickTheme}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>{resolvedTheme === "dark" ? "Modo Dia" : "Modo Noite"}</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Alternar
            </span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Transforme sua obra em uma construção mais sustentável.
          </p>
        </div>
      </aside>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Ecolar
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {group.title}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          active
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        {item.id === "alertas" && openAlertsCount > 0 && (
                          <span className="font-mono text-xs font-semibold text-red-700 dark:text-red-400 tabular-nums">
                            {openAlertsCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleToggleQuickTheme}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                  <span>
                    {resolvedTheme === "dark" ? "Mudar para Modo Dia" : "Mudar para Modo Noite"}
                  </span>
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar seguindo o contrato de 3 zonas */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              {store.projects.length > 0 && activeProject ? (
                <select
                  aria-label="Obra em acompanhamento"
                  value={activeProject.id}
                  onChange={(e) => handleSwitchProject(e.target.value)}
                  className="max-w-[220px] sm:max-w-[280px] truncate font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  {store.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.profile.nomeObra}
                      {p.status === "concluida"
                        ? " (Concluída)"
                        : p.status === "pausada"
                        ? " (Pausada)"
                        : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Minhas Obras
                </span>
              )}
              <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                /
              </span>
              <span className="text-slate-600 dark:text-slate-300 truncate">
                {SCREEN_TITLES[activeScreen]}
              </span>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleNavigate("dashboard")}
              className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer ${
                activeScreen === "dashboard"
                  ? "text-emerald-800 dark:text-emerald-400 underline underline-offset-4"
                  : ""
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("obras")}
              className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer ${
                activeScreen === "obras"
                  ? "text-emerald-800 dark:text-emerald-400 underline underline-offset-4"
                  : ""
              }`}
            >
              Minhas Obras
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("diario")}
              className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer ${
                activeScreen === "diario"
                  ? "text-emerald-800 dark:text-emerald-400 underline underline-offset-4"
                  : ""
              }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("ia")}
              className={`hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer ${
                activeScreen === "ia"
                  ? "text-emerald-800 dark:text-emerald-400 underline underline-offset-4"
                  : ""
              }`}
            >
              IA Engenheiro
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void handleAppSignOut()}
              disabled={isSaving}
              aria-label="Sair da conta"
              title={isSaving ? "Aguarde o salvamento antes de sair" : "Sair da conta"}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
            <button
              type="button"
              onClick={handleOpenNewDiary}
              disabled={!activeProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo registro
            </button>
          </div>
        </header>

        {/* Conteúdo da tela ativa */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {signOutError && (
            <p className="mb-5 rounded-lg bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:bg-red-950/40 dark:text-red-200" role="alert">
              {signOutError}
            </p>
          )}
          {isSaving && (
            <p className="mb-5 flex items-center gap-2 rounded-lg bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200" role="status" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-700 dark:text-emerald-400" />
              Salvando alterações no Supabase...
            </p>
          )}
          {saveError && (
            <div className="mb-5 flex flex-col gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
              <p role="alert">{saveError}</p>
              <div className="flex shrink-0 gap-2">
                {hasConflicts && (
                  <button
                    type="button"
                    onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    Atualizar obras
                  </button>
                )}
                {Object.values(saveStatuses).some(
                  (status) => status.state === "error" && !status.requiresReload
                ) && (
                  <button
                    type="button"
                    onClick={retryFailedSaves}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            </div>
          )}
          {activeScreen === "configuracoes" && (
            <SettingsScreen
              themePreference={themePreference}
              resolvedTheme={resolvedTheme}
              onChangeTheme={setThemePreference}
            />
          )}

          {activeScreen !== "configuracoes" && (activeScreen === "obras" || !activeProject) && (
            <MyProjectsScreen
              projects={store.projects}
              activeProjectId={activeProject?.id ?? ""}
              onSelectAndOpenDashboard={handleSelectAndOpenDashboard}
              onCreateProject={handleCreateProject}
              onUpdateProjectInfo={handleUpdateProjectInfo}
              onChangeStatus={handleChangeProjectStatus}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeProject && activeScreen === "dashboard" && (
            <DashboardScreen
              key={activeProject.id}
              state={activeProject}
              totalSavings={deltaStats.totalSavings}
              totalWaterSaved={deltaStats.totalWaterSaved}
              totalCo2AvoidedKg={deltaStats.totalCo2AvoidedKg}
              totalWasteDivertedKg={deltaStats.totalWasteDivertedKg}
              onNavigate={handleNavigate}
              onOpenNewDiary={handleOpenNewDiary}
              onToggleWeeklyGoal={handleToggleWeeklyGoal}
              onToggleTaskStatus={handleUpdateTaskStatus}
              onQuickProgressUpdate={handleQuickProgressUpdate}
            />
          )}

          {activeProject && activeScreen === "diagnostico" && (
            <DiagnosisScreen
              key={activeProject.id}
              profile={activeProject.profile}
              diagnosis={activeProject.diagnosis}
              onUpdateProfileAndDiagnosis={handleUpdateProfileAndDiagnosis}
              onNavigate={handleNavigate}
            />
          )}

          {activeProject && activeScreen === "melhorias" && (
            <ImprovementsScreen
              key={activeProject.id}
              improvements={activeProject.improvements}
              onTogglePlan={handleToggleImprovement}
            />
          )}

          {activeProject && activeScreen === "assistente" && (
            <AssistantScreen
              key={activeProject.id}
              tasks={activeProject.assistantTasks}
              currentStage={activeProject.profile.etapaAtual}
              onUpdateStatus={handleUpdateTaskStatus}
              onAskAi={handleAskAi}
              onAddToDiary={handleAddTaskToDiary}
              onReportProblem={handleReportProblemFromTask}
            />
          )}

          {activeProject && activeScreen === "diario" && (
            <DiaryScreen
              key={activeProject.id}
              entries={activeProject.diary}
              stageBudgets={activeProject.stageBudgets}
              showNewModal={showNewDiaryModal}
              onSetShowNewModal={setShowNewDiaryModal}
              onAddEntry={handleAddDiaryEntry}
            />
          )}

          {activeProject && activeScreen === "ia" && (
            <AiEngineerScreen
              key={activeProject.id}
              state={activeProject}
              messages={activeProject.chatMessages}
              pendingQuestion={pendingAiQuestion}
              onClearPendingQuestion={() => setPendingAiQuestion(null)}
              onAddMessage={handleAddChatMessage}
            />
          )}

          {activeProject && activeScreen === "impacto" && (
            <ImpactPanelScreen
              key={activeProject.id}
              state={activeProject}
              totalSavings={deltaStats.totalSavings}
              totalWaterSaved={deltaStats.totalWaterSaved}
              totalCo2AvoidedKg={deltaStats.totalCo2AvoidedKg}
              totalWasteDivertedKg={deltaStats.totalWasteDivertedKg}
              totalReusedKg={deltaStats.totalReusedKg}
            />
          )}

          {activeProject && activeScreen === "gastos" && (
            <ExpensesScreen
              key={activeProject.id}
              expenses={activeProject.expenses}
              stageBudgets={activeProject.stageBudgets}
              totalBudget={activeProject.profile.orcamentoTotal}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeProject && activeScreen === "alertas" && (
            <AlertsScreen
              key={activeProject.id}
              alerts={activeProject.alerts}
              onToggleResolve={handleToggleAlert}
              onAskAi={handleAskAi}
            />
          )}

          {activeProject && activeScreen === "perfil" && (
            <ProfileScreen
              key={activeProject.id}
              profile={activeProject.profile}
              onSaveProfile={handleSaveProfile}
              onResetDemo={handleResetDemo}
            />
          )}
        </main>
      </div>
    </div>
  );
}
