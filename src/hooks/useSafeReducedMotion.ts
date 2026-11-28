"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Hydration-safe wrapper around Framer Motion's `useReducedMotion`.
 * Returns `true` during SSR and the initial hydration pass so server and client
 * attributes match identically even when the OS enables `prefers-reduced-motion`.
 */
export function useSafeReducedMotion(): boolean {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return !mounted ? true : Boolean(prefersReduced);
}
