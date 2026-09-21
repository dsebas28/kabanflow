"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

// A template (unlike a layout) remounts on every navigation, so each page
// inside the app eases in instead of snapping.
export default function BoardsTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="min-h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
