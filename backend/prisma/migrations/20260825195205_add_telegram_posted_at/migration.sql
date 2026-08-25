-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "telegramPostedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "telegramPostedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "opinions" ADD COLUMN     "telegramPostedAt" TIMESTAMP(3);
