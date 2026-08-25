"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, getUser, isAdminRole } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { ToastProvider } from "@/components/Toast";

// Yuqoridagi sarlavha uchun bo'lim nomlari
const TITLES: Record<string, string> = {
  "/dashboard": "Boshqaruv",
  "/news": "Yangiliklar",
  "/guides": "Qo'llanmalar",
  "/opinions": "Maqolalar",
  "/categories": "Kategoriyalar",
  "/tags": "Teglar",
  "/comments": "Izohlar",
  "/media": "Media",
  "/users": "Foydalanuvchilar",
};

// Ommaviy sayt manzili: prodda .env orqali beriladi
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

function titleFor(pathname: string): string {
  const key = Object.keys(TITLES)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return key ? TITLES[key] : "Ignite Blog";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!isAdminRole(getUser()?.role)) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  // Sahifa almashganda mobil menyu yopilsin
  useEffect(() => setMobileOpen(false), [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-ink-faint">
        <Icon name="spinner" className="h-4 w-4 animate-spin" />
        Tekshirilmoqda…
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Yuqori panel */}
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menyu"
              className="btn-icon lg:hidden"
            >
              <Icon name="menu" />
            </button>

            <h1 className="truncate text-[15px] font-semibold text-ink">
              {titleFor(pathname)}
            </h1>

            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm ml-auto"
              title="Ommaviy saytni yangi oynada ochish"
            >
              <Icon name="external" className="h-4 w-4" />
              <span className="hidden sm:inline">Saytni ko'rish</span>
            </a>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
