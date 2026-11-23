import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";
import {
  MainGoal,
  ProjectPlanning,
  ProjectPlanningAnswers,
  ProjectPlanningLocation,
  ProjectPlanningStep,
  ProjectSetupState,
} from "../types/ecolar";
import { GOAL_LABELS } from "../utils/formatters";

interface ProjectPlanningScreenProps {
  project: ProjectSetupState;
  onSavePlanning: (
    projectId: string,
    planning: ProjectPlanning
  ) => Promise<void>;
  onExit: () => void;
}

interface PendingSave {
  planning: ProjectPlanning;
  nextStepIndex: number | null;
  step: ProjectPlanningStep;
  clearDraft: boolean;
}

const PLANNING_STEPS = [
  "objetivo",
  "ambientes",
  "localizacao",
  "orcamento",
  "prazo",
  "contexto",
] as const satisfies readonly ProjectPlanningStep[];

const GOALS: MainGoal[] = [
  "economizar",
  "reduzir_impacto",
  "conforto_termico",
  "acelerar_obra",
  "evitar_desperdicio",
];

const STEP_CONTENT: Record<
  ProjectPlanningStep,
  { title: string; description: string }
> = {
  objetivo: {
    title: "Qual é o principal objetivo da obra?",
    description: "Escolha o que mais importa para você neste momento.",
  },
  ambientes: {
    title: "Quais ambientes serão envolvidos?",
    description: "Informe um ou mais ambientes. Você pode deixar esta resposta para depois.",
  },
  localizacao: {
    title: "Onde fica a obra?",
    description: "Preencha apenas os dados de localização que já souber.",
  },
  orcamento: {
    title: "Qual é o orçamento disponível?",
    description: "Informe um valor aproximado, se já tiver essa informação.",
  },
  prazo: {
    title: "Qual é o prazo desejado?",
    description: "Você pode escrever uma data ou descrever o prazo com suas próprias palavras.",
  },
  contexto: {
    title: "Há algo mais que queira contar sobre a obra?",
    description: "Compartilhe observações ou contexto que possam ajudar no planejamento.",
  },
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

function getAnswerStatus(
  planning: ProjectPlanning,
  step: ProjectPlanningStep
): "respondido" | "nao_sei" | "adiado" | null {
  switch (step) {
    case "objetivo":
      return planning.respostas.objetivo?.status ?? null;
    case "ambientes":
      return planning.respostas.ambientes?.status ?? null;
    case "localizacao":
      return planning.respostas.localizacao?.status ?? null;
    case "orcamento":
      return planning.respostas.orcamentoDisponivel?.status ?? null;
    case "prazo":
      return planning.respostas.prazoDesejado?.status ?? null;
    case "contexto":
      return planning.respostas.observacoes?.status ?? null;
  }
}

function getAnswerStatusLabel(
  status: ReturnType<typeof getAnswerStatus>
): string | null {
  if (status === "nao_sei") return "Ainda não sei";
  if (status === "adiado") return "Deixado para depois";
  return null;
}

export function ProjectPlanningScreen({
  project,
  onSavePlanning,
  onExit,
}: ProjectPlanningScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [savedPlanning, setSavedPlanning] = useState(project.planning);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(
    project.planning.status === "finalizado"
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  const savingRef = useRef(false);

  const initialAnswers = project.planning.respostas;
  const initialLocation =
    initialAnswers.localizacao?.status === "respondido"
      ? initialAnswers.localizacao.value
      : undefined;

  const [objectiveDraft, setObjectiveDraft] = useState<MainGoal | "">(
    initialAnswers.objetivo?.status === "respondido"
      ? initialAnswers.objetivo.value
      : ""
  );
  const [environmentsDraft, setEnvironmentsDraft] = useState(
    initialAnswers.ambientes?.status === "respondido"
      ? initialAnswers.ambientes.value.join("\n")
      : ""
  );
  const [locationDraft, setLocationDraft] = useState({
    endereco: initialLocation?.endereco ?? "",
    cidade: initialLocation?.cidade ?? "",
    uf: initialLocation?.uf ?? "",
  });
  const [budgetDraft, setBudgetDraft] = useState(
    initialAnswers.orcamentoDisponivel?.status === "respondido"
      ? String(initialAnswers.orcamentoDisponivel.value)
      : ""
  );
  const [deadlineDraft, setDeadlineDraft] = useState(
    initialAnswers.prazoDesejado?.status === "respondido"
      ? initialAnswers.prazoDesejado.value
      : ""
  );
  const [contextDraft, setContextDraft] = useState(
    initialAnswers.observacoes?.status === "respondido"
      ? initialAnswers.observacoes.value
      : ""
  );

  const currentStep = PLANNING_STEPS[stepIndex];
  const currentContent = STEP_CONTENT[currentStep];
  const isLastStep = stepIndex === PLANNING_STEPS.length - 1;
  const progress = isComplete
    ? 100
    : ((stepIndex + 1) / PLANNING_STEPS.length) * 100;
  const currentAnswerStatus = getAnswerStatus(savedPlanning, currentStep);
  const currentStatusLabel = getAnswerStatusLabel(currentAnswerStatus);

  const clearDraft = (step: ProjectPlanningStep) => {
    switch (step) {
      case "objetivo":
        setObjectiveDraft("");
        break;
      case "ambientes":
        setEnvironmentsDraft("");
        break;
      case "localizacao":
        setLocationDraft({ endereco: "", cidade: "", uf: "" });
        break;
      case "orcamento":
        setBudgetDraft("");
        break;
      case "prazo":
        setDeadlineDraft("");
        break;
      case "contexto":
        setContextDraft("");
        break;
    }
  };

  const savePending = async (pending: PendingSave) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    setValidationError(null);

    try {
      await onSavePlanning(project.id, pending.planning);
      setSavedPlanning(pending.planning);
      setPendingSave(null);
      if (pending.clearDraft) clearDraft(pending.step);

      if (pending.nextStepIndex === null) {
        setIsComplete(true);
      } else {
        setStepIndex(pending.nextStepIndex);
      }
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Não foi possível salvar sua resposta. Tente novamente."
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const submitAnswer = async (
    answerPatch: ProjectPlanningAnswers,
    clearCurrentDraft = false
  ) => {
    if (savingRef.current || pendingSave) return;

    const isFinalAnswer = isLastStep;
    const nextStepIndex = isFinalAnswer ? null : stepIndex + 1;
    const nextPlanning: ProjectPlanning = {
      ...savedPlanning,
      status: isFinalAnswer ? "finalizado" : "em_andamento",
      etapaAtual: nextStepIndex === null ? null : PLANNING_STEPS[nextStepIndex],
      respostas: {
        ...savedPlanning.respostas,
        ...answerPatch,
      },
    };
    const pending: PendingSave = {
      planning: nextPlanning,
      nextStepIndex,
      step: currentStep,
      clearDraft: clearCurrentDraft,
    };

    setPendingSave(pending);
    await savePending(pending);
  };

  const getCurrentResponse = (): ProjectPlanningAnswers | null => {
    switch (currentStep) {
      case "objetivo":
        if (!objectiveDraft) {
          setValidationError("Escolha um objetivo ou use uma das opções para continuar.");
          return null;
        }
        return {
          objetivo: { status: "respondido", value: objectiveDraft },
        };
      case "ambientes": {
        const environments = environmentsDraft
          .split(/[\n,;]+/)
          .map((environment) => environment.trim())
          .filter(Boolean);
        if (environments.length === 0) {
          setValidationError("Informe pelo menos um ambiente ou escolha uma das opções para continuar.");
          return null;
        }
        return {
          ambientes: { status: "respondido", value: environments },
        };
      }
      case "localizacao": {
        const location: ProjectPlanningLocation = {
          endereco: locationDraft.endereco.trim() || null,
          cidade: locationDraft.cidade.trim() || null,
          uf: locationDraft.uf.trim().toUpperCase() || null,
        };
        if (!location.endereco && !location.cidade && !location.uf) {
          setValidationError("Preencha pelo menos um campo ou escolha uma das opções para continuar.");
          return null;
        }
        return {
          localizacao: { status: "respondido", value: location },
        };
      }
      case "orcamento": {
        const amount = Number(budgetDraft);
        if (
          !budgetDraft.trim() ||
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          setValidationError("Informe um valor válido igual ou maior que zero.");
          return null;
        }
        return {
          orcamentoDisponivel: { status: "respondido", value: amount },
        };
      }
      case "prazo":
        if (!deadlineDraft.trim()) {
          setValidationError("Informe um prazo ou escolha uma das opções para continuar.");
          return null;
        }
        return {
          prazoDesejado: {
            status: "respondido",
            value: deadlineDraft.trim(),
          },
        };
      case "contexto":
        if (!contextDraft.trim()) {
          setValidationError("Informe um contexto ou escolha uma das opções para continuar.");
          return null;
        }
        return {
          observacoes: {
            status: "respondido",
            value: contextDraft.trim(),
          },
        };
    }
  };

  const handleConfirm = async (event: FormEvent) => {
    event.preventDefault();
    if (pendingSave) {
      await savePending(pendingSave);
      return;
    }

    setValidationError(null);
    const response = getCurrentResponse();
    if (response) await submitAnswer(response);
  };

  const handleSkip = async (status: "nao_sei" | "adiado") => {
    if (pendingSave || isSaving) return;

    let answerPatch: ProjectPlanningAnswers;
    switch (currentStep) {
      case "objetivo":
        answerPatch = { objetivo: { status } };
        break;
      case "ambientes":
        answerPatch = { ambientes: { status } };
        break;
      case "localizacao":
        answerPatch = { localizacao: { status } };
        break;
      case "orcamento":
        answerPatch = { orcamentoDisponivel: { status } };
        break;
      case "prazo":
        answerPatch = { prazoDesejado: { status } };
        break;
      case "contexto":
        answerPatch = { observacoes: { status } };
        break;
    }

    await submitAnswer(answerPatch, true);
  };

  const handleBack = () => {
    if (isSaving || pendingSave || stepIndex === 0) return;
    setValidationError(null);
    setSaveError(null);
    setStepIndex((current) => current - 1);
  };

  if (isComplete) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700 dark:text-emerald-400" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Planejamento concluído
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          O questionário de {project.profile.nomeObra} foi finalizado. As respostas
          adiadas ou ainda desconhecidas não impedem a conclusão do planejamento.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Voltar para minhas obras
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Planejamento da obra
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {project.profile.nomeObra}
            </h1>
          </div>
          <button
            type="button"
            onClick={onExit}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
            Sair
          </button>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Pergunta {stepIndex + 1} de {PLANNING_STEPS.length}
            </span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-label="Progresso do planejamento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <form
        onSubmit={(event) => void handleConfirm(event)}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {currentContent.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {currentContent.description}
          </p>
        </div>

        {currentStatusLabel && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            Resposta atual: {currentStatusLabel}
          </p>
        )}

        <div className="space-y-4">
          {currentStep === "objetivo" && (
            <fieldset disabled={Boolean(pendingSave) || isSaving}>
              <legend className="sr-only">Objetivo da obra</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => (
                  <label
                    key={goal}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      objectiveDraft === goal
                        ? "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
                        : "border-slate-200 hover:border-emerald-400 dark:border-slate-700 dark:hover:border-emerald-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="planning-goal"
                      value={goal}
                      checked={objectiveDraft === goal}
                      onChange={() => {
                        setObjectiveDraft(goal);
                        setValidationError(null);
                      }}
                      className="mt-0.5 accent-emerald-700"
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {GOAL_LABELS[goal]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {currentStep === "ambientes" && (
            <div>
              <label
                htmlFor="planning-environments"
                className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Ambientes
              </label>
              <textarea
                id="planning-environments"
                rows={4}
                disabled={Boolean(pendingSave) || isSaving}
                value={environmentsDraft}
                onChange={(event) => {
                  setEnvironmentsDraft(event.target.value);
                  setValidationError(null);
                }}
                placeholder={"Escreva um ambiente por linha\nEx.: cozinha, banheiro"}
                className={INPUT_CLASS}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Separe os ambientes por linha, vírgula ou ponto e vírgula.
              </p>
            </div>
          )}

          {currentStep === "localizacao" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="planning-address"
                  className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  Endereço <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="planning-address"
                  type="text"
                  disabled={Boolean(pendingSave) || isSaving}
                  value={locationDraft.endereco}
                  onChange={(event) => {
                    setLocationDraft((current) => ({
                      ...current,
                      endereco: event.target.value,
                    }));
                    setValidationError(null);
                  }}
                  className={INPUT_CLASS}
                  placeholder="Rua, avenida ou bairro"
                />
              </div>
              <div>
                <label
                  htmlFor="planning-city"
                  className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  Cidade <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="planning-city"
                  type="text"
                  disabled={Boolean(pendingSave) || isSaving}
                  value={locationDraft.cidade}
                  onChange={(event) => {
                    setLocationDraft((current) => ({
                      ...current,
                      cidade: event.target.value,
                    }));
                    setValidationError(null);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="planning-state"
                  className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  UF <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="planning-state"
                  type="text"
                  maxLength={2}
                  disabled={Boolean(pendingSave) || isSaving}
                  value={locationDraft.uf}
                  onChange={(event) => {
                    setLocationDraft((current) => ({
                      ...current,
                      uf: event.target.value,
                    }));
                    setValidationError(null);
                  }}
                  className={INPUT_CLASS}
                  placeholder="Ex.: SP"
                />
              </div>
            </div>
          )}

          {currentStep === "orcamento" && (
            <div>
              <label
                htmlFor="planning-budget"
                className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Orçamento disponível (R$)
              </label>
              <input
                id="planning-budget"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                disabled={Boolean(pendingSave) || isSaving}
                value={budgetDraft}
                onChange={(event) => {
                  setBudgetDraft(event.target.value);
                  setValidationError(null);
                }}
                className={INPUT_CLASS}
                placeholder="Informe um valor"
              />
            </div>
          )}

          {currentStep === "prazo" && (
            <div>
              <label
                htmlFor="planning-deadline"
                className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Prazo desejado
              </label>
              <input
                id="planning-deadline"
                type="text"
                disabled={Boolean(pendingSave) || isSaving}
                value={deadlineDraft}
                onChange={(event) => {
                  setDeadlineDraft(event.target.value);
                  setValidationError(null);
                }}
                className={INPUT_CLASS}
                placeholder="Ex.: até o fim do ano que vem"
              />
            </div>
          )}

          {currentStep === "contexto" && (
            <div>
              <label
                htmlFor="planning-context"
                className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Observações ou contexto
              </label>
              <textarea
                id="planning-context"
                rows={5}
                disabled={Boolean(pendingSave) || isSaving}
                value={contextDraft}
                onChange={(event) => {
                  setContextDraft(event.target.value);
                  setValidationError(null);
                }}
                className={INPUT_CLASS}
                placeholder="Conte o que considera importante sobre a obra."
              />
            </div>
          )}
        </div>

        {(validationError || saveError) && (
          <p
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {validationError ?? saveError}
          </p>
        )}

        {isSaving && (
          <p
            className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin text-emerald-700 dark:text-emerald-400" />
            Salvando sua resposta...
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 || isSaving || Boolean(pendingSave)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Pergunta anterior
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleSkip("nao_sei")}
              disabled={isSaving || Boolean(pendingSave)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Ainda não sei
            </button>
            <button
              type="button"
              onClick={() => void handleSkip("adiado")}
              disabled={isSaving || Boolean(pendingSave)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Deixar para depois
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving
                ? "Salvando..."
                : pendingSave
                  ? "Tentar novamente"
                  : isLastStep
                    ? "Finalizar planejamento"
                    : "Salvar e continuar"}
              {!isSaving && !pendingSave && !isLastStep && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
