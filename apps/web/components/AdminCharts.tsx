"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", signups: 40, completions: 24 },
  { name: "Feb", signups: 60, completions: 38 },
  { name: "Mar", signups: 100, completions: 50 },
  { name: "Apr", signups: 200, completions: 120 },
  { name: "May", signups: 278, completions: 190 },
  { name: "Jun", signups: 350, completions: 250 },
];

export function EngagementChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="signups"
            stroke="#0d9488"
            fillOpacity={1}
            fill="url(#colorSignups)"
          />
          <Area
            type="monotone"
            dataKey="completions"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorCompletions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
