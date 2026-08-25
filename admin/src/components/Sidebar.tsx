"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getUser, isSuperAdmin } from "@/lib/auth";
import { initial } from "@/lib/format";
import Icon, { type IconName } from "./Icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** faqat asosiy admin ko'radi */
  superOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Bo'limlar guruhlab beriladi — bitta ro'yxatda 9 ta havola ko'z charchatadi
const NAV: NavGroup[] = [
  {
    title: "Umumiy",
    items: [{ href: "/dashboard", label: "Boshqaruv", icon: "dashboard" }],
  },
  {
    title: "Kontent",
    items: [
      { href: "/news", label: "Yangiliklar", icon: "news" },
      { href: "/guides", label: "Qo'llanmalar", icon: "guide" },
      { href: "/opinions", label: "Maqolalar", icon: "opinion" },
      { href: "/resources", label: "Resurslar", icon: "external" },
      { href: "/media", label: "Media", icon: "image" },
    ],
  },
  {
    title: "Tasniflash",
    items: [
      { href: "/categories", label: "Kategoriyalar", icon: "folder" },
      { href: "/tags", label: "Teglar", icon: "tag" },
    ],
  },
  {
    title: "Jamoa",
    items: [
      { href: "/comments", label: "Izohlar", icon: "comment" },
      {
        href: "/users",
        label: "Foydalanuvchilar",
        icon: "users",
        superOnly: true,
      },
    ],
  },
];

const COLLAPSE_KEY = "ignite.sidebar.collapsed";

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  // localStorage faqat brauzerda bor — shuning uchun effekt ichida o'qiymiz
  useEffect(() => {
    setUser(getUser());
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  const isSuper = isSuperAdmin(user?.role);

  // Ruxsati yo'q bo'limlarni olib tashlaymiz; bo'sh qolgan guruh ham chiqmaydi
  const groups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.superOnly || isSuper),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      {/* Mobil qoplama */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* shrink-0 + min-w-0 shart: flex elementining "avtomatik minimal kengligi"
          (min-width: auto) kontent kengligiga tenglashib, yig'ilgan holatdagi
          w-[72px] ni bosib ketadi. */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex min-w-0 shrink-0 flex-col
                    overflow-hidden bg-rail text-white
                    transition-[width,transform] duration-200
                    lg:static lg:translate-x-0
                    ${collapsed ? "w-[72px]" : "w-64"}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logotip */}
        <div
          className={`flex h-16 shrink-0 items-center gap-2.5 border-b border-rail-line ${
            collapsed ? "justify-center px-0" : "px-5"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-[15px] font-bold">
            I
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold leading-tight">
                Ignite Blog
              </span>
              <span className="block text-[11px] text-white/45">
                Boshqaruv paneli
              </span>
            </span>
          )}
        </div>

        {/* Navigatsiya */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {group.title}
                </p>
              )}

              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`group relative mb-0.5 flex items-center gap-3 rounded-lg py-2 text-sm transition
                      ${collapsed ? "justify-center px-0" : "px-3"}
                      ${
                        active
                          ? "bg-rail-soft font-medium text-white"
                          : "text-white/60 hover:bg-rail-soft/60 hover:text-white"
                      }`}
                  >
                    {/* Faol bo'limning chap belgisi */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-brand" />
                    )}
                    <Icon
                      name={item.icon}
                      className="h-[18px] w-[18px] shrink-0"
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}

              {/* Yig'ilgan holatda guruhlar chiziq bilan ajratiladi */}
              {collapsed && (
                <div className="mx-auto mt-3 h-px w-6 bg-rail-line last:hidden" />
              )}
            </div>
          ))}
        </nav>

        {/* Foydalanuvchi */}
        <div className="shrink-0 border-t border-rail-line p-3">
          <div
            className={`flex items-center gap-3 rounded-lg p-2 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/25 text-[13px] font-semibold text-white">
              {initial(user?.name || "?")}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{user?.name}</p>
                <p className="truncate text-[11px] text-white/45">
                  {user?.role === "SUPER_ADMIN" ? "Bosh admin" : "Admin"}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                title="Chiqish"
                aria-label="Chiqish"
                className="rounded-md p-1.5 text-white/50 transition hover:bg-danger hover:text-white"
              >
                <Icon name="logout" className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={logout}
              title="Chiqish"
              aria-label="Chiqish"
              className="mt-1 flex w-full justify-center rounded-md p-2 text-white/50 transition hover:bg-danger hover:text-white"
            >
              <Icon name="logout" className="h-[18px] w-[18px]" />
            </button>
          )}

          {/* Yig'ish tugmasi — faqat kattaroq ekranda */}
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Panelni yoyish" : "Panelni yig'ish"}
            className={`mt-2 hidden w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]
                        text-white/45 transition hover:bg-rail-soft hover:text-white lg:flex
                        ${collapsed ? "justify-center px-0" : ""}`}
          >
            <Icon name="panel" className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Yig'ish</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
