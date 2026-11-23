import { supabase } from "./supabase";
import {
  EcolarState,
  LoadedProject,
  MainGoal,
  ProjectPlanning,
  ProjectPlanningAnswer,
  ProjectPlanningAnswers,
  ProjectPlanningLocation,
  ProjectPlanningStep,
  ProjectPlanningStatus,
  ProjectSetupProfile,
  ProjectSetupState,
  ProjectState,
  ProjectRecord,
  ProjectStatus,
  SocialPriority,
  WorkType,
} from "../types/ecolar";

export class ProjectConflictError extends Error {
  constructor() {
    super("A obra foi alterada em outra sessão.");
    this.name = "ProjectConflictError";
  }
}

function canonicalJson(value: unknown): string {
  const parsed = JSON.parse(JSON.stringify(value)) as unknown;
  const sortKeys = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(sortKeys);
    if (!item || typeof item !== "object") return item;
    return Object.fromEntries(
      Object.entries(item)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortKeys(child)])
    );
  };
  return JSON.stringify(sortKeys(parsed));
}

async function findUserProject(
  userId: string,
  projectId: string,
  signal: AbortSignal
): Promise<ProjectRecord | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, user_id, name, status, data, created_at, updated_at")
    .eq("id", projectId)
    .eq("user_id", userId)
    .abortSignal(signal)
    .maybeSingle();

  if (error) throw error;
  if (data === null) return null;
  if (!isProjectRecord(data)) {
    throw new Error("O Supabase retornou um registro de obra inválido.");
  }
  if (data.user_id !== userId) {
    throw new Error("O Supabase retornou uma obra fora da conta autenticada.");
  }
  requireUpdatedAt(data.updated_at);
  return data;
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return value === "em_andamento" || value === "pausada" || value === "concluida";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isProjectRecord(value: unknown): value is ProjectRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    hasOwn(value, "data") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isProjectPlanningStatus(
  value: unknown
): value is ProjectPlanningStatus {
  return (
    value === "nao_iniciado" ||
    value === "em_andamento" ||
    value === "finalizado"
  );
}

function isProjectPlanningStep(value: unknown): value is ProjectPlanningStep {
  return (
    value === "objetivo" ||
    value === "localizacao" ||
    value === "ambientes" ||
    value === "orcamento" ||
    value === "prazo" ||
    value === "contexto"
  );
}

function isMainGoal(value: unknown): value is MainGoal {
  return (
    value === "economizar" ||
    value === "reduzir_impacto" ||
    value === "conforto_termico" ||
    value === "acelerar_obra" ||
    value === "evitar_desperdicio"
  );
}

function isWorkType(value: unknown): value is WorkType {
  return (
    value === "construcao" ||
    value === "reforma" ||
    value === "ampliacao" ||
    value === "regularizacao"
  );
}

