-- ============================================================
--  Rollar, professional auth, like va komment tizimi migratsiyasi
--  Eski ma'lumot saqlanadi: ADMIN -> SUPER_ADMIN, EDITOR -> ADMIN
-- ============================================================

-- 1) Role enum'ni xavfsiz qayta yaratish (mavjud qiymatlarni ko'chirib)
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING (
  CASE "role"::text
    WHEN 'ADMIN' THEN 'SUPER_ADMIN'::"Role"
    WHEN 'EDITOR' THEN 'ADMIN'::"Role"
    ELSE 'USER'::"Role"
  END
);
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "Role_old";

-- 2) AuthProvider enum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'DISCORD');

-- 3) users jadvaliga yangi maydonlar
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN "discordId" TEXT;
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- 4) comments: ghost uchun ism/email ixtiyoriy + ro'yxatdan o'tgan user bog'lanishi
ALTER TABLE "comments" ALTER COLUMN "authorName" DROP NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "authorEmail" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "userId" TEXT;
CREATE INDEX "comments_userId_idx" ON "comments"("userId");
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5) refresh_tokens jadvali
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6) likes jadvali
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newsId" TEXT,
    "guideId" TEXT,
    "opinionId" TEXT,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "likes_userId_idx" ON "likes"("userId");
CREATE UNIQUE INDEX "likes_userId_newsId_key" ON "likes"("userId", "newsId");
CREATE UNIQUE INDEX "likes_userId_guideId_key" ON "likes"("userId", "guideId");
CREATE UNIQUE INDEX "likes_userId_opinionId_key" ON "likes"("userId", "opinionId");
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_newsId_fkey"
  FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_guideId_fkey"
  FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_opinionId_fkey"
  FOREIGN KEY ("opinionId") REFERENCES "opinions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
