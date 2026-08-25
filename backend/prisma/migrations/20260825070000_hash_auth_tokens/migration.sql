-- Email tasdiqlash va parol tiklash tokenlari endi bazaga sha256 hash
-- ko'rinishida yoziladi (auth.service.ts). Eskilari OCHIQ matn edi va
-- endi hech qachon mos kelmaydi — ularni butunlay tozalaymiz, toki
-- bazada ishlaydigan maxfiy qiymat qolmasin.
--
-- Ta'siri: shu daqiqada kutilayotgan tasdiqlash/tiklash havolalari
-- bekor bo'ladi. Foydalanuvchi "qayta yuborish" orqali yangisini oladi.
UPDATE "users"
SET "emailVerificationToken" = NULL,
    "emailVerificationExpires" = NULL
WHERE "emailVerificationToken" IS NOT NULL;

UPDATE "users"
SET "passwordResetToken" = NULL,
    "passwordResetExpires" = NULL
WHERE "passwordResetToken" IS NOT NULL;
