"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const shakeControls = useAnimation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      shakeControls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (!result || result.error) {
      setError("Cuenta creada, pero no se pudo iniciar sesión automáticamente.");
      router.push("/login");
      return;
    }

    setSuccess(true);
    toast.success("¡Cuenta creada!");
    setTimeout(() => router.push("/boards"), 500);
  };

  return (
    <motion.div animate={shakeControls} className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-ink-dim">Es gratis y toma menos de un minuto.</p>

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
          <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">
            Nombre
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base pl-10"
              placeholder="Tu nombre"
            />
          </div>
        </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base pl-10 pr-10"
              placeholder="Mínimo 6 caracteres"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                Crear cuenta <ArrowRight className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-dim">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-brand-500 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  );
}
