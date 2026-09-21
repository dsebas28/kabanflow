"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
};

/** Text input whose label rises into the border on focus or when filled. */
export default function FloatingField({ id, label, value, onChange, trailing, className = "", ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-brand-500/20 blur-md"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        className={`relative w-full rounded-xl border border-border bg-surface px-4 pb-2 pt-6 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none ${
          trailing ? "pr-11" : ""
        } ${className}`}
        {...rest}
      />
      <motion.label
        htmlFor={id}
        className="pointer-events-none absolute left-4 origin-left text-ink-faint"
        initial={false}
        animate={lifted ? { top: 8, scale: 0.75, color: focused ? "#8b5cf6" : "#94a3b8" } : { top: 17, scale: 1, color: "#94a3b8" }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        {label}
      </motion.label>
      {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}
