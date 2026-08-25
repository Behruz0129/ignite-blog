"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { commentAuthor, formatDateShort, initial } from "@/lib/format";
import Icon, { type IconName } from "@/components/Icon";

// ---------------------------------------------------------------- kartochka

function StatCard({
  href,
  label,
  value,
  sub,
  icon,
  accent,
}: {
  href: string;
  label: string;
  value: number;
  sub?: string;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card card-pad group transition hover:border-line-strong hover:shadow-pop"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent ? "bg-brand-soft text-brand" : "bg-canvas text-ink-soft"
          }`}
        >
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <Icon
          name="chevronRight"
          className="h-4 w-4 text-ink-faint opacity-0 transition group-hover:opacity-100"
        />
      </div>

      <p className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
    </Link>
  );
}

// ---------------------------------------------------------------- sahifa

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
    return (
      <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
        <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-ink-faint">
        <Icon name="spinner" className="h-4 w-4 animate-spin" />
        Yuklanmoqda…
      </div>
    );
  }

  const c = stats.counts;
  const draftTotal =
    c.news.total -
    c.news.published +
    (c.guides.total - c.guides.published) +
    (c.opinions.total - c.opinions.published);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-title">Boshqaruv</h2>
        <p className="page-sub">
          {c.comments.pending > 0
            ? `${c.comments.pending} ta izoh moderatsiya kutmoqda`
            : "Kutayotgan izoh yo'q"}
          {draftTotal > 0 && ` · ${draftTotal} ta qoralama`}
        </p>
      </div>

      {/* Kontent */}
      <section>
        <h3 className="card-title mb-3">Kontent</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            href="/news"
            icon="news"
            label="Yangiliklar"
            value={c.news.total}
            sub={`${c.news.published} ta chop etilgan`}
          />
          <StatCard
            href="/guides"
            icon="guide"
            label="Qo'llanmalar"
            value={c.guides.total}
            sub={`${c.guides.published} ta chop etilgan`}
          />
          <StatCard
            href="/opinions"
            icon="opinion"
            label="Maqolalar"
            value={c.opinions.total}
            sub={`${c.opinions.published} ta chop etilgan`}
          />
          <StatCard
            href="/comments"
            icon="comment"
            label="Izohlar"
            value={c.comments.total}
            sub={`${c.comments.pending} ta kutmoqda`}
            accent={c.comments.pending > 0}
          />
        </div>
      </section>

      {/* Tasniflash */}
      <section>
        <h3 className="card-title mb-3">Tasniflash va media</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            href="/categories"
            icon="folder"
            label="Kategoriyalar"
            value={c.categories}
          />
          <StatCard href="/tags" icon="tag" label="Teglar" value={c.tags} />
          <StatCard href="/media" icon="image" label="Media" value={c.media} />
        </div>
      </section>

      {/* So'nggi izohlar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="card-title">So&apos;nggi izohlar</h3>
          <Link
            href="/comments"
            className="text-[13px] font-medium text-brand hover:underline"
          >
            Barchasi →
          </Link>
        </div>

        <div className="card divide-y divide-line">
          {stats.recentComments.length === 0 ? (
            <div className="empty-state">
              <Icon name="comment" className="h-7 w-7 text-ink-faint" />
              <p className="text-sm text-ink-soft">Hozircha izoh yo&apos;q.</p>
            </div>
          ) : (
            stats.recentComments.map((cm) => {
              const name = commentAuthor(cm);
              return (
                <div key={cm.id} className="flex items-start gap-3 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-ink-soft">
                    {initial(name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">
                        {name}
                      </span>
                      <span className="text-xs text-ink-faint">
                        {formatDateShort(cm.createdAt)}
                      </span>
                      <span
                        className={
                          cm.status === "APPROVED"
                            ? "pill-ok"
                            : cm.status === "REJECTED"
                            ? "pill-danger"
                            : "pill-warn"
                        }
                      >
                        {cm.status === "APPROVED"
                          ? "Tasdiqlangan"
                          : cm.status === "REJECTED"
                          ? "Rad etilgan"
                          : "Kutmoqda"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                      {cm.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
