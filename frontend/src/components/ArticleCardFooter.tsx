"use client";

import LikeButton from "./LikeButton";

interface Props {
  contentId: string;
  likeCount?: number;
  likedByMe?: boolean;
}

export default function ArticleCardFooter({
  contentId,
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
        initialCount={likeCount}
        initialLiked={likedByMe}
        compact
      />
    </div>
  );
}
