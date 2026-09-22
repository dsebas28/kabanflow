"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import FloatingField from "@/components/auth/FloatingField";
import RouteWipe, { type WipeOrigin } from "@/components/auth/RouteWipe";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { fadeUp, stagger } from "@/lib/motion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateName = (v: string) => (v.trim().length >= 2 ? "" : "Escribe tu nombre (mínimo 2 letras).");
const validateEmail = (v: string) => {
  if (!v.trim()) return "Escribe tu correo.";
  return EMAIL_RE.test(v.trim()) ? "" : "Ese correo no parece válido. Revisa que tenga @ y un dominio.";
};
const validatePassword = (v: string) => (v.length >= 6 ? "" : "La contraseña necesita al menos 6 caracteres.");

export default function RegisterForm() {
  const router = useRouter();
  const shakeControls = useAnimation();
  const submitRef = useRef<HTMLButtonElement>(null);
  const [wipe, setWipe] = useState<WipeOrigin | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const shake = () => shakeControls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = { name: validateName(name), email: validateEmail(email), password: validatePassword(password) };
    setFieldErrors(errors);
    if (errors.name || errors.email || errors.password) {
      shake();
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "No se pudo crear la cuenta.");
      toast.error(data.error || "No se pudo crear la cuenta");
      shake();
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (!result || result.error) {
      toast.error("Tu cuenta se creó, pero no pudimos iniciar sesión. Entra desde aquí.");
      router.push("/login");
      return;
    }

    setSuccess(true);
    const rect = submitRef.current?.getBoundingClientRect();
    setWipe(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    toast.success("¡Cuenta creada!");
    setTimeout(() => router.push("/boards"), 850);
  };

  return (
    <motion.div animate={shakeControls}>
      <RouteWipe origin={wipe} />
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
            id="name"
            label="Nombre"
            autoComplete="name"
            autoFocus
            value={name}
            error={fieldErrors.name}
            onChange={(v) => {
              setName(v);
              if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: validateName(v) }));
            }}
            onBlur={() => name && setFieldErrors((f) => ({ ...f, name: validateName(name) }))}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingField
            id="email"
            type="email"
            label="Correo"
            autoComplete="email"
            value={email}
            error={fieldErrors.email}
            onChange={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: validateEmail(v) }));
            }}
            onBlur={() => email && setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            autoComplete="new-password"
            value={password}
            error={fieldErrors.password}
            hint="Mínimo 6 caracteres. Mezcla mayúsculas, números y símbolos para hacerla más fuerte."
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: validatePassword(v) }));
            }}
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
          <PasswordStrength password={password} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <motion.button
            ref={submitRef}
            type="submit"
            disabled={loading || success}
            whileHover={!loading && !success ? { scale: 1.015 } : {}}
            whileTap={!loading && !success ? { scale: 0.98 } : {}}
            animate={success ? { backgroundColor: "#3d5a4c", borderColor: "#3d5a4c" } : {}}
            className="btn-mark w-full py-3"
          >
            <AnimatePresence mode="wait" initial={false}>
              {success ? (
                <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Listo
                </motion.span>
              ) : loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Crear cuenta
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.form>

      <p className="mt-8 text-center text-xs text-ink-dim">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[var(--mark)] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  );
}
