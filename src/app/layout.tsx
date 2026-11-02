import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Instrument_Serif } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { HydrationMarker } from "@/components/hydration-marker";
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

/**
 * `children` is typed explicitly instead of using Next's generated
 * `LayoutProps<"/">` helper: that type only exists after `next build`/`next dev`
 * has written `.next/types`, so a plain `tsc --noEmit` on a fresh clone (as CI
 * runs it) would fail with "Cannot find name 'LayoutProps'".
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
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
          <HydrationMarker />
        </ThemeProvider>
      </body>
    </html>
  );
}
