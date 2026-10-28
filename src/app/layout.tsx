import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LifeHub — One place for everything that matters",
    template: "%s · LifeHub",
  },
  description:
    "LifeHub brings tasks, calendar events, money, habits, notes, and goals into one calm personal dashboard.",
  applicationName: "LifeHub",
  keywords: [
    "personal productivity",
    "task manager",
    "habit tracker",
    "expense tracker",
    "personal dashboard",
  ],
  authors: [{ name: "LifeHub" }],
  openGraph: {
    title: "LifeHub — One place for everything that matters",
    description:
      "A calm, secure home for your tasks, calendar, money, habits, notes, and goals.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#14161c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable, instrumentSerif.variable)}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
