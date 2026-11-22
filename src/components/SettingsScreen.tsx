import { Monitor, Moon, Sun, Check } from "lucide-react";
import { ThemePreference } from "../types/ecolar";

interface SettingsScreenProps {
  themePreference: ThemePreference;
  resolvedTheme: "light" | "dark";
  onChangeTheme: (pref: ThemePreference) => void;
}

const THEME_OPTIONS: Array<{
  id: ThemePreference;
  title: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: "claro",
    title: "Claro",
    description:
      "Modo Dia com fundo claro e alto contraste, ideal para uso no canteiro sob luz natural.",
    icon: Sun,
  },
  {
    id: "escuro",
    title: "Escuro",
    description:
      "Modo Noite com tons escuros e verdes profundos, confortável em ambientes com pouca luz.",
    icon: Moon,
  },
  {
    id: "automatico",
    title: "Automático",
    description:
      "Acompanha automaticamente a configuração de aparência clara ou escura do seu dispositivo.",
    icon: Monitor,
  },
];

export function SettingsScreen({
  themePreference,
  resolvedTheme,
  onChangeTheme,
}: SettingsScreenProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Personalize sua experiência no Ecolar. Suas preferências ficam salvas neste dispositivo.
        </p>
      </div>

      {/* Seção Aparência solicitada */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Aparência
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Escolha entre o Modo Dia, o Modo Noite ou siga a aparência do sistema.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tema ativo agora:{" "}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {resolvedTheme === "dark" ? "Modo Noite (Escuro)" : "Modo Dia (Claro)"}
            </strong>
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          role="radiogroup"
          aria-label="Opções de aparência"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = themePreference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChangeTheme(opt.id)}
                className={`text-left rounded-xl border p-5 transition-colors flex flex-col justify-between gap-4 cursor-pointer ${
                  selected
                    ? "border-emerald-700 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        selected
                          ? "bg-emerald-700 text-white dark:bg-emerald-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {selected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        Selecionado
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
