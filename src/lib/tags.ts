/** Normalise a comma-separated tag field into a unique, lowercase list. */
export function normalizeTags(raw: string): string[] {
  const tags = raw
    .split(",")
    .map((tag) =>
      tag
        .trim()
        .replace(/^#/, "")
        .replace(/\s+/g, " ")
        .toLowerCase(),
    )
    .filter(Boolean);

  return [...new Set(tags)];
}
