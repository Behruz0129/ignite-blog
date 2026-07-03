import Link from "next/link";

interface Props {
  eyebrow?: string;
  title: string;
  href?: string; // "Barchasi" havolasi
  hrefLabel?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "Barchasi",
}: Props) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
