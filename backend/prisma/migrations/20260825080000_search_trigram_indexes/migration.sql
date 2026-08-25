-- QIDIRUV INDEKSLARI
--
-- Qidiruv `contains` + `mode: insensitive` orqali amalga oshiriladi, ya'ni
-- PostgreSQL'da ILIKE '%so'z%' ga aylanadi. Bunday shablon oddiy B-tree
-- indeksdan foydalana olmaydi — baza har safar butun jadvalni to'liq
-- skanerlaydi. Bir necha ming maqolada bu sezilarli sekinlashuv.
--
-- pg_trgm kengaytmasi matnni uch harfli bo'laklarga ("trigramma") ajratadi
-- va GIN indeks orqali ILIKE '%...%' ni ham tezlashtira oladi.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- News
CREATE INDEX IF NOT EXISTS "news_title_trgm_idx"
  ON "news" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "news_excerpt_trgm_idx"
  ON "news" USING GIN ("excerpt" gin_trgm_ops);

-- Guides
CREATE INDEX IF NOT EXISTS "guides_title_trgm_idx"
  ON "guides" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "guides_excerpt_trgm_idx"
  ON "guides" USING GIN ("excerpt" gin_trgm_ops);

-- Opinions
CREATE INDEX IF NOT EXISTS "opinions_title_trgm_idx"
  ON "opinions" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "opinions_excerpt_trgm_idx"
  ON "opinions" USING GIN ("excerpt" gin_trgm_ops);

-- Admin panelidagi izoh qidiruvi ham xuddi shu muammoga ega
CREATE INDEX IF NOT EXISTS "comments_content_trgm_idx"
  ON "comments" USING GIN ("content" gin_trgm_ops);
