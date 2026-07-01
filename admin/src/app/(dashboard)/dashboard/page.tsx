"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<DashboardStats>("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-red-600">Xatolik: {error}</p>;
  }
  if (!stats) {
    return <p className="text-slate-500">Yuklanmoqda...</p>;
  }

  const c = stats.counts;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="📰"
          label="Yangiliklar"
          value={c.news.total}
          sub={`${c.news.published} ta chop etilgan`}
        />
        <StatCard
          icon="📘"
          label="Qo'llanmalar"
          value={c.guides.total}
          sub={`${c.guides.published} ta chop etilgan`}
        />
        <StatCard
          icon="💬"
          label="Maqolalar"
          value={c.opinions.total}
          sub={`${c.opinions.published} ta chop etilgan`}
        />
        <StatCard
          icon="✅"
          label="Izohlar"
          value={c.comments.total}
          sub={`${c.comments.pending} ta kutmoqda`}
        />
        <StatCard icon="🗂️" label="Kategoriyalar" value={c.categories} />
        <StatCard icon="🏷️" label="Teglar" value={c.tags} />
        <StatCard icon="🖼️" label="Media" value={c.media} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">
        So'nggi izohlar
      </h2>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {stats.recentComments.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Hozircha izoh yo'q.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3">Muallif</th>
                <th className="px-5 py-3">Izoh</th>
                <th className="px-5 py-3">Holat</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentComments.map((cm) => (
                <tr key={cm.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium">{cm.authorName}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {cm.content.slice(0, 60)}
                    {cm.content.length > 60 ? "..." : ""}
                  </td>
                  <td className="px-5 py-3">{cm.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
