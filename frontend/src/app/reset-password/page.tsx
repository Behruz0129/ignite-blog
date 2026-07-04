import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container-content flex min-h-[60vh] items-center justify-center text-ink-soft">
          Yuklanmoqda...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
