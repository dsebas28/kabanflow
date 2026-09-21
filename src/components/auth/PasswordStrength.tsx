"use client";

import { motion } from "framer-motion";

const LEVELS = [
  { label: "Muy corta", color: "#ef4444" },
  { label: "Débil", color: "#f97316" },
  { label: "Aceptable", color: "#f59e0b" },
  { label: "Buena", color: "#14b8a6" },
  { label: "Fuerte", color: "#10b981" },
];

export function scorePassword(password: string): number {
  if (password.length < 6) return 0;
  let score = 1;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: i < score || (score === 0 && i === 0) ? "100%" : "0%", backgroundColor: level.color }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-dim">
        Seguridad: <span style={{ color: level.color }} className="font-semibold">{level.label}</span>
      </p>
    </div>
  );
}
