"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { authPost } from "@/lib/auth-client";
import type { ContentType } from "@/lib/types";

interface Props {
  contentId: string;
  type: ContentType;
  initialCount?: number;
  initialLiked?: boolean;
  compact?: boolean;
}

function fieldFor(type: ContentType): "newsId" | "guideId" | "opinionId" {
  if (type === "news") return "newsId";
  if (type === "guides") return "guideId";
  return "opinionId";
}

export default function LikeButton({
  contentId,
  type,
  initialCount = 0,
  initialLiked = false,
  compact = false,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    // Mehmon bo'lsa login sahifasiga yuboramiz. Diqqat: bu yerda <Link>
    // ishlatib bo'lmaydi — LikeButton ArticleCard'ning <Link> kartasi ICHIDA
    // turadi, ya'ni <a> ichida <a> hosil bo'lib hydration xatosi beradi.
    if (!user) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const result = await authPost<{ liked: boolean; likeCount: number }>(
        "/likes/toggle",
        { [fieldFor(type)]: contentId }
      );
      setLiked(result.liked);
      setCount(result.likeCount);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 transition disabled:opacity-50 ${
        liked ? "text-red-500" : "text-ink-soft hover:text-ink"
      } ${compact ? "text-[12px]" : "text-sm"}`}
      aria-label={
        !user
          ? "Like bosish uchun kiring"
          : liked
            ? "Like olib tashlash"
            : "Like bosish"
      }
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
