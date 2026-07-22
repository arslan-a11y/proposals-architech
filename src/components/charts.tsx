"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { STATUS_META } from "@/lib/utils";

export function StatusPie({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const chart = data.map((d) => ({
    name: STATUS_META[d.status]?.label ?? d.status,
    value: d.count,
    fill: STATUS_META[d.status]?.dot ?? "#9AA4B2",
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chart}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {chart.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FunnelBar({
  funnel,
}: {
  funnel: { sent: number; opened: number; signed: number; rejected: number };
}) {
  const data = [
    { stage: "Sent", value: funnel.sent },
    { stage: "Opened", value: funnel.opened },
    { stage: "Signed", value: funnel.signed },
    { stage: "Rejected", value: funnel.rejected },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={38}>
        <XAxis dataKey="stage" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#4D54F5" />
      </BarChart>
    </ResponsiveContainer>
  );
}
