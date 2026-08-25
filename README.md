# 🔥 Ignite Blog — Gaming Blog CMS

O'n minglab tashrifchi va minglab maqola uchun mo'ljallangan gaming blog
kontent boshqaruv tizimi.

| Qism | Port | Texnologiya | Vazifa |
|------|------|-------------|--------|
| **`backend/`** | 5000 | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Cloudinary, Zod, Swagger | REST API |
| **`admin/`** | 3000 | Next.js (App Router), TypeScript, TailwindCSS, Tiptap | Boshqaruv paneli |
| **`frontend/`** | 3001 | Next.js (App Router), TailwindCSS, ISR | Public sayt |

---

## ✨ Imkoniyatlar

- **Kontent**: Yangiliklar (News), Qo'llanmalar (Guides), Maqolalar (Opinions)
- **Tasniflash**: Kategoriyalar, Teglar (ko'pdan-ko'p bog'lanish)
- **Izohlar**: mehmon izohlari moderatsiyadan o'tadi, ro'yxatdan o'tgan
  foydalanuvchiniki darhol chiqadi
- **Like**: ro'yxatdan o'tgan foydalanuvchi uchun (har kontentga bir marta)
- **Media kutubxona**: Cloudinary'ga yuklash, qayta ishlatish, o'chirish
- **Tiptap muharrir**: sarlavhalar, ro'yxatlar, jadvallar, rasmlar, havolalar,
  kod bloklari, iqtiboslar. HTML **serverda sanitizatsiya qilinadi**.
- **SEO**: meta title/description, OG image, avtomatik slug (kirill → lotin),
  `sitemap.xml`, `robots.txt`, ISR
- **Auth**: JWT (access + refresh, rotatsiya bilan), email tasdiqlash, parol
  tiklash, Google / Discord OAuth, Telegram Login Widget
- **Rollar**: `SUPER_ADMIN` (foydalanuvchilarni boshqaradi), `ADMIN`
  (kontent + moderatsiya + media), `USER` (izoh va like)
- **API**: pagination, qidiruv, filter, saralash; Swagger hujjat (`/api/docs`)
- **Xavfsizlik**: Helmet, CORS, rate limiting (o'qish/yozuv alohida), Zod
  validatsiya, HTML sanitizatsiya, tokenlar bazada hash holida
- **Ishlash**: public GET'larda `Cache-Control`, ro'yxat javoblarida maqola
  matni yubormaydi, qidiruv uchun `pg_trgm` indekslari

---

## 🚀 Lokalda ishga tushirish

### 0. Talablar

- **Node.js 20+**
- **PostgreSQL 14+** (lokal yoki Docker)
- Cloudinary akkaunti — ixtiyoriy, faqat rasm yuklash uchun

### 1. PostgreSQL

Docker bilan:

```bash
docker run --name ignite-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ignite_blog -p 5432:5432 -d postgres:16
```

Docker ishlatmasangiz, PostgreSQL'ni to'g'ridan-to'g'ri o'rnating
(Windows'da `winget install PostgreSQL.PostgreSQL.17`) va `ignite_blog`
nomli baza yarating. Qo'shimcha variantlar: `docs/DEPLOYMENT.md`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:deploy
npm run seed
npm run dev
```

`.env` da **majburiy**: `DATABASE_URL`, `JWT_SECRET`. Qolganlari ixtiyoriy —
to'ldirilmasa, tegishli imkoniyat o'chiq bo'ladi (masalan `RESEND_API_KEY`
bo'lmasa, development'da tasdiqlash havolasi **konsolga** chiqadi).

API hujjat: **http://localhost:5000/api/docs**

Standart admin (`.env` dagi `ADMIN_*` dan):
`admin@igniteblog.com` / `Admin12345!`

### 3. Admin panel

```bash
cd admin
npm install
cp .env.local.example .env.local
npm run dev
```

### 4. Public sayt

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## 🧪 Sifat tekshiruvlari

Har uchala paketda bir xil skriptlar:

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

`npm test` hozircha faqat `backend/` da (Vitest). CI
(`.github/workflows/ci.yml`) har push va PR'da lint + typecheck + test +
build ni uchala paket uchun ishga tushiradi.

---

## 📁 Papka tuzilishi

```
ignite-blog/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # baza modellari
│   │   ├── migrations/          # SQL migratsiyalar
│   │   └── seed.ts              # birinchi admin + boshlang'ich ma'lumot
│   ├── src/
│   │   ├── config/              # env, prisma, cloudinary, passport, swagger, logger
│   │   ├── controllers/         # HTTP qatlam (so'rov → service → javob)
│   │   ├── services/            # biznes logika
│   │   ├── routes/              # endpoint'lar (+ Swagger izohlari)
│   │   ├── middlewares/         # auth, validate, error, rateLimit, cache, upload
│   │   ├── validators/          # Zod sxemalari
│   │   ├── utils/               # slugify, sanitizeContent, token, pagination ...
│   │   │   └── __tests__/       # Vitest testlari
│   │   ├── app.ts               # Express ilovasi
│   │   └── server.ts            # ishga tushirish nuqtasi
│   └── .env.example
│
├── admin/                       # boshqaruv paneli (Next.js)
│   └── src/
│       ├── app/(dashboard)/     # himoyalangan sahifalar
│       ├── components/          # Editor (Tiptap), ContentForm, MediaPicker ...
│       └── lib/                 # api client (avtomatik token yangilash), auth, types
│
├── frontend/                    # public sayt (Next.js, ISR)
│   └── src/
│       ├── app/                 # bosh sahifa, news/guides/opinions, auth sahifalari
│       ├── components/          # ArticleCard, ContentArticle, CommentSection ...
│       └── lib/                 # api client, auth-client, metadata
│
├── docs/
│   ├── DEPLOYMENT.md            # VPS deploy qo'llanmasi
│   └── nginx/                   # Nginx namuna konfiguratsiyalari
└── render.yaml                  # Render.com blueprint (backend uchun)
```

---

## 🔌 Asosiy API endpointlar

### Public (token shart emas)

| Metod | Manzil | Tavsif |
|-------|--------|--------|
| GET | `/api/news` | Yangiliklar ro'yxati (chop etilgan) |
| GET | `/api/news/:slug` | Bitta yangilik (+ eng so'nggi 50 izoh) |
| GET | `/api/guides`, `/api/guides/:slug` | Qo'llanmalar |
| GET | `/api/opinions`, `/api/opinions/:slug` | Maqolalar |
| GET | `/api/categories`, `/api/tags` | Tasniflash |
| POST | `/api/comments` | Izoh qoldirish |
| POST | `/api/auth/register` `/login` `/refresh` | Auth |
| POST | `/api/auth/verify-email` `/forgot-password` `/reset-password` | Email oqimlari |
| POST | `/api/auth/telegram` | Telegram Login Widget |
| GET | `/api/auth/google` `/api/auth/discord` | OAuth |

**Query parametrlar** (ro'yxatlar uchun):
`?page=1&limit=10&search=...&category=slug&tag=slug&sort=publishedAt&order=desc`

> Eslatma: ro'yxat endpointlari maqola **matnini qaytarmaydi** — u faqat
> bitta yozuv so'ralganda keladi. O'qish vaqti `readingMinutes` maydonida.

### Auth kerak

| Metod | Manzil | Rol |
|-------|--------|-----|
| GET | `/api/auth/me` | har qanday |
| POST | `/api/likes/toggle` | har qanday |
| DELETE | `/api/comments/:id` | o'z izohi (yoki admin) |
| GET | `/api/dashboard/stats` | ADMIN+ |
| GET | `/api/news/admin/all`, `/api/news/admin/:id` | ADMIN+ |
| POST/PUT/DELETE | `/api/news/...` (guides, opinions ham) | ADMIN+ |
| PATCH | `/api/news/:id/publish` `/unpublish` | ADMIN+ |
| POST/PUT/DELETE | `/api/categories`, `/api/tags` | ADMIN+ |
| GET/PATCH | `/api/comments` | ADMIN+ |
| POST/GET/DELETE | `/api/media` | ADMIN+ |
| GET/POST/PATCH/DELETE | `/api/users` | SUPER_ADMIN |

To'liq hujjat: `/api/docs` (Swagger UI).

---

## 🌐 Deploy

- **Backend** → Render (`render.yaml` blueprint tayyor) yoki Ubuntu VPS
  (`docs/DEPLOYMENT.md` — PM2, Nginx, Let's Encrypt bilan to'liq qo'llanma)
- **Admin va public sayt** → Vercel (yoki xuddi shu VPS)
- **Baza** → Neon / Supabase / o'z PostgreSQL'ingiz

Deploydan keyin `npm run prisma:deploy` migratsiyalarni qo'llaydi.

### Muhim production sozlamalari

| O'zgaruvchi | Nega kerak |
|---|---|
| `JWT_SECRET` | Uzun, tasodifiy qiymat |
| `CORS_ORIGIN` | Admin va public sayt manzillari, vergul bilan |
| `FRONTEND_URL` | Email havolalari va OAuth redirect shunga quriladi |
| `OAUTH_CALLBACK_BASE` | Backend'ning ommaviy manzili |
| `RESEND_API_KEY` | Busiz ro'yxatdan o'tish va parol tiklash **ishlamaydi** |
| `INTERNAL_API_TOKEN` | Backend va frontend'da **bir xil** bo'lishi kerak — busiz public saytning barcha SSR so'rovlari bitta IP sifatida rate limitga uriladi |

---

## 🔐 Xavfsizlik bo'yicha eslatma

- `.env` fayllarini **hech qachon** git'ga qo'shmang (ular `.gitignore` da)
- Production'da `JWT_SECRET` ni uzun va tasodifiy qiymatga o'zgartiring
- Standart admin parolini birinchi kirishdan keyin o'zgartiring
- Email tasdiqlash va parol tiklash tokenlari bazada sha256 hash holida
  saqlanadi — baza sizib chiqsa ham ulardan foydalanib bo'lmaydi
