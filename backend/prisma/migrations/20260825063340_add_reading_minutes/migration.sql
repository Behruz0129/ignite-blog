-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "readingMinutes" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "readingMinutes" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "opinions" ADD COLUMN     "readingMinutes" INTEGER NOT NULL DEFAULT 1;

-- Mavjud yozuvlar uchun qiymatni to'ldiramiz (default 1 bo'lib qolmasligi uchun).
-- Mantiq utils/readingTime.ts bilan bir xil: HTML teglarni olib tashlab,
-- so'zlarni sanaymiz va 200 so'z/daqiqaga bo'lamiz.
UPDATE "news" SET "readingMinutes" = GREATEST(1, ROUND(
  COALESCE(array_length(regexp_split_to_array(trim(regexp_replace("content", '<[^>]*>', ' ', 'g')), '\s+'), 1), 0)::numeric / 200
))::int;

UPDATE "guides" SET "readingMinutes" = GREATEST(1, ROUND(
  COALESCE(array_length(regexp_split_to_array(trim(regexp_replace("content", '<[^>]*>', ' ', 'g')), '\s+'), 1), 0)::numeric / 200
))::int;

UPDATE "opinions" SET "readingMinutes" = GREATEST(1, ROUND(
  COALESCE(array_length(regexp_split_to_array(trim(regexp_replace("content", '<[^>]*>', ' ', 'g')), '\s+'), 1), 0)::numeric / 200
))::int;
