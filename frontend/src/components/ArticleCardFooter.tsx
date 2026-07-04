"use client";

import LikeButton from "./LikeButton";
import type { ContentType } from "@/lib/types";

interface Props {
  contentId: string;
  type: ContentType;
  likeCount?: number;
  likedByMe?: boolean;
}

export default function ArticleCardFooter({
  contentId,
  type,
  likeCount = 0,
  likedByMe = false,
}: Props) {
  return (
    <div
      className="flex items-center gap-3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <LikeButton
        contentId={contentId}
        type={type}
        initialCount={likeCount}
        initialLiked={likedByMe}
        compact
      />
    </div>
  );
}
