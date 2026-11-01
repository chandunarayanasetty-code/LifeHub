/**
 * Presentation formatters and small pure helpers.
 *
 * Keeping these functions free of React makes them straightforward to unit
 * test with Vitest.
 */

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY = "USD";

export function formatCurrency(
  amountCents: number,
  currency = DEFAULT_CURRENCY,
  options: { compact?: boolean; signDisplay?: "auto" | "never" | "always" } = {},
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    notation: options.compact ? "compact" : "standard",
    maximumFractionDigits: options.compact ? 1 : 2,
    minimumFractionDigits: options.compact ? 0 : 2,
    signDisplay: options.signDisplay ?? "auto",
  }).format(amountCents / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}

export function formatPercent(
  value: number,
  options: { maximumFractionDigits?: number } = {},
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "percent",
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(value);
}

export function formatLongDate(value: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatShortDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(
  value: Date | string,
  now = new Date(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
    numeric: "auto",
  });

  const thresholds: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 525_600],
    ["month", 43_200],
    ["week", 10_080],
    ["day", 1_440],
    ["hour", 60],
    ["minute", 1],
  ];

  for (const [unit, minutes] of thresholds) {
    if (Math.abs(diffMinutes) >= minutes) {
      return formatter.format(Math.round(diffMinutes / minutes), unit);
    }
  }

  return "just now";
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Convert a 0-100 percentage into a clamped value. Guards charts and progress
 * bars against division-by-zero and out-of-range data.
 */
export function clampPercent(value: number, total: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (value / total) * 100));
}
