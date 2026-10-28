"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during server rendering and the hydration pass, then true.
 *
 * This avoids hydration mismatches for theme-dependent UI without calling
 * setState inside an effect (which React 19 rightly discourages).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
