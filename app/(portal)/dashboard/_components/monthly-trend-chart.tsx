"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySpending } from "@/types/portal";

interface Props {
  data: MonthlySpending[];
  color: string;
}

function formatYAxis(value: number) {
  if (value >= 1000) {
    return `₱${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `₱${value}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        ₱{payload[0].value.toLocaleString("en-PH")}
      </p>
    </div>
  );
}

export function MonthlyTrendChart({ data, color }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No spending data available.
      </div>
    );
  }

  const nonZero = data.filter((d) => d.total > 0);
  const avg =
    nonZero.length > 0
      ? nonZero.reduce((s, d) => s + d.total, 0) / nonZero.length
      : 0;

  const lastLabel = data[data.length - 1]?.label;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={({
            x,
            y,
            payload,
          }: {
            x: number;
            y: number;
            payload: { value: string };
          }) => (
            <text
              x={x}
              y={y + 12}
              textAnchor="middle"
              fill={payload.value === lastLabel ? color : "#9CA3AF"}
              fontSize={payload.value === lastLabel ? 11 : 10}
              fontWeight={payload.value === lastLabel ? 700 : 400}
            >
              {payload.value}
            </text>
          )}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          tick={{ fill: "#B0B8C4", fontSize: 10 }}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        {avg > 0 && (
          <ReferenceLine
            y={avg}
            stroke={color}
            strokeDasharray="3 4"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            label={{
              value: "avg",
              position: "insideTopLeft",
              fill: color,
              fillOpacity: 0.6,
              fontSize: 9,
            }}
          />
        )}
        <Bar dataKey="total" radius={[5, 5, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === data.length - 1 ? color : `${color}28`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
