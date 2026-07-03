import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
        Sahifa topilmadi
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        Kechirasiz, siz qidirgan sahifa mavjud emas yoki o'chirilgan.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
