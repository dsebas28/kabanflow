"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
  error?: string;
  hint?: ReactNode;
};

/** Text input whose label rises into the border on focus or when filled. */
export default function FloatingField({
  id,
  label,
  value,
  onChange,
  trailing,
  error,
  hint,
  className = "",
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const labelColor = error ? "#ef4444" : focused ? "#8b5cf6" : "#94a3b8";

  return (
    <div>
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-1 rounded-2xl blur-md ${error ? "bg-error-500/20" : "bg-brand-500/20"}`}
          animate={{ opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`relative w-full rounded-xl border bg-surface px-4 pb-2 pt-6 text-sm text-ink transition-colors focus:outline-none ${
            error ? "border-error-500 focus:border-error-500" : "border-border focus:border-brand-500"
          } ${trailing ? "pr-11" : ""} ${className}`}
          {...rest}
        />
        <motion.label
          htmlFor={id}
          className="pointer-events-none absolute left-4 origin-left"
          initial={false}
          animate={lifted ? { top: 8, scale: 0.75, color: labelColor } : { top: 17, scale: 1, color: labelColor }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          {label}
        </motion.label>
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-1.5 text-xs font-medium text-error-500"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            id={`${id}-hint`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-1.5 text-xs text-ink-dim"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
