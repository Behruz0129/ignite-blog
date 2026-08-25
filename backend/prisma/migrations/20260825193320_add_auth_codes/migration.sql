-- DropIndex
DROP INDEX "comments_content_trgm_idx";

-- DropIndex
DROP INDEX "guides_excerpt_trgm_idx";

-- DropIndex
DROP INDEX "guides_title_trgm_idx";

-- DropIndex
DROP INDEX "news_excerpt_trgm_idx";

-- DropIndex
DROP INDEX "news_title_trgm_idx";

-- DropIndex
DROP INDEX "opinions_excerpt_trgm_idx";

-- DropIndex
DROP INDEX "opinions_title_trgm_idx";

-- CreateTable
CREATE TABLE "auth_codes" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_codes_codeHash_key" ON "auth_codes"("codeHash");

-- CreateIndex
CREATE INDEX "auth_codes_userId_idx" ON "auth_codes"("userId");

-- AddForeignKey
ALTER TABLE "auth_codes" ADD CONSTRAINT "auth_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
