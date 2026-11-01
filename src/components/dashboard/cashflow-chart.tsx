"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { CashflowPoint } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  boxShadow: "0 12px 32px -12px rgba(0, 0, 0, 0.25)",
  fontSize: "12px",
  color: "var(--popover-foreground)",
  padding: "8px 10px",
} as const;

export function CashflowChart({
  data,
  currency = "USD",
}: {
  data: CashflowPoint[];
  currency?: string;
}) {
  const latest = data.at(-1);
  const latestNet = latest
    ? latest.incomeCents - latest.expenseCents
    : 0;

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Income vs expenses
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Last six months · amounts in {currency}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
            This month net
          </p>
          <p
            className={
              latestNet < 0
                ? "text-[13px] font-semibold text-rose-600 tabular-nums dark:text-rose-400"
                : "text-[13px] font-semibold tabular-nums"
            }
          >
            {formatCurrency(latestNet, currency, { compact: true })}
          </p>
        </div>
      </div>
      <CardContent className="px-2 pt-3 pb-2 sm:px-3">
        <p className="sr-only">
          Income and expenses for the last six months. This month income is{" "}
          {formatCurrency(latest?.incomeCents ?? 0, currency)} and expenses are{" "}
          {formatCurrency(latest?.expenseCents ?? 0, currency)}.
        </p>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
              barGap={4}
              accessibilityLayer
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={9}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickFormatter={(value: number) =>
                  formatCurrency(value, currency, { compact: true })
                }
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{
                  color: "var(--muted-foreground)",
                  fontSize: "11px",
                  marginBottom: "4px",
                }}
                formatter={(value) => formatCurrency(Number(value), currency)}
              />
              <Bar
                dataKey="incomeCents"
                name="Income"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
              <Bar
                dataKey="expenseCents"
                name="Expenses"
                fill="var(--chart-5)"
                fillOpacity={0.7}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 px-2 pt-1 pb-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" aria-hidden="true" />
            Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-5" aria-hidden="true" />
            Expenses
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
