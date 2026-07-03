import Link from "next/link";

const NAV = [
  { href: "/news", label: "Yangiliklar" },
  { href: "/guides", label: "Qo'llanmalar" },
  { href: "/opinions", label: "Maqolalar" },
];

// Apple uslubidagi sticky, orqa foni xiralashgan (backdrop-blur) navigatsiya.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="container-content flex h-14 items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          IGNITE
        </Link>

        <nav className="hidden gap-8 md:flex">
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

        {/* Mobil: oddiy havolalar qatori */}
        <nav className="flex gap-5 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] text-ink-soft transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
