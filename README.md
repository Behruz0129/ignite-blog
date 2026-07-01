# 🔥 Ignite Blog — Gaming Blog CMS

Tens of thousands of visitors va minglab maqolalar uchun mo'ljallangan,
**ishlab chiqarishga tayyor** gaming blog kontent boshqaruv tizimi (CMS).

Loyiha ikki qismdan iborat:

| Qism | Texnologiya | Vazifa |
|------|-------------|--------|
| **`backend/`** | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Cloudinary, Zod, Swagger | REST API |
| **`admin/`** | Next.js (App Router), TypeScript, TailwindCSS, Tiptap | Boshqaruv paneli |

> Frontend ( commit sayt) keyinroq quriladi va shu API'ni iste'mol qiladi.

---

## ✨ Imkoniyatlar

- **Kontent**: Yangiliklar (News), Qo'llanmalar (Guides), Maqolalar (Opinions)
- **Tasniflash**: Kategoriyalar, Teglar (ko'pdan-ko'p bog'lanish)
- **Izohlar**: moderatsiya (Tasdiqlash / Rad etish / O'chirish)
- **Media kutubxona**: Cloudinary'ga yuklash, qayta ishlatish, URL nusxalash, o'chirish
- **Tiptap muharrir**: sarlavhalar, ro'yxatlar, jadvallar, rasmlar, havolalar, kod bloklari, iqtiboslar
- **SEO**: meta title/description, OG image (featured image), avtomatik slug
- **Auth**: JWT, bcrypt, himoyalangan admin route'lar, rollar (ADMIN/EDITOR)
- **API**: pagination, qidiruv, filter, saralash; Swagger hujjat (`/api/docs`)
- **Xavfsizlik**: Helmet, CORS, rate limiting, Zod validatsiya
- **Dashboard**: statistika (jami news/guides/opinions/comments)

---

## 🚀 Lokalda ishga tushirish

### 0. Talablar
- **Node.js 20+**
- **PostgreSQL** (lokal yoki Docker)
- **Cloudinary** akkaunti (media uchun; ixtiyoriy, lekin rasm yuklash uchun kerak)

### 1. PostgreSQL (Docker bilan eng oson)

```bash
docker run --name ignite-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ignite_blog -p 5432:5432 -d postgres:16
```

> Docker ishlatmasangiz, `docs/DEPLOYMENT.md` da PostgreSQL'ni qo'lda o'rnatish ko'rsatilgan.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # so'ng .env ni tahrirlang (DATABASE_URL, JWT_SECRET, CLOUDINARY_*)
npm run prisma:generate
npm run prisma:migrate -- --name init   # jadvallarni yaratadi
npm run seed                # birinchi admin + namunaviy kategoriya/teglar
npm run dev                 # http://localhost:5000
```

API hujjat: **http://localhost:5000/api/docs**

Standart admin (`.env` dan):
- Email: `admin@igniteblog.com`
- Parol: `Admin12345!`

### 3. Admin panel

Yangi terminalda:

```bash
cd admin
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL ni tekshiring
npm run dev                        # http://localhost:3000
```

Brauzerda **http://localhost:3000** ni oching va yuqoridagi admin bilan kiring.

---

## 📁 Papka tuzilishi

```
IGNITE BLOG/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # baza modellari
│   │   └── seed.ts              # birinchi admin + boshlang'ich ma'lumot
│   ├── src/
│   │   ├── config/              # env, prisma, cloudinary, swagger, logger
│   │   ├── controllers/         # HTTP qatlam (so'rov → service → javob)
│   │   ├── services/            # biznes logika
│   │   ├── routes/              # endpoint'lar (+ Swagger izohlari)
│   │   ├── middlewares/         # auth, validate, error, rateLimit, upload
│   │   ├── validators/          # Zod sxemalari
│   │   ├── utils/               # slugify, pagination, AppError, token ...
│   │   ├── app.ts               # Express ilovasi
│   │   └── server.ts            # ishga tushirish nuqtasi
│   ├── ecosystem.config.js      # PM2 (production)
│   └── .env.example
│
├── admin/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/                  # kirish sahifasi
│   │   │   └── (dashboard)/            # himoyalangan sahifalar (sidebar bilan)
│   │   │       ├── dashboard/          # statistika
│   │   │       ├── news/ guides/ opinions/   # CRUD (list, new, [id])
│   │   │       ├── categories/ tags/   # tasniflash
│   │   │       ├── comments/           # moderatsiya
│   │   │       └── media/              # media kutubxona
│   │   ├── components/          # Editor (Tiptap), ContentForm, ContentList ...
│   │   └── lib/                 # api client, auth, types, config
│   ├── ecosystem.config.js
│   └── .env.local.example
│
└── docs/
    ├── DEPLOYMENT.md            # to'liq VPS deploy qo'llanmasi (o'zbekcha)
    └── nginx/                   # Nginx namuna konfiguratsiyalari
```

---

## 🔌 Asosiy API endpointlar

### Public (token shart emas)
| Metod | Manzil | Tavsif |
|-------|--------|--------|
| GET | `/api/news` | Yangiliklar ro'yxati (chop etilgan) |
| GET | `/api/news/:slug` | Bitta yangilik |
| GET | `/api/guides` , `/api/guides/:slug` | Qo'llanmalar |
| GET | `/api/opinions` , `/api/opinions/:slug` | Maqolalar |
| GET | `/api/categories` , `/api/tags` | Tasniflash |
| POST | `/api/comments` | Izoh qoldirish |
| POST | `/api/auth/login` | Kirish (token oladi) |

**Query parametrlar** (ro'yxatlar uchun): `?page=1&limit=10&search=...&category=slug&tag=slug&sort=publishedAt&order=desc`

### Admin (JWT kerak: `Authorization: Bearer <token>`)
| Metod | Manzil | Tavsif |
|-------|--------|--------|
| GET | `/api/dashboard/stats` | Statistika |
| GET | `/api/news/admin/all` | Barcha (qoralama + chop etilgan) |
| POST/PUT/DELETE | `/api/news/...` | CRUD (guides, opinions ham xuddi shunday) |
| PATCH | `/api/news/:id/publish` `/unpublish` | Holatni o'zgartirish |
| POST/PUT/DELETE | `/api/categories`, `/api/tags` | Tasniflash CRUD |
| GET/PATCH/DELETE | `/api/comments` | Izoh moderatsiyasi |
| POST/GET/DELETE | `/api/media` | Media boshqaruvi |

To'liq hujjat: `/api/docs` (Swagger UI).

---

## 🌐 Deploy

Ubuntu VPS (Hetzner) ga noldan deploy qilish — to'liq, buyruqlar bilan
tushuntirilgan qo'llanma: **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**

O'z ichiga oladi: server tayyorlash, PostgreSQL, PM2, Nginx, domen ulash,
Let's Encrypt SSL.

---

## 🔐 Xavfsizlik bo'yicha eslatma

- `.env` fayllarini **hech qachon** git'ga qo'shmang (ular `.gitignore` da).
- Production'da `JWT_SECRET` ni uzun va tasodifiy qiymatga o'zgartiring.
- Standart admin parolini birinchi kirishdan keyin o'zgartiring.
```