function isSocialPriority(value: unknown): value is SocialPriority {
  return (
    value === "menor_custo" ||
    value === "durabilidade" ||
    value === "conforto" ||
    value === "acessibilidade" ||
    value === "sustentabilidade"
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalFieldsValid(
  record: Record<string, unknown>,
  fields: ReadonlyArray<readonly [string, (value: unknown) => boolean]>
): boolean {
  return fields.every(
    ([key, isValid]) => !hasOwn(record, key) || isValid(record[key])
  );
}

function isInfrastructureAccess(value: unknown): boolean {
  if (!isRecord(value)) return false;

  const allowedFields = ["agua", "energia", "saneamento"];
  return Object.entries(value).every(
    ([key, enabled]) =>
      allowedFields.includes(key) && typeof enabled === "boolean"
  );
}

function isProjectSetupProfile(value: unknown): value is ProjectSetupProfile {
  if (!isRecord(value) || !isNonEmptyString(value.nomeObra)) return false;

  return isOptionalFieldsValid(value, [
    ["endereco", isString],
    ["cidade", isString],
    ["uf", isString],
    ["tipoObra", isWorkType],
    ["climaRegiao", isString],
    ["metragem", isFiniteNumber],
    ["tipoTerreno", isString],
    ["orcamentoTotal", isFiniteNumber],
    ["rendaFamilia", isString],
    ["objetivoPrincipal", isMainGoal],
    ["materiaisDefinidos", isString],
    ["etapaAtual", isString],
    ["progressoGeral", isFiniteNumber],
    [
      "possuiProjetoArquitetonico",
      (field) =>
        field === "sim_completo" || field === "basico" || field === "nao",
    ],
    ["acessoInfraestrutura", isInfrastructureAccess],
    ["prioridadeSocial", isSocialPriority],
    ["dataInicio", isString],
    ["previsaoConclusao", isString],
    ["pessoasBeneficiadas", isFiniteNumber],
  ]);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isPlanningAnswer<T>(
  value: unknown,
  isAnswerValue: (answerValue: unknown) => answerValue is T
): value is ProjectPlanningAnswer<T> {
  if (!isRecord(value)) return false;

  if (value.status === "respondido") {
    return (
      Object.prototype.hasOwnProperty.call(value, "value") &&
      isAnswerValue(value.value)
    );
  }

  return (
    (value.status === "nao_sei" || value.status === "adiado") &&
    !Object.prototype.hasOwnProperty.call(value, "value")
  );
}

function isProjectPlanningLocation(
  value: unknown,
  allowClear: boolean
): value is ProjectPlanningLocation {
  if (!isRecord(value)) return false;

  const allowedFields = ["endereco", "cidade", "uf"];
  const providedFields = Object.keys(value);
  return (
    providedFields.length > 0 &&
    providedFields.every(
      (key) =>
        allowedFields.includes(key) &&
        (isNonEmptyString(value[key]) ||
          (allowClear && value[key] === null))
    )
  );
}

function isProjectPlanningAnswers(
  value: unknown,
  allowLocationClear: boolean
): boolean {
  if (!isRecord(value)) return false;

  const optionalAnswers: Array<{
    key: keyof ProjectPlanning["respostas"];
    isValid: (answer: unknown) => boolean;
  }> = [
    { key: "objetivo", isValid: (answer) => isPlanningAnswer(answer, isMainGoal) },
    {
      key: "localizacao",
      isValid: (answer) =>
        isPlanningAnswer(answer, (location) =>
          isProjectPlanningLocation(location, allowLocationClear)
        ),
    },
    { key: "ambientes", isValid: (answer) => isPlanningAnswer(answer, isStringArray) },
    {
      key: "orcamentoDisponivel",
      isValid: (answer) =>
        isPlanningAnswer(
          answer,
          (amount): amount is number =>
            typeof amount === "number" &&
            Number.isFinite(amount) &&
            amount >= 0
        ),
    },
    {
      key: "prazoDesejado",
      isValid: (answer) =>
        isPlanningAnswer(answer, isNonEmptyString),
    },
    {
      key: "observacoes",
      isValid: (answer) =>
        isPlanningAnswer(answer, (text): text is string => typeof text === "string"),
    },
  ];

  return optionalAnswers.every(
    ({ key, isValid }) =>
      !Object.prototype.hasOwnProperty.call(value, key) ||
      isValid(value[key])
  );
}

function isProjectPlanning(
  value: unknown,
  allowLocationClear = false
): value is ProjectPlanning {
  if (!isRecord(value)) return false;

  return (
    isProjectPlanningStatus(value.status) &&
    (value.etapaAtual === null || isProjectPlanningStep(value.etapaAtual)) &&
    isProjectPlanningAnswers(value.respostas, allowLocationClear)
  );
}

function requireUpdatedAt(value: unknown): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("A obra não possui uma data de atualização válida.");
  }
  return value;
}

function isEcolarState(
  value: unknown,
  allowLocationClear = false
): value is EcolarState {
  if (!isRecord(value) || hasOwn(value, "kind")) return false;
  const project = value;
  const profile = project.profile;
  const diagnosis = project.diagnosis;
  if (
    !isRecord(profile) ||
    !isRecord(diagnosis)
  ) {
    return false;
  }

  return (
    (project.planning === undefined ||
      isProjectPlanning(project.planning, allowLocationClear)) &&
    typeof project.id === "string" &&
    isProjectStatus(project.status) &&
    typeof profile.nomeObra === "string" &&
    typeof profile.orcamentoTotal === "number" &&
    Array.isArray(project.improvements) &&
    Array.isArray(project.assistantTasks) &&
    Array.isArray(project.diary) &&
    Array.isArray(project.expenses) &&
    Array.isArray(project.stageBudgets) &&
    Array.isArray(project.alerts) &&
    Array.isArray(project.weeklyGoals) &&
    Array.isArray(project.chatMessages) &&
    typeof project.baseSavings === "number" &&
    typeof project.baseWaterSavedLiters === "number" &&
    typeof project.baseEnergyReductionPct === "number" &&
    typeof project.baseCo2AvoidedKg === "number" &&
    typeof project.baseWasteDivertedKg === "number" &&
    typeof project.baseReusedMaterialsKg === "number"
  );
}

function isProjectSetupState(
  value: unknown,
  allowLocationClear = false
): value is ProjectSetupState {
  if (!isRecord(value)) return false;

  return (
    value.kind === "setup" &&
    typeof value.id === "string" &&
    isProjectStatus(value.status) &&
    isProjectSetupProfile(value.profile) &&
    isProjectPlanning(value.planning, allowLocationClear) &&
    value.diagnosis === null &&
    Array.isArray(value.improvements) &&
    Array.isArray(value.assistantTasks) &&
    Array.isArray(value.diary) &&
    Array.isArray(value.expenses) &&
    Array.isArray(value.stageBudgets) &&
    Array.isArray(value.alerts) &&
    Array.isArray(value.weeklyGoals) &&
    Array.isArray(value.chatMessages) &&
    (value.baseSavings === null || isFiniteNumber(value.baseSavings)) &&
    (value.baseWaterSavedLiters === null ||
      isFiniteNumber(value.baseWaterSavedLiters)) &&
    (value.baseEnergyReductionPct === null ||
      isFiniteNumber(value.baseEnergyReductionPct)) &&
    (value.baseCo2AvoidedKg === null ||
      isFiniteNumber(value.baseCo2AvoidedKg)) &&
    (value.baseWasteDivertedKg === null ||
      isFiniteNumber(value.baseWasteDivertedKg)) &&
    (value.baseReusedMaterialsKg === null ||
      isFiniteNumber(value.baseReusedMaterialsKg))
  );
}

function isProjectState(
  value: unknown,
  allowLocationClear = false
): value is ProjectState {
  if (!isRecord(value)) return false;
  return hasOwn(value, "kind")
    ? isProjectSetupState(value, allowLocationClear)
    : isEcolarState(value, allowLocationClear);
}

function toProjectState(record: ProjectRecord): ProjectState {
  if (typeof record.name !== "string" || !isProjectStatus(record.status)) {
    throw new Error("Uma obra salva possui dados incompatíveis com o EcoLar.");
  }
  if (!isProjectState(record.data)) {
    throw new Error(
      "Uma obra salva está incompleta ou em um formato incompatível. Seus dados não foram substituídos."
    );
  }

  if (isProjectSetupState(record.data)) {
    return {
      ...record.data,
      id: record.id,
      status: record.status,
      profile: {
        ...record.data.profile,
        nomeObra: record.name,
      },
    };
  }

  return {
    ...record.data,
    id: record.id,
    status: record.status,
    profile: {
      ...record.data.profile,
      nomeObra: record.name,
    },
  };
}

function isSameProject(record: ProjectRecord, project: ProjectState): boolean {
  return (
    record.name === project.profile.nomeObra &&
    record.status === project.status &&
    canonicalJson(toProjectState(record)) === canonicalJson(project)
  );
}

function mergePlanning(
  current: ProjectPlanning | undefined,
  incoming: ProjectPlanning | undefined
): ProjectPlanning | undefined {
  if (!incoming) return current;

  const currentLocation = current?.respostas.localizacao;
  const incomingLocation = incoming.respostas.localizacao;
  const respostas: ProjectPlanningAnswers = {
    ...current?.respostas,
    ...incoming.respostas,
  };

  if (incomingLocation?.status === "respondido") {
    const mergedLocation: ProjectPlanningLocation =
      currentLocation?.status === "respondido"
        ? { ...currentLocation.value }
        : {};

    for (const field of ["endereco", "cidade", "uf"] as const) {
      if (!Object.prototype.hasOwnProperty.call(incomingLocation.value, field)) {
        continue;
      }

      const value = incomingLocation.value[field];
      if (value === null) {
        delete mergedLocation[field];
      } else if (value !== undefined) {
        mergedLocation[field] = value;
      }
    }

    if (Object.keys(mergedLocation).length > 0) {
      respostas.localizacao = {
        status: "respondido",
        value: mergedLocation,
      };
    } else {
      delete respostas.localizacao;
    }
  }

  return {
    ...current,
    ...incoming,
    respostas,
  };
}

function mergeProjectUpdate(
  current: ProjectState,
  incoming: ProjectState
): ProjectState {
  if (isProjectSetupState(current)) {
    if (!isProjectSetupState(incoming, true)) {
      throw new Error("Não é possível alterar o formato salvo da obra.");
    }

    const profile = {
      ...current.profile,
      ...incoming.profile,
    };
    const infrastructure = {
      ...current.profile.acessoInfraestrutura,
      ...incoming.profile.acessoInfraestrutura,
    };
    if (
      current.profile.acessoInfraestrutura ||
      incoming.profile.acessoInfraestrutura
    ) {
      profile.acessoInfraestrutura = infrastructure;
    }

    return {
      ...current,
      ...incoming,
      id: current.id,
      profile,
      planning: mergePlanning(current.planning, incoming.planning) ?? incoming.planning,
    };
  }

  if (isProjectSetupState(incoming, true)) {
    throw new Error("Não é possível alterar o formato salvo da obra.");
  }

  return {
    ...current,
    ...incoming,
    id: current.id,
    profile: {
      ...current.profile,
      ...incoming.profile,
    },
    planning: mergePlanning(current.planning, incoming.planning),
  };
}

export async function loadUserProjects(
  userId: string,
  signal: AbortSignal
): Promise<LoadedProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, user_id, name, status, data, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .abortSignal(signal);

  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error("O Supabase retornou uma lista de obras inválida.");
  }
  return data.map((record: unknown) => {
    if (!isProjectRecord(record)) {
      throw new Error("O Supabase retornou um registro de obra inválido.");
    }
    if (record.user_id !== userId) {
      throw new Error("O Supabase retornou uma obra fora da conta autenticada.");
    }
    return {
      project: toProjectState(record),
      updatedAt: requireUpdatedAt(record.updated_at),
    };
  });
}

