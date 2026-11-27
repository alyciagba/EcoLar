import { supabase } from "./supabase";
import {
  EcolarState,
  LoadedProject,
  ProjectRecord,
  ProjectStatus,
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
  if (data) requireUpdatedAt(data.updated_at);
  return data as ProjectRecord | null;
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return value === "em_andamento" || value === "pausada" || value === "concluida";
}

function requireUpdatedAt(value: unknown): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("A obra não possui uma data de atualização válida.");
  }
  return value;
}

function isEcolarState(value: unknown): value is EcolarState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const project = value as Record<string, unknown>;
  const profile = project.profile;
  const diagnosis = project.diagnosis;
  if (
    !profile ||
    typeof profile !== "object" ||
    !diagnosis ||
    typeof diagnosis !== "object"
  ) {
    return false;
  }
  const profileData = profile as Record<string, unknown>;

  return (
    typeof project.id === "string" &&
    isProjectStatus(project.status) &&
    typeof profileData.nomeObra === "string" &&
    typeof profileData.orcamentoTotal === "number" &&
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

function toProjectState(record: ProjectRecord): EcolarState {
  if (typeof record.name !== "string" || !isProjectStatus(record.status)) {
    throw new Error("Uma obra salva possui dados incompatíveis com o EcoLar.");
  }
  if (!isEcolarState(record.data)) {
    throw new Error(
      "Uma obra salva está incompleta ou em um formato incompatível. Seus dados não foram substituídos."
    );
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

function isSameProject(record: ProjectRecord, project: EcolarState): boolean {
  return (
    record.name === project.profile.nomeObra &&
    record.status === project.status &&
    canonicalJson(toProjectState(record)) === canonicalJson(project)
  );
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
  return (data as ProjectRecord[]).map((record) => {
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
  project: EcolarState,
  signal: AbortSignal
): Promise<string> {
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
  project: EcolarState,
  expectedUpdatedAt: string,
  signal: AbortSignal
): Promise<string> {
  const expectedTime = Date.parse(expectedUpdatedAt);
  const nextUpdatedAt = new Date(
    Math.max(Date.now(), expectedTime + 1)
  ).toISOString();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: project.profile.nomeObra,
      status: project.status,
      data: project,
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
  if (current && isSameProject(current, project)) return current.updated_at;
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
