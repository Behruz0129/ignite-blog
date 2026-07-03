import Link from "next/link";

interface Props {
  basePath: string; // masalan "/news"
  page: number;
  totalPages: number;
}

// Server komponent uchun mos - havolalar orqali sahifalash (?page=)
export default function Pagination({ basePath, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const linkFor = (p: number) => `${basePath}?page=${p}`;

  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      {prev ? (
        <Link href={linkFor(prev)} className="btn-ghost">
          ← Oldingi
        </Link>
      ) : (
        <span className="btn-ghost pointer-events-none opacity-40">
          ← Oldingi
        </span>
      )}

      <span className="text-sm text-ink-soft">
        {page} / {totalPages}
      </span>

      {next ? (
        <Link href={linkFor(next)} className="btn-ghost">
          Keyingi →
        </Link>
      ) : (
        <span className="btn-ghost pointer-events-none opacity-40">
          Keyingi →
        </span>
      )}
    </div>
  );
}