export async function createUserProject(
  userId: string,
  project: ProjectState,
  signal: AbortSignal
): Promise<string> {
  if (!isProjectState(project)) {
    throw new Error("A nova obra possui dados incompatíveis com o EcoLar.");
  }
  const existing = await findUserProject(userId, project.id, signal);
  if (existing) {
    if (isSameProject(existing, project)) return existing.updated_at;
    throw new Error("Já existe uma obra com este identificador.");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      id: project.id,
      user_id: userId,
      name: project.profile.nomeObra,
      status: project.status,
      data: project,
      created_at: now,
      updated_at: now,
    })
    .abortSignal(signal)
    .select("updated_at")
    .single();

  if (error) throw error;
  return requireUpdatedAt(data.updated_at);
}

export async function updateUserProject(
  userId: string,
  project: ProjectState,
  expectedUpdatedAt: string,
  signal: AbortSignal
): Promise<string> {
  if (!isProjectState(project, true)) {
    throw new Error("A obra possui dados incompatíveis com o EcoLar.");
  }
  const existing = await findUserProject(userId, project.id, signal);
  if (!existing) throw new ProjectConflictError();
  const updatedProject = mergeProjectUpdate(
    toProjectState(existing),
    project
  );
  if (!isProjectState(updatedProject)) {
    throw new Error("A obra atualizada possui dados incompatíveis com o EcoLar.");
  }

  const expectedTime = Date.parse(expectedUpdatedAt);
  const nextUpdatedAt = new Date(
    Math.max(Date.now(), expectedTime + 1)
  ).toISOString();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: updatedProject.profile.nomeObra,
      status: updatedProject.status,
      data: updatedProject,
      updated_at: nextUpdatedAt,
    })
    .eq("id", project.id)
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .abortSignal(signal)
    .select("updated_at")
    .maybeSingle();

  if (error) throw error;
  if (data) return requireUpdatedAt(data.updated_at);

  const current = await findUserProject(userId, project.id, signal);
  if (current && isSameProject(current, updatedProject)) return current.updated_at;
  throw new ProjectConflictError();
}

export async function deleteUserProject(
  userId: string,
  projectId: string,
  expectedUpdatedAt: string,
  signal: AbortSignal
): Promise<void> {
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .abortSignal(signal)
    .select("updated_at")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const current = await findUserProject(userId, projectId, signal);
    if (current) throw new ProjectConflictError();
  }
}
