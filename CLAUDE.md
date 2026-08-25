# Ignite Blog — gaming blog CMS

Uch qismli tizim: **backend** (REST API), **admin** (boshqaruv paneli),
**frontend** (ommaviy sayt). Ikkalasi ham Next.js, backend Express+Prisma.

**Bu fayl faqat o'zgarmas qoidalar, joriy holat va kelishuvlar uchun.**
Qolgani: `README.md` (o'rnatish, API), `docs/DEPLOYMENT.md` (VPS deploy).

---

## 1. Jonli tizim (2026-08-25 holatiga)

| Nima | Manzil | Qayerda |
|---|---|---|
| Ommaviy sayt | **ignite.uz** | Vercel loyihasi `ignite-daily` (`frontend/`) |
| Adminka | **admin.ignite.uz** | Vercel loyihasi `ignite-blog` (`admin/`) |
| API | `ignite-api-7qhs.onrender.com/api` | Render (`backend/`), free plan |
| Baza | PostgreSQL | Neon |
| Rasmlar | Cloudinary | papka: `ignite-blog` |
| DNS | Cloudflare | `vera.ns` / `mack.ns`, akkaunt behruzberdiyev518@ |

**Ikkala Vercel loyihasi ham bitta repodan** (`Behruz0129/ignite-blog`) deploy
bo'ladi — `main`ga push qilinganda ikkalasi ham qayta quriladi.

Cloudflare DNS holati:

- `ignite.uz` → A 216.150.1.1 (Vercel), **DNS only** (kulrang bulut)
- `www` → CNAME Vercel, **DNS only**
- `admin` → CNAME Vercel, **Proxied** (turuncha)
- SSL/TLS rejimi: **Full**

Apex va admin ataylab emas, tarixan turlicha sozlangan (§4 ga qarang).
Render free plan 15 daqiqa harakatsizlikdan keyin uxlaydi — birinchi so'rov
30–60 soniya kutishi mumkin.

---

## 2. Buzilmaydigan qoidalar

**Rollar uch bosqichli.** `SUPER_ADMIN` (foydalanuvchilarni ham boshqaradi) →
`ADMIN` (kontent, moderatsiya, media) → `USER` (izoh va like). Foydalanuvchi
boshqaruvi (`/api/users`) faqat SUPER_ADMIN'da.

**Kontent uch turli**: News, Guides, Opinions. Uchalasi bir xil naqsh bo'yicha
ishlaydi (slug, status, kategoriya, teglar, like, izoh) — biriga o'zgartirish
kiritilsa, odatda uchalasiga ham kerak.

**HTML har doim serverda sanitizatsiya qilinadi**
(`backend/src/utils/sanitizeContent.ts`). Tiptap muharriridan kelgan HTML'ga
ishonilmaydi — bu XSS'ga qarshi yagona to'siq.

**Ro'yxat endpointlari maqola matnini qaytarmaydi.** Faqat bitta yozuv
so'ralganda keladi. Buzilса ro'yxat javoblari o'nlab barobar og'irlashadi.

**Auth tokenlari bazada hash holida saqlanadi** (`RefreshToken` modeli),
access+refresh rotatsiya bilan. Admin client tokenni avtomatik yangilaydi
(`admin/src/lib/api.ts`).

**Slug kirill→lotin o'giriladi** (`backend/src/utils/slugify.ts`).

**`.env*` va ularning `.bak` nusxalari hech qachon commit qilinmaydi.**
`.gitignore`da `*.bak` va `**/.env*.bak` bor — ular `DATABASE_URL`,
`JWT_SECRET`, `CLOUDINARY_API_SECRET`, `ADMIN_PASSWORD` saqlaydi.

**Til:** butun UI va izohlar o'zbekcha, **faqat lotin alifbosida** — kirill
harflari aralashmasin.

**`INTERNAL_API_TOKEN`** frontend (Vercel) va backend (Render) da **aynan bir
xil** bo'lishi shart. U SSR so'rovlarini rate limitdan chiqaradi; mos
kelmasa butun ommaviy sayt bitta IP sifatida limitga uriladi.

---

## 3. Ishlash kelishuvlari

- **Portlar:** backend 5000, admin 3000, frontend 3001.
- **Tekshiruv:** har uchala paketda `npm run lint`, `npm run typecheck`,
  backend'da qo'shimcha `npm test` (Vitest, hozir 37 ta test).
  CI (`.github/workflows/ci.yml`) har push va PR'da hammasini ishga tushiradi.
- **Migratsiya:** `npm run prisma:migrate` (lokal), prodda `prisma:deploy`.
- **Boshqa sessiyadan keyin** avval `git pull`, so'ng **`npm install`** —
  yangi paketlar kelgan bo'lishi mumkin (bir marta `sanitize-html` va
  `vitest` o'rnatilmagani uchun typecheck va testlar yiqilgan edi).
- Render'ga `NODE_ENV=production` bilan build qilinganda devDependencies
  o'rnatilmaydi va TypeScript build yiqiladi — shuning uchun `render.yaml`da
  `NPM_CONFIG_PRODUCTION=false` va `NPM_CONFIG_INCLUDE=dev` turadi. Tegilmasin.

---

## 4. Ochiq masalalar

Bular hali hal qilinmagan — navbatdagi sessiya shu ro'yxatdan davom etsin.

1. ~~Pochta~~ — **kerak emas** (2026-08-25 qarori). `MX`, `SPF`, `ftp` va
   `mail` yozuvlari eski hostingdan qolgan va ishlamaydi; ular shunchaki
   ortiqcha, zarari yo'q. Kelajakda domen pochtasi kerak bo'lsa, o'shanda
   noldan sozlanadi.
2. **Apex va admin turlicha sozlangan**: `ignite.uz` DNS only, `admin`
   proxied. Ikkalasi ham ishlaydi; bir xil qilish shart emas, lekin bilib
   qo'yish kerak (Cloudflare "origin IP ochiq" deb ogohlantiradi).
3. **`api.ignite.uz` subdomeni yo'q** — backend hali Render'ning uzun
   manzilida. Qilish tartibi (tartib muhim, aks holda Render domenni
   tasdiqlay olmaydi):
   1. Render → servis → Settings → Custom Domain → `api.ignite.uz`;
   2. Cloudflare → DNS → CNAME `api` → `ignite-api-7qhs.onrender.com`,
      **DNS only** (proxy yoqilsa Render sertifikat ololmaydi);
   3. Render env: `OAUTH_CALLBACK_BASE=https://api.ignite.uz`,
      `CORS_ORIGIN` ro'yxatini tekshirish;
   4. Vercel (ikkala loyiha): `NEXT_PUBLIC_API_URL=https://api.ignite.uz/api`,
      so'ng qayta deploy.

   To'siq: Render dashboard'iga brauzerda kirilmagan.
4. **Render free plan** — uyquga ketadi. Ommaviy sayt ISR bilan qutuladi,
   lekin adminkaga birinchi kirish sekin.
5. **Kontentni egasi o'zi yozadi** — maqolalarni men kiritmayman.

---

## 5. O'zgarishlar tarixi

Faqat yo'nalishni tushuntiradigan qadamlar; to'liq tarix `git log`da.

**2026-08-25 — adminka dizayni merge qilindi.**
Boshqa sessiyada `main`ga beshta commit tushgan edi (bug fix, HTML
sanitizatsiya, token hash, kesh va limitlar, lint/test/CI). Lokalda esa hali
push qilinmagan adminka dizayni turardi — u `admin-redesign` branchiga
yig'ilib, `main` ustiga merge qilindi. Ikki konflikt:

- `LikeButton.tsx` — ikkala tarafda bir xil hydration bug'i (`<a>` ichida
  `<a>`) tuzatilgan edi; `main`niki tozaroq bo'lgani uchun o'sha qoldi.
