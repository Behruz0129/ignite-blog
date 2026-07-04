"use client";

import { useState } from "react";
import Link from "next/link";
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
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!user) return;
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

  if (!user) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 text-ink-soft transition hover:text-ink ${
          compact ? "text-[12px]" : "text-sm"
        }`}
      >
        <span>{liked ? "♥" : "♡"}</span>
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 transition disabled:opacity-50 ${
        liked ? "text-red-500" : "text-ink-soft hover:text-ink"
      } ${compact ? "text-[12px]" : "text-sm"}`}
      aria-label={liked ? "Like olib tashlash" : "Like bosish"}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
