-- Foydali havolalar bo'limi.
-- `group` ataylab enum emas: yangi guruh qo'shish uchun migratsiya kerak
-- bo'lmasin (masalan "Asboblar", "YouTube kanallar", "Saytlar").

CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "image" TEXT,
    "group" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "resources_status_order_idx" ON "resources"("status", "order");