- `render.yaml` — `main`niki asos, admin tarafidan manzil misollari olindi.

Shu bilan birga `.env.bak` fayllari `.gitignore`ga qo'shildi: ular sirlarni
saqlaydi va `git add -A` bilan repoga tushib ketishi mumkin edi.

Merge'dan keyin: backend typecheck + 37 test, admin build, frontend
typecheck + build — hammasi toza.

Merge'dan keyin `main`ga push qilindi (`26f3879`). Ikkala Vercel loyihasi ham
shu commitdan qayta qurildi va **Ready**: adminka 31s, ommaviy sayt 24s.
admin.ignite.uz endi yangi dizaynda ochiladi.

Eslatma: `npm install` ikkala Next paketining `package-lock.json` faylidan
Linux'ga xos yozuvlarni (`libc` maydonlari, `@emnapi/*` kabi optional
paketlar) o'chirib yuboradi — Windows'da o'rnatilgani uchun. Bu o'zgarish
commit qilinmadi va **bundan keyin ham qilinmasin**: Render va Vercel Linux'da
build qiladi.

**2026-08-25 — muharrir blog yozishga moslandi.**
Adminka muharririga uch narsa qo'shildi: qator boshidagi `/` orqali blok
tanlash menyusi (klaviatura bilan, nom bo'yicha filtr), rasmni Ctrl+V yoki
sudrab tashlash bilan to'g'ridan-to'g'ri Cloudinary'ga yuklash, va yozilayotgan
matnning brauzerdagi avtomatik zaxirasi (`src/lib/draft.ts`) — oyna yopilib
ketsa "tiklash" satri chiqadi. Qo'shimcha: underline, highlight, tekislash,
YouTube bloki.

Muharrir qismlari: `admin/src/components/Editor.tsx` (asosiy),
`admin/src/components/editor/slash-command.ts` (`/` menyusi mantiqi),
`admin/src/components/editor/SlashList.tsx` (menyu ko'rinishi).
Yangi blok qo'shish kerak bo'lsa — `slash-command.ts` dagi `buildItems`.
