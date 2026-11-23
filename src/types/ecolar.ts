export type ScreenId =
  | "dashboard"
  | "obras"
  | "diagnostico"
  | "melhorias"
  | "assistente"
  | "diario"
  | "ia"
  | "impacto"
  | "gastos"
  | "alertas"
  | "perfil"
  | "configuracoes";

export type ThemePreference = "claro" | "escuro" | "automatico";

export type ProjectStatus = "em_andamento" | "pausada" | "concluida";

export type WorkType = "construcao" | "reforma" | "ampliacao" | "regularizacao";

export type MainGoal =
  | "economizar"
  | "reduzir_impacto"
  | "conforto_termico"
  | "acelerar_obra"
  | "evitar_desperdicio";

export type SocialPriority =
  | "menor_custo"
  | "durabilidade"
  | "conforto"
  | "acessibilidade"
  | "sustentabilidade";

export type ProjectPlanningStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "finalizado";

export type ProjectPlanningStep =
  | "objetivo"
  | "localizacao"
  | "ambientes"
  | "orcamento"
  | "prazo"
  | "contexto";

export type ProjectPlanningAnswer<T> =
  | { status: "respondido"; value: T }
  | { status: "nao_sei" }
  | { status: "adiado" };

export interface ProjectPlanningLocation {
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface ProjectPlanningAnswers {
  objetivo?: ProjectPlanningAnswer<MainGoal>;
  localizacao?: ProjectPlanningAnswer<ProjectPlanningLocation>;
  ambientes?: ProjectPlanningAnswer<string[]>;
  orcamentoDisponivel?: ProjectPlanningAnswer<number>;
  prazoDesejado?: ProjectPlanningAnswer<string>;
  observacoes?: ProjectPlanningAnswer<string>;
}

export interface ProjectPlanning {
  status: ProjectPlanningStatus;
  etapaAtual: ProjectPlanningStep | null;
  respostas: ProjectPlanningAnswers;
}

export interface ProjectProfile {
  nomeObra: string;
  endereco: string;
  cidade: string;
  uf: string;
  tipoObra: WorkType;
  climaRegiao: string;
  metragem: number;
  tipoTerreno: string;
  orcamentoTotal: number;
  rendaFamilia: string;
  objetivoPrincipal: MainGoal;
  materiaisDefinidos: string;
  etapaAtual: string;
  progressoGeral: number;
  possuiProjetoArquitetonico: "sim_completo" | "basico" | "nao";
  acessoInfraestrutura: {
    agua: boolean;
    energia: boolean;
    saneamento: boolean;
  };
  prioridadeSocial: SocialPriority;
  dataInicio: string;
  previsaoConclusao: string;
  pessoasBeneficiadas: number;
}

export type ProjectSetupProfile = Pick<ProjectProfile, "nomeObra"> &
  Partial<Omit<ProjectProfile, "nomeObra" | "acessoInfraestrutura">> & {
    acessoInfraestrutura?: Partial<ProjectProfile["acessoInfraestrutura"]>;
  };

export interface DiagnosisRisk {
  titulo: string;
  nivel: "alto" | "medio" | "baixo";
  explicacao: string;
}

export interface DiagnosisResult {
  notaSustentabilidade: number;
  notaEconomia: number;
  notaEficienciaEnergetica: number;
  custoEstimadoMin: number;
  custoEstimadoMax: number;
  desperdicioEstimadoPercentual: number;
  economiaPotencialEstimada: number;
  resumoDiagnostico: string;
  oportunidadesCusto: number;
  solucoesConforto: number;
  principaisRiscos: DiagnosisRisk[];
  atualizadoEm: string;
}

export type DifficultyLevel = "Facil" | "Media" | "Tecnica";
export type PriorityLevel = "Alta" | "Media" | "Baixa";
export type ImpactLevel = "Alto" | "Medio";

export interface ImprovementItem {
  id: string;
  nome: string;
  custoEstimado: number;
  economiaEstimada: number;
  impactoAmbiental: ImpactLevel;
  impactoResumo: string;
  co2EvitadoKg: number;
  aguaEconomizadaLitros: number;
  residuosEvitadosKg: number;
  dificuldade: DifficultyLevel;
  prioridade: PriorityLevel;
  prazoIdeal: string;
  explicacaoSimples: string;
  categoria: "Agua" | "Conforto Termico" | "Materiais" | "Gestao";
  adicionadaAoPlano: boolean;
}

export type AssistantItemType =
  | "clima"
  | "compra"
  | "desperdicio"
  | "tarefa"
  | "economia"
  | "sustentabilidade"
  | "lembrete"
  | "decisao";

export interface AssistantTask {
  id: string;
  tipo: AssistantItemType;
  titulo: string;
  mensagem: string;
  etapaRelacionada: string;
  status: "pendente" | "feito" | "adiado";
  prioridade: PriorityLevel;
}

export interface DiaryEntry {
  id: string;
  data: string;
  etapaConcluida: string;
  materiaisComprados: string;
  quantidadeMateriais: string;
  valorGasto: number;
  maoDeObra: string;
  problemasEncontrados: string;
  desperdicioPercebido:
    | "Nao informado"
    | "Nenhum relevante"
    | "Baixo"
    | "Medio"
    | "Alto";
  climaDoDia:
    | "Nao informado"
    | "Ensolarado"
    | "Nublado"
    | "Chuvoso"
    | "Vento forte";
  observacoes: string;
  fotoUrl?: string;
  resumoAutomatico: string;
}

export interface ExpenseItem {
  id: string;
  data: string;
  material: string;
  fornecedor: string;
  valorPago: number;
  quantidade: number;
  unidade: string;
  categoria: "Estrutura" | "Alvenaria" | "Impermeabilizacao" | "Cobertura" | "Hidraulica e Eletrica" | "Acabamento";
  etapa: string;
  riscoDesperdicioAlto?: boolean;
}

export interface StageBudget {
  etapa: string;
  previsto: number;
  realizado: number;
}

export type AlertType =
  | "risco_desperdicio"
  | "clima"
  | "compra"
  | "orcamento"
  | "etapa_atrasada"
  | "oportunidade_economia"
  | "decisao_sustentavel"
  | "problema_tecnico";

export interface AlertItem {
  id: string;
  tipo: AlertType;
  titulo: string;
  gravidade: "alta" | "media" | "baixa";
  explicacao: string;
  acaoRecomendada: string;
  resolvido: boolean;
  dataCriacao: string;
}

export interface StructuredEngineerReply {
  resumo: string;
  recomendacao: string;
  motivo: string;
  impactoCusto: string;
  impactoAmbiental: string;
  cuidadosTecnicos: string;
  quandoChamarProfissional: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  structured?: StructuredEngineerReply;
  timestamp: string;
  isError?: boolean;
}

export interface WeeklyGoal {
  id: string;
  titulo: string;
  concluida: boolean;
  impactoTexto: string;
}

export interface EcolarState {
  id: string;
  status: ProjectStatus;
  profile: ProjectProfile;
  planning?: ProjectPlanning;
  diagnosis: DiagnosisResult;
  improvements: ImprovementItem[];
  assistantTasks: AssistantTask[];
  diary: DiaryEntry[];
  expenses: ExpenseItem[];
  stageBudgets: StageBudget[];
  alerts: AlertItem[];
  weeklyGoals: WeeklyGoal[];
  chatMessages: ChatMessage[];
  baseSavings: number;
  baseWaterSavedLiters: number;
  baseEnergyReductionPct: number;
  baseCo2AvoidedKg: number;
  baseWasteDivertedKg: number;
  baseReusedMaterialsKg: number;
}

export interface ProjectSetupState {
  kind: "setup";
  id: string;
  status: ProjectStatus;
  profile: ProjectSetupProfile;
  planning: ProjectPlanning;
  diagnosis: null;
  improvements: ImprovementItem[];
  assistantTasks: AssistantTask[];
  diary: DiaryEntry[];
  expenses: ExpenseItem[];
  stageBudgets: StageBudget[];
  alerts: AlertItem[];
  weeklyGoals: WeeklyGoal[];
  chatMessages: ChatMessage[];
  baseSavings: number | null;
  baseWaterSavedLiters: number | null;
  baseEnergyReductionPct: number | null;
  baseCo2AvoidedKg: number | null;
  baseWasteDivertedKg: number | null;
  baseReusedMaterialsKg: number | null;
}

export type ProjectState = EcolarState | ProjectSetupState;

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  status: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}

export interface LoadedProject {
  project: ProjectState;
  updatedAt: string;
}
