"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser, isSuperAdmin } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/news", label: "Yangiliklar", icon: "📰" },
  { href: "/guides", label: "Qo'llanmalar", icon: "📘" },
  { href: "/opinions", label: "Maqolalar", icon: "💬" },
  { href: "/categories", label: "Kategoriyalar", icon: "🗂️" },
  { href: "/tags", label: "Teglar", icon: "🏷️" },
  { href: "/comments", label: "Izohlar", icon: "✅" },
  { href: "/media", label: "Media", icon: "🖼️" },
];

const SUPER_NAV = { href: "/users", label: "Foydalanuvchilar", icon: "👥" };

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const navItems = isSuperAdmin(user?.role)
    ? [...NAV.slice(0, 4), SUPER_NAV, ...NAV.slice(4)]
    : NAV;

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-slate-200">
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-lg font-bold text-white">🔥 Ignite Blog</h1>
        <p className="text-xs text-slate-400">CMS Admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-brand text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{user?.name}</p>
        <p className="truncate text-xs text-slate-400">{user?.email}</p>
        <p className="mt-1 text-[11px] text-slate-500">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-sm text-slate-200 transition hover:bg-red-600 hover:text-white"
        >
          Chiqish
        </button>
      </div>
    </aside>
  );
}
