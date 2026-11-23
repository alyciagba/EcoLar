import { FormEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Leaf, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "signup";

const App = lazy(() => import("../App"));

function getAuthErrorMessage(error: { message: string }): string {
  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
    return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  }
  if (message.includes("already registered") || message.includes("user already registered")) {
    return "Este e-mail já possui uma conta. Tente entrar.";
  }
  if (message.includes("password") && (message.includes("length") || message.includes("characters"))) {
    return "A senha não atende ao tamanho mínimo exigido. Use pelo menos 6 caracteres.";
  }
  if (message.includes("invalid email") || message.includes("email address")) {
    return "Informe um endereço de e-mail válido.";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão e tente novamente.";
  }

  return "Não foi possível concluir a autenticação. Tente novamente.";
}

export function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const authEventReceived = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived.current = true;
      if (isMounted) {
        setSession(nextSession);
        setIsInitializing(false);
        setErrorMessage(null);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setErrorMessage("Não foi possível restaurar sua sessão. Tente atualizar a página.");
        } else if (!authEventReceived.current) {
          setSession(data.session);
        }
        setIsInitializing(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("Não foi possível restaurar sua sessão. Verifique sua conexão e tente novamente.");
        setIsInitializing(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) throw error;
        if (!data.session) {
          setInfoMessage(
            "O cadastro foi recebido, mas o Supabase não iniciou uma sessão. Confirme que a verificação de e-mail está desativada nas configurações do projeto."
          );
          return;
        }
        setSession(data.session);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setSession(data.session);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? getAuthErrorMessage(error)
          : "Não foi possível concluir a autenticação. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? getAuthErrorMessage(error)
          : "Não foi possível encerrar sua sessão. Tente novamente.";
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setPassword("");
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:px-6">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-400" />
          <span>Verificando sua sessão...</span>
        </div>
      </main>
    );
  }

  if (session) {
    return (
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-400" />
              <span>Abrindo o EcoLar...</span>
            </div>
          </main>
        }
      >
        <App
          key={session.user.id}
          userId={session.user.id}
          onSignOut={handleSignOut}
        />
      </Suspense>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-12">
      <section className="my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white dark:bg-emerald-600">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight">EcoLar</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Obra sustentável, econômica e inteligente</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {mode === "login"
            ? "Entre para continuar no EcoLar."
            : "Cadastre-se para começar a usar o EcoLar."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {mode === "signup" && (
            <div>
              <label htmlFor="auth-name" className="mb-2 block text-sm font-medium">
                Nome
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={`${inputClass} min-h-11 pl-10`}
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-2 block text-sm font-medium">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClass} min-h-11 pl-10`}
                placeholder="voce@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-2 block text-sm font-medium">
              Senha
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} min-h-11 pl-10`}
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 p-4 text-sm leading-relaxed text-red-800 dark:bg-red-950/40 dark:text-red-200" role="alert">
              {errorMessage}
            </p>
          )}
          {infoMessage && (
            <p className="rounded-lg bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="status">
              {infoMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {mode === "login" ? "Ainda não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            disabled={isSubmitting}
            className="font-semibold text-emerald-800 hover:underline disabled:opacity-60 dark:text-emerald-400"
          >
            {mode === "login" ? "Cadastre-se" : "Fazer login"}
          </button>
        </p>
      </section>
    </main>
  );
}
