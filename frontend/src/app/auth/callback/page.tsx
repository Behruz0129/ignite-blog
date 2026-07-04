import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container-content flex min-h-[50vh] items-center justify-center text-ink-soft">
          Yuklanmoqda...
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
