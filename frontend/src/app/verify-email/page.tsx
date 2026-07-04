import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container-content flex min-h-[60vh] items-center justify-center text-ink-soft">
          Yuklanmoqda...
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
