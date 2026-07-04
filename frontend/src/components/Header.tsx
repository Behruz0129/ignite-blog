"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { getOAuthUrl } from "@/lib/auth-client";

const NAV = [
  { href: "/news", label: "Yangiliklar" },
  { href: "/guides", label: "Qo'llanmalar" },
  { href: "/opinions", label: "Maqolalar" },
];

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="container-content flex h-14 items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          IGNITE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] text-ink-soft transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-[13px] text-ink sm:inline">
                    {user.name}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-[12px] text-ink-soft transition hover:text-ink"
                  >
                    Chiqish
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-[13px] text-ink-soft transition hover:text-ink"
                  >
                    Kirish
                  </Link>
                  <Link href="/register" className="btn-primary py-1.5 text-[12px]">
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
