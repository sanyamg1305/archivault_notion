"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function SalesTrendChart({ data }: { data: { month: string; sales: number }[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-foreground">Sales, last 6 months</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#D8DEE9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7A96", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7A96", fontSize: 12 }}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "#D8DEE9", opacity: 0.3 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #D8DEE9",
                fontSize: 12,
              }}
            />
            <Bar dataKey="sales" fill="#1B4FD8" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
