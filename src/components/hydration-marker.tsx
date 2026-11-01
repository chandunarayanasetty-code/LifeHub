"use client";

import * as React from "react";

/**
 * Marks the document once React has hydrated.
 *
 * Interactive UI (dialogs, menus, the theme switch) only works after hydration,
 * so the attribute lets end-to-end tests wait for a real signal instead of a
 * fixed timeout. It also gives CSS a way to hide interactive-only affordances
 * from the server-rendered HTML.
 */
export function HydrationMarker() {
  React.useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    return () => {
      delete document.documentElement.dataset.hydrated;
    };
  }, []);

  return null;
}
