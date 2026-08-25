-- ============================================================================
--  Uchta kontent jadvalini (news / guides / opinions) bitta `posts` ga birlashtirish
--
--  Migratsiya QO'LDA yozilgan: `prisma migrate dev` bunday holatda jadvallarni
--  o'chirib qayta yaratadi va ma'lumot yo'qoladi. Bu yerda esa hamma yozuv
--  ko'chiriladi — maqolalar, ularning kategoriya/teg bog'lanishlari, izohlar
--  va like'lar.
--
--  Tartib muhim: avval yangi jadval to'ldiriladi, keyingina eskisi o'chiriladi.
-- ============================================================================

-- 1) Kontent turi -------------------------------------------------------------
CREATE TYPE "PostType" AS ENUM ('NEWS', 'GUIDE', 'OPINION');

-- 2) Yangi jadval -------------------------------------------------------------
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "telegramPostedAt" TIMESTAMP(3),
    "difficulty" "Difficulty",
    "readingMinutes" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- 3) Maqolalarni ko'chirish ---------------------------------------------------
-- id lar saqlanadi: izoh va like'lardagi havolalar shu bilan ishlab ketaveradi.
INSERT INTO "posts" (
    "id", "type", "title", "slug", "excerpt", "content", "featuredImage",
    "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
    "difficulty", "readingMinutes", "createdAt", "updatedAt", "authorId"
)
SELECT "id", 'NEWS', "title", "slug", "excerpt", "content", "featuredImage",
       "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
       NULL, "readingMinutes", "createdAt", "updatedAt", "authorId"
FROM "news";

INSERT INTO "posts" (
    "id", "type", "title", "slug", "excerpt", "content", "featuredImage",
    "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
    "difficulty", "readingMinutes", "createdAt", "updatedAt", "authorId"
)
SELECT "id", 'GUIDE', "title", "slug", "excerpt", "content", "featuredImage",
       "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
       "difficulty", "readingMinutes", "createdAt", "updatedAt", "authorId"
FROM "guides";

INSERT INTO "posts" (
    "id", "type", "title", "slug", "excerpt", "content", "featuredImage",
    "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
    "difficulty", "readingMinutes", "createdAt", "updatedAt", "authorId"
)
SELECT "id", 'OPINION', "title", "slug", "excerpt", "content", "featuredImage",
       "metaTitle", "metaDescription", "status", "publishedAt", "telegramPostedAt",
       NULL, "readingMinutes", "createdAt", "updatedAt", "authorId"
FROM "opinions";

-- 4) Kategoriya va teg bog'lanishlari ----------------------------------------
-- DIQQAT: Prisma m2m jadvalida ustunlar model nomining ALFAVIT tartibiga
-- qarab joylashadi, shuning uchun ikkalasida tartib har xil:
--   Category < News/Post  →  A = kategoriya, B = maqola
--   News/Post < Tag       →  A = maqola,     B = teg
-- Shu sababli quyida FK'lar ham har xil jadvalga ishora qiladi.
CREATE TABLE "_PostCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

INSERT INTO "_PostCategories" ("A", "B")
SELECT "A", "B" FROM "_NewsCategories"
UNION ALL SELECT "A", "B" FROM "_GuideCategories"
UNION ALL SELECT "A", "B" FROM "_OpinionCategories";

CREATE TABLE "_PostTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

INSERT INTO "_PostTags" ("A", "B")
SELECT "A", "B" FROM "_NewsTags"
UNION ALL SELECT "A", "B" FROM "_GuideTags"
UNION ALL SELECT "A", "B" FROM "_OpinionTags";

-- 5) Izohlar ------------------------------------------------------------------
ALTER TABLE "comments" ADD COLUMN "postId" TEXT;
UPDATE "comments" SET "postId" = COALESCE("newsId", "guideId", "opinionId");
-- Uchala havolasi ham bo'sh qolgan izoh bo'lsa (bo'lmasligi kerak) — u yetim,
-- NOT NULL qo'yishdan oldin tozalanadi.
DELETE FROM "comments" WHERE "postId" IS NULL;
ALTER TABLE "comments" ALTER COLUMN "postId" SET NOT NULL;
ALTER TABLE "comments" DROP COLUMN "newsId";
ALTER TABLE "comments" DROP COLUMN "guideId";
ALTER TABLE "comments" DROP COLUMN "opinionId";

-- 6) Like'lar -----------------------------------------------------------------
ALTER TABLE "likes" ADD COLUMN "postId" TEXT;
UPDATE "likes" SET "postId" = COALESCE("newsId", "guideId", "opinionId");
DELETE FROM "likes" WHERE "postId" IS NULL;
ALTER TABLE "likes" ALTER COLUMN "postId" SET NOT NULL;
ALTER TABLE "likes" DROP COLUMN "newsId";
ALTER TABLE "likes" DROP COLUMN "guideId";
ALTER TABLE "likes" DROP COLUMN "opinionId";

-- 7) Eski jadvallar -----------------------------------------------------------
DROP TABLE "_NewsCategories";
DROP TABLE "_NewsTags";
DROP TABLE "_GuideCategories";
DROP TABLE "_GuideTags";
DROP TABLE "_OpinionCategories";
DROP TABLE "_OpinionTags";
DROP TABLE "news";
DROP TABLE "guides";
DROP TABLE "opinions";

-- 8) Indekslar va cheklovlar --------------------------------------------------
CREATE UNIQUE INDEX "posts_type_slug_key" ON "posts"("type", "slug");
CREATE INDEX "posts_type_status_publishedAt_idx" ON "posts"("type", "status", "publishedAt");
CREATE INDEX "posts_status_publishedAt_idx" ON "posts"("status", "publishedAt");

CREATE UNIQUE INDEX "_PostCategories_AB_unique" ON "_PostCategories"("A", "B");
CREATE INDEX "_PostCategories_B_index" ON "_PostCategories"("B");
CREATE UNIQUE INDEX "_PostTags_AB_unique" ON "_PostTags"("A", "B");
CREATE INDEX "_PostTags_B_index" ON "_PostTags"("B");

CREATE INDEX "comments_postId_idx" ON "comments"("postId");
CREATE INDEX "likes_postId_idx" ON "likes"("postId");
CREATE UNIQUE INDEX "likes_userId_postId_key" ON "likes"("userId", "postId");

ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_A_fkey"
    FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_B_fkey"
    FOREIGN KEY ("B") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Teglarda tartib teskari: A = maqola, B = teg (Post < Tag).
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_A_fkey"
    FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_B_fkey"
    FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
