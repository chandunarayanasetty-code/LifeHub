import { z } from "zod";

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export const CURRENCY_LABELS: Record<(typeof CURRENCIES)[number], string> = {
  USD: "US Dollar (USD)",
  EUR: "Euro (EUR)",
  GBP: "British Pound (GBP)",
  INR: "Indian Rupee (INR)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
};

export const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
] as const;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(60, "Keep your name under 60 characters."),
  currency: z.enum(CURRENCIES),
  timezone: z.enum(TIMEZONES),
  weekStartsOn: z.enum(["0", "1"]),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm."),
  confirmation: z
    .string()
    .trim()
    .refine((value) => value === "DELETE", 'Type DELETE to confirm.'),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
