import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-haze">
      <div className="container-content flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">IGNITE</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Gaming olamidan yangiliklar, qo'llanmalar va fikrlar.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-soft">
          <Link href="/news" className="hover:text-ink">
            Yangiliklar
          </Link>
          <Link href="/guides" className="hover:text-ink">
            Qo'llanmalar
          </Link>
          <Link href="/opinions" className="hover:text-ink">
            Maqolalar
          </Link>
        </nav>
      </div>
      <div className="border-t border-line/70">
        <div className="container-content py-5">
          <p className="text-[12px] text-ink-soft">
            © {year} Ignite Blog. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
