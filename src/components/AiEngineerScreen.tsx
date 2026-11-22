import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { ChatMessage, EcolarState } from "../types/ecolar";

interface AiEngineerScreenProps {
  state: EcolarState;
  messages: ChatMessage[];
  pendingQuestion: string | null;
  onClearPendingQuestion: () => void;
  onAddMessage: (msg: ChatMessage) => void;
}

const SHORTCUTS = [
  {
    label: "Analisar orçamento",
    prompt:
      "Analise meu orçamento atual considerando o que já gastei e a etapa atual da obra. Esse orçamento está adequado ou preciso ajustar alguma compra?",
  },
  {
    label: "Reduzir custo",
    prompt:
      "Quais são as 3 formas mais rápidas e seguras de reduzir o custo da minha obra agora sem perder qualidade?",
  },
  {
    label: "Reduzir desperdício",
    prompt:
      "Estou com risco de desperdício em cimento e areia. Como evitar perdas no canteiro gasto zero ou baixo?",
  },
  {
    label: "Melhorar conforto térmico",
    prompt:
      "Como deixar minha casa mais fresca gastando pouco, considerando o clima da minha região?",
  },
  {
    label: "Escolher material",
    prompt: "Posso substituir bloco cerâmico por bloco de concreto na minha obra?",
  },
  {
    label: "Revisar etapa atual",
    prompt:
      "Revise a minha etapa atual da obra e me diga os cuidados técnicos essenciais antes de avançar.",
  },
];

const EXAMPLE_QUESTIONS = [
  "Vale a pena fazer telhado branco?",
  "Quanto economizo colocando cisterna?",
  "Essa parede precisa de impermeabilização?",
  "Qual alternativa mais barata para o piso?",
  "Estou comprando material demais?",
];

export function AiEngineerScreen({
  state,
  messages,
  pendingQuestion,
  onClearPendingQuestion,
  onAddMessage,
}: AiEngineerScreenProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    onAddMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const totalSpent = state.expenses.reduce((s, e) => s + e.valorPago, 0);
      const projectContext = {
        nomeObra: state.profile.nomeObra,
        cidade: `${state.profile.cidade}/${state.profile.uf}`,
        tipoObra: state.profile.tipoObra,
        clima: state.profile.climaRegiao,
        metragemM2: state.profile.metragem,
        orcamentoTotal: state.profile.orcamentoTotal,
        totalGastoAteAgora: totalSpent,
        etapaAtual: state.profile.etapaAtual,
        progressoGeralPct: state.profile.progressoGeral,
        objetivoPrincipal: state.profile.objetivoPrincipal,
        materiaisDefinidos: state.profile.materiaisDefinidos,
        diagnostico: {
          notaSustentabilidade: state.diagnosis.notaSustentabilidade,
          notaEconomia: state.diagnosis.notaEconomia,
          resumo: state.diagnosis.resumoDiagnostico,
        },
        ultimosRegistrosDiario: state.diary.slice(0, 3).map((d) => ({
          data: d.data,
          etapa: d.etapaConcluida,
          gasto: d.valorGasto,
          problemas: d.problemasEncontrados,
        })),
        alertasAbertos: state.alerts
          .filter((a) => !a.resolvido)
          .map((a) => a.titulo),
      };

      const res = await fetch("/api/ai/engineer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            text: m.structured ? m.structured.resumo : m.text,
          })),
          projectContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Não foi possível obter resposta da IA Engenheiro."
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: data.structured?.resumo ?? "Resposta recebida.",
        structured: data.structured,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      onAddMessage(aiMsg);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text:
          err instanceof Error
            ? err.message
            : "Erro de conexão com a IA Engenheiro. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      onAddMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingQuestion) {
      const q = pendingQuestion;
      onClearPendingQuestion();
      sendQuestion(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            IA Engenheiro
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Orientação simples, prática e segura considerando orçamento, clima, etapa e diário da obra{" "}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {state.profile.nomeObra}
            </strong>
            .
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Etapa: {state.profile.etapaAtual} · {state.profile.cidade}/{state.profile.uf}
        </span>
      </div>

      {/* Atalhos rápidos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Atalhos rápidos
        </p>
        <div className="flex flex-wrap gap-2">
          {SHORTCUTS.map((sc) => (
            <button
              key={sc.label}
              type="button"
              disabled={loading}
              onClick={() =>
                sendQuestion(
                  sc.label === "Analisar orçamento"
                    ? `Analise meu orçamento atual de R$ ${state.profile.orcamentoTotal} considerando o que já gastei e a etapa de ${state.profile.etapaAtual}. Esse orçamento está adequado ou preciso ajustar alguma compra?`
                    : sc.prompt
                )
              }
              className="px-3.5 py-2 text-xs font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {sc.label}
            </button>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Exemplos:</span>
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => sendQuestion(q)}
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 underline underline-offset-2 cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col min-h-[440px] max-h-[62vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 px-1">
                {msg.role === "user" ? "Você" : "IA Engenheiro Ecolar"} ·{" "}
                <span className="font-mono tabular-nums">{msg.timestamp}</span>
              </div>

              {msg.role === "user" ? (
                <div className="max-w-xl bg-emerald-700 dark:bg-emerald-600 text-white rounded-xl px-4 py-3 text-sm leading-relaxed">
                  {msg.text}
                </div>
              ) : msg.isError ? (
                <div className="max-w-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200 rounded-xl px-4 py-3 text-sm">
                  {msg.text}
                </div>
              ) : msg.structured ? (
                <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {msg.structured.resumo}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                        Recomendação prática
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.recomendacao}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Motivo
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.motivo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                        Impacto no custo
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.impactoCusto}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                        Impacto ambiental
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.impactoAmbiental}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Cuidados técnicos
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.cuidadosTecnicos}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Quando chamar um profissional
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.structured.quandoChamarProfissional}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 text-sm leading-relaxed">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700 dark:text-emerald-400" />
              Analisando dados da sua obra e preparando orientação...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Campo de envio */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre materiais, orçamento, umidade, telhado ou economia..."
            className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
