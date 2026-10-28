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
import type { WeeklyProductivityPoint } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  boxShadow: "0 12px 32px -12px rgba(0, 0, 0, 0.25)",
  fontSize: "12px",
  color: "var(--popover-foreground)",
  padding: "8px 10px",
} as const;

export function ProductivityChart({
  data,
}: {
  data: WeeklyProductivityPoint[];
}) {
  const totalCompleted = data.reduce((sum, point) => sum + point.completed, 0);
  const totalCreated = data.reduce((sum, point) => sum + point.created, 0);

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Weekly productivity
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tasks completed versus created · last 7 days
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-1" aria-hidden="true" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full bg-chart-2 opacity-50"
              aria-hidden="true"
            />
            Created
          </span>
        </div>
      </div>
      <CardContent className="px-2 pt-3 pb-2 sm:px-3">
        <p className="sr-only">
          Over the last seven days you completed {totalCompleted} tasks and
          created {totalCreated} tasks.
        </p>
        <div className="h-[228px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              barGap={4}
              accessibilityLayer
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={9}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={34}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{
                  color: "var(--muted-foreground)",
                  fontSize: "11px",
                  marginBottom: "4px",
                }}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="var(--chart-1)"
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
              <Bar
                dataKey="created"
                name="Created"
                fill="var(--chart-2)"
                fillOpacity={0.45}
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
