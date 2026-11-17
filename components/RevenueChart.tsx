"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { formatVND } from "@/lib/format";

export default function RevenueChart({ data, byCategory }: { data: { date: string; revenue: number; orders: number }[]; byCategory: { name: string; revenue: number }[] }) {
  return (
    <div className="grid xl:grid-cols-5 gap-4">
      <div className="xl:col-span-3 rounded-2xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Doanh thu theo ngày</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 4, right: 4 }}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B4532A" stopOpacity={0.6} /><stop offset="95%" stopColor="#B4532A" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : `${v / 1e3}k`} />
              <Tooltip contentStyle={{ background: "#1c1a17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 12 }} formatter={(v, name) => [name === "revenue" ? formatVND(Number(v ?? 0)) : String(v ?? 0), name === "revenue" ? "Doanh thu" : "Đơn hàng"] as [string, string]} />
              <Area type="monotone" dataKey="revenue" stroke="#B4532A" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="xl:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Doanh thu theo danh mục</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#e8e4df" }} tickLine={false} axisLine={false} width={80} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} contentStyle={{ background: "#1c1a17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 12 }} formatter={(v) => [formatVND(Number(v ?? 0)), "Doanh thu"] as [string, string]} />
              <Bar dataKey="revenue" fill="#c9a227" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
