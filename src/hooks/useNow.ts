"use client";

import { useEffect, useState } from "react";

/** Current time, refreshed on an interval, so "hace 5 min" labels stay honest without impure renders. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
