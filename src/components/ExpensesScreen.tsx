import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { ExpenseItem, StageBudget } from "../types/ecolar";
import { formatBRL, STAGE_OPTIONS } from "../utils/formatters";

interface ExpensesScreenProps {
  expenses: ExpenseItem[];
  stageBudgets: StageBudget[];
  totalBudget: number | null;
  isProjectSetup: boolean;
  onAddExpense: (expense: ExpenseItem) => void;
}

const EXPENSE_CATEGORIES = [
  "Estrutura",
  "Alvenaria",
  "Impermeabilizacao",
  "Cobertura",
  "Hidraulica e Eletrica",
  "Acabamento",
] as const satisfies readonly ExpenseItem["categoria"][];

function isExpenseCategory(value: string): value is ExpenseItem["categoria"] {
  return EXPENSE_CATEGORIES.some((category) => category === value);
}

export function ExpensesScreen({
  expenses,
  stageBudgets,
  totalBudget,
  isProjectSetup,
  onAddExpense,
}: ExpensesScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [material, setMaterial] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState(isProjectSetup ? "" : "unidades");
  const [categoria, setCategoria] = useState<ExpenseItem["categoria"] | "">(
    isProjectSetup ? "" : "Alvenaria"
  );
  const [etapa, setEtapa] = useState(
    isProjectSetup ? "" : "Alvenaria e Estrutura"
  );
  const [riscoDesperdicioAlto, setRiscoDesperdicioAlto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + e.valorPago, 0),
    [expenses]
  );
  const remaining =
    totalBudget === null ? null : totalBudget - totalSpent;

  const mostExpensiveStage = useMemo(() => {
    return [...stageBudgets].sort((a, b) => b.realizado - a.realizado)[0];
  }, [stageBudgets]);

  const highWasteExpenses = expenses.filter((e) => e.riscoDesperdicioAlto);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const paidAmount = Number(valorPago);
    const quantity = Number(quantidade);
    if (
      !material.trim() ||
      !valorPago ||
      !Number.isFinite(paidAmount) ||
      paidAmount <= 0 ||
      (isProjectSetup &&
        (!Number.isFinite(quantity) ||
          quantity <= 0 ||
          !unidade.trim() ||
        !isExpenseCategory(categoria)))
    ) {
      setFormError(
        "Informe os dados reais da compra: material, valor, quantidade, unidade e categoria."
      );
      return;
    }
    if (!isExpenseCategory(categoria)) {
      setFormError("Selecione uma categoria válida para a compra.");
      return;
    }
    setFormError(null);

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      data: new Date().toISOString().slice(0, 10),
      material: material.trim(),
      fornecedor: isProjectSetup
        ? fornecedor.trim()
        : fornecedor.trim() || "Fornecedor local",
      valorPago: paidAmount,
      quantidade: isProjectSetup ? quantity : Number(quantidade) || 1,
      unidade: isProjectSetup ? unidade.trim() : unidade.trim() || "un",
      categoria,
      etapa,
      ...(isProjectSetup
        ? riscoDesperdicioAlto
          ? { riscoDesperdicioAlto: true }
          : {}
        : { riscoDesperdicioAlto }),
    };
    onAddExpense(newItem);
    setMaterial("");
    setFornecedor("");
    setValorPago("");
    setQuantidade("");
    if (isProjectSetup) {
      setUnidade("");
      setCategoria("");
      setEtapa("");
      setRiscoDesperdicioAlto(false);
    }
    setShowForm(false);
  };

  const inputClass =
    "w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Gastos e Materiais
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Controle compras, compare gasto previsto vs real e identifique materiais com alto desperdício.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar compra de material
        </button>
      </div>

      {/* 5 Cards obrigatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isProjectSetup ? "Gastos registrados" : "Total gasto"}
          </p>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatBRL(totalSpent)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            {totalBudget === null
              ? "Orçamento ainda não informado"
              : `De ${formatBRL(totalBudget)} previstos`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Saldo restante</p>
          <p
            className={`mt-1 text-xl font-bold font-mono tabular-nums ${
              remaining !== null && remaining < 0
                ? "text-red-700 dark:text-red-400"
                : remaining === null
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {remaining === null ? "Não disponível" : formatBRL(remaining)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {remaining === null
              ? "Informe o orçamento para calcular o saldo"
              : remaining < 0
                ? "Orçamento estourado"
                : "Dentro do limite planejado"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Etapa mais cara</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {mostExpensiveStage?.etapa ??
              (isProjectSetup ? "Ainda não informada" : "—")}
          </p>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
            {mostExpensiveStage
              ? `${formatBRL(mostExpensiveStage.realizado)} gastos`
              : isProjectSetup
                ? "Sem orçamento por etapa registrado"
                : `${formatBRL(0)} gastos`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isProjectSetup
              ? "Indicador de economia"
              : "Maior oportunidade de economia"}
          </p>
          {isProjectSetup ? (
            <>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ainda indisponível
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Não há dados suficientes para estimar economias.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Compra planejada + reúso de portas
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                Até {formatBRL(4750)} potenciais
              </p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isProjectSetup
              ? "Compra mais recente"
              : "Materiais com maior consumo"}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isProjectSetup
              ? expenses[0]?.material ?? "Ainda não informada"
              : "Cimento CP-II, Areia e Aço CA-50"}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            {isProjectSetup
              ? `${expenses.length} compras registradas`
              : `${highWasteExpenses.length} itens com alerta de perda`}
          </p>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Nova compra de material
          </h2>
          {isProjectSetup && (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Registre somente os dados conhecidos. O fornecedor é opcional; a
              quantidade, a unidade e a categoria precisam ser informadas. A etapa
              é opcional.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Material comprado
              </label>
              <input
                type="text"
                required
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Ex: Cimento CP-II 50kg"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Depósito Bela Vista"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valor pago (R$)
              </label>
              <input
                type="number"
                required
                min={1}
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="Ex: 480"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantidade e unidade
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  required={isProjectSetup}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="12"
                  className="w-24 px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <input
                  type="text"
                  required={isProjectSetup}
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  placeholder="sacos, m³, un"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Categoria do material
              </label>
              <select
                value={categoria}
                required={isProjectSetup}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoria(isExpenseCategory(value) ? value : "");
                }}
                className={inputClass}
              >
                {isProjectSetup && (
                  <option value="">Selecione uma categoria</option>
                )}
                {EXPENSE_CATEGORIES.map((itemCategory) => (
                  <option key={itemCategory} value={itemCategory}>
                    {itemCategory === "Impermeabilizacao"
                      ? "Impermeabilização"
                      : itemCategory === "Hidraulica e Eletrica"
                        ? "Hidráulica e Elétrica"
                        : itemCategory}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Etapa da obra relacionada
              </label>
              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value)}
                className={inputClass}
              >
                {isProjectSetup && (
                  <option value="">Ainda não informada</option>
                )}
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={riscoDesperdicioAlto}
              onChange={(e) => setRiscoDesperdicioAlto(e.target.checked)}
              className="w-4 h-4 accent-amber-700 rounded"
            />
            {isProjectSetup
              ? "Sinalizar como material sensível a chuva/desperdício"
              : "Marcar como material sensível a chuva/desperdício (cimento, areia, argamassa)"}
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer"
            >
              Salvar compra
            </button>
          </div>
        </form>
      )}

      {/* Comparação previsto vs realizado por etapa */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Gasto previsto vs gasto real por etapa
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4">Etapa da obra</th>
                <th className="py-2.5 px-4 text-right">Previsto</th>
                <th className="py-2.5 px-4 text-right">Realizado</th>
                <th className="py-2.5 pl-4 text-right">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {isProjectSetup && stageBudgets.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Nenhum orçamento por etapa foi informado.
                  </td>
                </tr>
              ) : stageBudgets.map((sb) => {
                const diff = sb.previsto - sb.realizado;
                const over = diff < 0;
                return (
                  <tr key={sb.etapa} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {sb.etapa}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatBRL(sb.previsto)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatBRL(sb.realizado)}
                    </td>
                    <td
                      className={`py-2.5 pl-4 text-right text-xs font-medium ${
                        over
                          ? "text-red-700 dark:text-red-400"
                          : "text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {over
                        ? `Acima ${formatBRL(Math.abs(diff))}`
                        : `Saldo ${formatBRL(diff)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lista de compras */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Histórico de compras de materiais ({expenses.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Itens sensíveis a desperdício aparecem sinalizados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4 text-right">Qtd.</th>
                <th className="py-3 px-4 text-right">Valor pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Nenhuma compra registrada nesta obra ainda.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {exp.data}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {exp.material}
                      </div>
                      {exp.riscoDesperdicioAlto && (
                        <div className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Alto risco de perda se mal armazenado
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {exp.fornecedor || "Fornecedor não informado"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {exp.etapa || "Etapa não informada"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                      {exp.quantidade} {exp.unidade}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatBRL(exp.valorPago)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
