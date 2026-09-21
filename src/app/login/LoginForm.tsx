"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

const DEMO_CREDENTIALS = { email: "demo@kanbanflow.app", password: "demo1234" };

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shakeControls = useAnimation();
  const submittedDemoRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const from = searchParams.get("from");
  const isDemo = searchParams.get("demo") === "1";

  const doSubmit = async (submitEmail: string, submitPassword: string) => {
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: submitEmail,
      password: submitPassword,
      redirect: false,
    });
    setLoading(false);

    if (!result || result.error) {
      setError("Correo o contraseña incorrectos.");
      toast.error("No se pudo iniciar sesión");
      shakeControls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      return;
    }

    setSuccess(true);
    toast.success("¡Bienvenido de vuelta!");
    setTimeout(() => router.push(from && from.startsWith("/boards") ? from : "/boards"), 500);
  };

  useEffect(() => {
    if (isDemo && !submittedDemoRef.current) {
      submittedDemoRef.current = true;
      setEmail(DEMO_CREDENTIALS.email);
      setPassword(DEMO_CREDENTIALS.password);
      doSubmit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit(email, password);
  };

  return (
    <motion.div animate={shakeControls} className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">Inicia sesión</h1>
      <p className="mt-1 text-sm text-ink-dim">Accede a tus tableros y sigue donde lo dejaste.</p>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-error-500/20 bg-error-500/10 p-3.5 text-xs leading-relaxed text-error-500"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">
            Correo
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base pl-10"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-dim cursor-pointer"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || success}
          whileHover={!loading && !success ? { scale: 1.015 } : {}}
          whileTap={!loading && !success ? { scale: 0.98 } : {}}
          className="btn-primary w-full py-3"
        >
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <Check className="h-4 w-4" /> ¡Listo!
              </motion.span>
            ) : loading ? (
              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                Iniciar sesión <ArrowRight className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      <button
        type="button"
        onClick={() => doSubmit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)}
        className="btn-secondary mt-3 w-full"
      >
        Usar cuenta de demostración
      </button>

      <p className="mt-6 text-center text-xs text-ink-dim">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-bold text-brand-500 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </motion.div>
  );
}
