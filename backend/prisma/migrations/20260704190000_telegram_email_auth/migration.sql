-- Telegram auth, email tasdiqlash va parol tiklash maydonlari

ALTER TYPE "AuthProvider" ADD VALUE 'TELEGRAM';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_telegramId_key" ON "users"("telegramId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_emailVerificationToken_key" ON "users"("emailVerificationToken");
CREATE UNIQUE INDEX IF NOT EXISTS "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- Mavjud admin va OAuth userlar emailVerified=true
UPDATE "users" SET "emailVerified" = true WHERE "role" IN ('SUPER_ADMIN', 'ADMIN');
UPDATE "users" SET "emailVerified" = true WHERE "provider" IN ('GOOGLE', 'DISCORD');
