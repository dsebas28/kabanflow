"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import FloatingField from "@/components/auth/FloatingField";
import { fadeUp, stagger } from "@/lib/motion";

const DEMO_CREDENTIALS = { email: "demo@kanbanflow.app", password: "demo1234" };
const REMEMBER_KEY = "kanbanflow-remember-email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string) {
  if (!value.trim()) return "Escribe tu correo.";
  if (!EMAIL_RE.test(value.trim())) return "Ese correo no parece válido. Revisa que tenga @ y un dominio.";
  return "";
}

function validatePassword(value: string) {
  return value ? "" : "Escribe tu contraseña.";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shakeControls = useAnimation();
  const submittedDemoRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const from = searchParams.get("from");
  const isDemo = searchParams.get("demo") === "1";

  useEffect(() => {
    // localStorage only exists in the browser, so the saved email can't be
    // part of the server-rendered initial state without a hydration mismatch.
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const shake = () => shakeControls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });

  const doSubmit = async (submitEmail: string, submitPassword: string, rememberEmail = remember) => {
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: submitEmail.trim(),
      password: submitPassword,
      redirect: false,
    });
    setLoading(false);

    if (!result || result.error) {
      setError("El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.");
      toast.error("No se pudo iniciar sesión");
      shake();
      return;
    }

    if (rememberEmail) localStorage.setItem(REMEMBER_KEY, submitEmail.trim());
    else localStorage.removeItem(REMEMBER_KEY);

    setSuccess(true);
    toast.success("¡Bienvenido de vuelta!");
    setTimeout(() => router.push(from && from.startsWith("/boards") ? from : "/boards"), 600);
  };

  useEffect(() => {
    if (isDemo && !submittedDemoRef.current) {
      submittedDemoRef.current = true;
      setEmail(DEMO_CREDENTIALS.email);
      setPassword(DEMO_CREDENTIALS.password);
      doSubmit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { email: validateEmail(email), password: validatePassword(password) };
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      shake();
      return;
    }
    doSubmit(email, password);
  };

  const trackCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsOn(e.getModifierState("CapsLock"));

  return (
    <motion.div animate={shakeControls}>
      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-error-500/20 bg-error-500/10 p-3.5 text-xs leading-relaxed text-error-500"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleSubmit} noValidate initial="hidden" animate="show" variants={stagger(0.09, 0.45)} className="space-y-4">
        <motion.div variants={fadeUp}>
          <FloatingField
            id="email"
            type="email"
            label="Correo"
            autoComplete="email"
            autoFocus
            value={email}
            error={fieldErrors.email}
            onChange={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: validateEmail(v) }));
              if (error) setError("");
            }}
            onBlur={() => email && setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            autoComplete="current-password"
            value={password}
            error={fieldErrors.password}
            hint={capsOn ? "Bloq Mayús está activado." : undefined}
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: validatePassword(v) }));
              if (error) setError("");
            }}
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="cursor-pointer text-ink-faint hover:text-ink-dim"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </motion.div>

        <motion.label variants={fadeUp} htmlFor="remember" className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-ink-dim">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-border accent-brand-600"
          />
          Recordar mi correo en este equipo
        </motion.label>

        <motion.div variants={fadeUp}>
          <motion.button
            type="submit"
            disabled={loading || success}
            whileHover={!loading && !success ? { scale: 1.015 } : {}}
            whileTap={!loading && !success ? { scale: 0.98 } : {}}
            animate={success ? { backgroundColor: "#14b8a6" } : {}}
            className="btn-primary btn-shimmer w-full py-3"
          >
            <AnimatePresence mode="wait" initial={false}>
              {success ? (
                <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Listo
                </motion.span>
              ) : loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Iniciar sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-ink-faint">
          <span className="h-px flex-1 bg-border" />
          o
          <span className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.div variants={fadeUp}>
          <button
            type="button"
            disabled={loading || success}
            onClick={() => {
              setEmail(DEMO_CREDENTIALS.email);
              setPassword(DEMO_CREDENTIALS.password);
              setFieldErrors({ email: "", password: "" });
              doSubmit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, false);
            }}
            className="btn-secondary w-full"
          >
            Entrar con la cuenta demo
          </button>
        </motion.div>
      </motion.form>

      <p className="mt-8 text-center text-xs text-ink-dim">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-bold text-brand-500 hover:underline">
          Crea una gratis
        </Link>
      </p>
    </motion.div>
  );
}
