"use client";

import { useState } from "react";
import { PUBLIC_API_URL } from "@/lib/api";
import type { ContentType, PublicComment } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface Props {
  contentId: string;
  type: ContentType;
  initialComments: PublicComment[];
}

// Kontent turiga qarab qaysi id maydonini yuborishni aniqlaymiz
function fieldFor(type: ContentType): "newsId" | "guideId" | "opinionId" {
  if (type === "news") return "newsId";
  if (type === "guides") return "guideId";
  return "opinionId";
}

export default function CommentSection({
  contentId,
  type,
  initialComments,
}: Props) {
  const [comments] = useState<PublicComment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${PUBLIC_API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          authorEmail: email,
          content,
          [fieldFor(type)]: contentId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Xatolik");
      setStatus("ok");
      setMessage(
        "Rahmat! Izohingiz qabul qilindi va moderatsiyadan so'ng ko'rinadi."
      );
      setName("");
      setEmail("");
      setContent("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  }

  return (
    <section className="mt-16 border-t border-line pt-12">
      <h2 className="text-xl font-semibold tracking-tight">
        Izohlar{" "}
        <span className="text-ink-soft">({comments.length})</span>
      </h2>

      {/* Mavjud izohlar */}
      <div className="mt-6 space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Hozircha izoh yo'q. Birinchi bo'lib fikr bildiring.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-2xl bg-haze p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                  {c.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.authorName}</p>
                  <p className="text-[12px] text-ink-soft">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Yangi izoh formasi */}
      <form onSubmit={submit} className="mt-10 max-w-xl">
        <h3 className="text-base font-semibold">Fikr bildirish</h3>

        {message && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              status === "ok"
                ? "bg-haze text-ink"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingiz"
            className="rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (ko'rinmaydi)"
            className="rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Fikringiz..."
          className="mt-3 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary mt-4 disabled:opacity-50"
        >
          {status === "loading" ? "Yuborilmoqda..." : "Yuborish"}
        </button>
      </form>
    </section>
  );
}
