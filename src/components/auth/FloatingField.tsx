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

/** Underline-style field: label sits above, a hairline rule underneath draws in red on focus. */
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
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-dim">
        {label}
      </label>
      <div className="relative">
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
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`underline-field ${error ? "has-error" : ""} ${trailing ? "pr-9" : ""} ${className}`}
          {...rest}
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] w-full bg-[var(--mark)]"
          style={{ transformOrigin: "left" }}
          initial={false}
          animate={{ scaleX: focused && !error ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
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
            className="overflow-hidden pt-1.5 text-xs font-medium text-[var(--mark)]"
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
