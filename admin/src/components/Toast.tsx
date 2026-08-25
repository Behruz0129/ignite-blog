"use client";

/**
 * XABARNOMA (toast)
 * -----------------
 * Saqlash / o'chirish natijasini bildirish uchun. Ilgari muvaffaqiyat
 * umuman ko'rinmas edi (sahifa jimgina almashardi), xato esa alert() bilan
 * chiqardi — ikkalasi ham noqulay.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Icon from "./Icon";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast faqat ToastProvider ichida ishlaydi");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, kind, text }]);
    // Xato uzoqroq turadi — o'qishga ulgurish kerak
    window.setTimeout(
      () => setItems((prev) => prev.filter((t) => t.id !== id)),
      kind === "error" ? 6000 : 3200
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (t) => push("success", t),
      error: (t) => push("error", t),
      info: (t) => push("info", t),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex animate-toast-in items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm shadow-pop
              ${
                t.kind === "success"
                  ? "border-ok/20 bg-paper text-ink"
                  : t.kind === "error"
                  ? "border-danger/25 bg-paper text-ink"
                  : "border-line bg-paper text-ink"
              }`}
          >
            <span
              className={`mt-0.5 shrink-0 ${
                t.kind === "success"
                  ? "text-ok"
                  : t.kind === "error"
                  ? "text-danger"
                  : "text-ink-faint"
              }`}
            >
              <Icon
                name={t.kind === "success" ? "check" : t.kind === "error" ? "alert" : "comment"}
                className="h-[18px] w-[18px]"
              />
            </span>
            <span className="flex-1 leading-snug">{t.text}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Yopish"
              className="shrink-0 rounded p-0.5 text-ink-faint transition hover:text-ink"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
