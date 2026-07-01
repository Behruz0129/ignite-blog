# 🚀 Ignite Blog — To'liq Deployment Qo'llanmasi (Boshlovchilar uchun)

Bu qo'llanma sizni **noldan** boshlab loyihani Ubuntu VPS (masalan Hetzner) ga
joylashtirishgacha olib boradi. Har bir buyruq **alohida** va **tushuntirish bilan**
berilgan. Buyruqlarni ketma-ket bajaring.

> **Eslatma:** `igniteblog.com` ni o'z domeningizga, `api.igniteblog.com` va
> `admin.igniteblog.com` ni o'zingiznikiga moslab almashtiring.

## Mundarija

1. [Arxitektura — nima qayerda ishlaydi](#1-arxitektura)
2. [Ubuntu server tayyorlash](#2-ubuntu-server-tayyorlash)
3. [PostgreSQL o'rnatish](#3-postgresql-ornatish)
4. [Loyihani serverga olish va sozlash](#4-loyihani-serverga-olish)
5. [PM2 bilan ishga tushirish](#5-pm2-bilan-ishga-tushirish)
6. [Nginx reverse proxy](#6-nginx-reverse-proxy)
7. [Domen ulash (DNS)](#7-domen-ulash)
8. [SSL (HTTPS) — Let's Encrypt](#8-ssl-https-lets-encrypt)
9. [Yangilanishlarni chiqarish (deploy qilish)](#9-yangilanish-chiqarish)
10. [Muammolarni bartaraf etish](#10-muammolar)

---

## 1. Arxitektura

```
                 Internet (foydalanuvchi)
                          │
                          ▼
                     ┌─────────┐
                     │  Nginx  │  (80/443 portlar, SSL)
                     └────┬────┘
              ┌───────────┴───────────┐
              ▼                       ▼
   api.igniteblog.com        admin.igniteblog.com
     (Backend :5000)            (Next.js :3000)
              │
              ▼
        PostgreSQL :5432
```

- **Backend (Express)** — `5000` portda ishlaydi, faqat ichkarida.
- **Admin (Next.js)** — `3000` portda ishlaydi, faqat ichkarida.
- **Nginx** — tashqaridan kelgan so'rovlarni to'g'ri ilovaga yo'naltiradi
  va HTTPS bilan himoyalaydi.
- **PM2** — ilovalarni doimiy ishlatib turadi.

---

## 2. Ubuntu server tayyorlash

> Hetzner / DigitalOcean / boshqa joydan **Ubuntu 22.04 (yoki 24.04)** li
> server (VPS) yarating. Sizga server IP manzili va `root` paroli beriladi.

### 2.1. Serverga SSH orqali kirish

O'z kompyuteringiz terminalida (IP ni o'zingiznikiga almashtiring):

```bash
ssh root@123.45.67.89
```

Bu — serverga masofadan ulanish. Birinchi marta `yes` deb tasdiqlang va
parolni kiriting.

### 2.2. Tizimni yangilash

```bash
apt update && apt upgrade -y
```

`apt update` — paketlar ro'yxatini yangilaydi.
`apt upgrade -y` — o'rnatilgan paketlarni eng yangi versiyaga ko'taradi
(`-y` = barcha savollarga "ha").

### 2.3. Yangi foydalanuvchi yaratish (xavfsizlik)

`root` bilan doim ishlash xavfli. Oddiy foydalanuvchi yaratamiz:

```bash
adduser deploy
```

Parol va ma'lumotlarni kiriting. Keyin unga admin (sudo) huquqi beramiz:

```bash
usermod -aG sudo deploy
```

Endi shu foydalanuvchiga o'tamiz:

```bash
su - deploy
```

### 2.4. Firewall (xavfsizlik devori) sozlash

```bash
sudo ufw allow OpenSSH
```
SSH (22-port) ga ruxsat — aks holda serverdan "chiqib qolasiz".

```bash
sudo ufw allow 'Nginx Full'
```
80 (HTTP) va 443 (HTTPS) portlariga ruxsat.

```bash
sudo ufw enable
```
Firewall'ni yoqamiz (`y` bilan tasdiqlang).

```bash
sudo ufw status
```
Holatni tekshiramiz.

### 2.5. Node.js o'rnatish (v20 LTS)

Avval NodeSource omborini qo'shamiz:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

Keyin Node.js'ni o'rnatamiz:

```bash
sudo apt install -y nodejs
```

Tekshiramiz (ikkalasi ham versiya raqamini ko'rsatishi kerak):

```bash
node -v
npm -v
```

### 2.6. PM2 va Git o'rnatish

```bash
sudo npm install -g pm2
```
PM2 — ilovalarni boshqaruvchi (global o'rnatamiz).

```bash
sudo apt install -y git
```
Git — kodni serverga olib kelish uchun.

---

## 3. PostgreSQL o'rnatish

### 3.1. O'rnatish

```bash
sudo apt install -y postgresql postgresql-contrib
```

PostgreSQL va qo'shimcha vositalarini o'rnatadi.

```bash
sudo systemctl status postgresql
```
Ishlab turganini tekshiramiz (`active (running)` bo'lishi kerak; chiqish uchun `q`).

### 3.2. Baza va foydalanuvchi yaratish

PostgreSQL'ning `postgres` foydalanuvchisiga o'tamiz:

```bash
sudo -u postgres psql
```

Endi siz PostgreSQL konsolidasiz (`postgres=#`). Quyidagilarni **bittalab** kiriting.

Bazaga maxsus foydalanuvchi yaratamiz (parolni o'zgartiring!):

```sql
CREATE USER ignite_user WITH PASSWORD 'KuchliParol123!';
```

Bazani yaratamiz:

```sql
CREATE DATABASE ignite_blog OWNER ignite_user;
```

Barcha huquqlarni beramiz:

```sql
GRANT ALL PRIVILEGES ON DATABASE ignite_blog TO ignite_user;
```

Konsoldan chiqamiz:

```sql
\q
```

> Endi sizning `DATABASE_URL` shunday bo'ladi:
> `postgresql://ignite_user:KuchliParol123!@localhost:5432/ignite_blog?schema=public`

---

## 4. Loyihani serverga olish

### 4.1. Kodni klonlash

Loyihangiz GitHub'da bo'lsa (tavsiya etiladi):

```bash
cd ~
git clone https://github.com/SIZNING_AKKAUNT/ignite-blog.git
cd ignite-blog
```

> GitHub'da bo'lmasa, kodni `scp` orqali ham yuklash mumkin:
> `scp -r "./IGNITE BLOG" deploy@123.45.67.89:~/ignite-blog`

### 4.2. Backend'ni sozlash

```bash
cd ~/ignite-blog/backend
```

Paketlarni o'rnatamiz:

```bash
npm install
```

`.env` faylini yaratamiz:

```bash
cp .env.example .env
nano .env
```

`nano` matn muharririda quyidagilarni to'ldiring (eng muhimlari):

```ini
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://admin.igniteblog.com
DATABASE_URL="postgresql://ignite_user:KuchliParol123!@localhost:5432/ignite_blog?schema=public"
JWT_SECRET=<juda-uzun-tasodifiy-qiymat>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=admin@igniteblog.com
ADMIN_PASSWORD=KuchliAdminParol!
```

> `JWT_SECRET` uchun tasodifiy qiymat: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Saqlash: `Ctrl+O`, `Enter`, chiqish: `Ctrl+X`.

### 4.3. Bazani tayyorlash (migratsiya + seed)

Prisma client'ni yaratamiz:

```bash
npm run prisma:generate
```

Bazaga jadvallarni yaratamiz (migratsiya):

```bash
npm run prisma:deploy
```

> `prisma:deploy` = `prisma migrate deploy` — production uchun. Mavjud
> migratsiyalarni qo'llaydi. (Birinchi marta migratsiya bo'lmasa, avval
> lokal kompyuterda `npm run prisma:migrate -- --name init` qilib, migratsiya
> faylini repozitoriyga qo'shing.)

Birinchi admin va boshlang'ich ma'lumotlarni qo'shamiz:

```bash
npm run seed
```

Backend'ni build qilamiz (TypeScript → JavaScript):

```bash
npm run build
```

### 4.4. Admin panelni sozlash

```bash
cd ~/ignite-blog/admin
npm install
```

`.env.local` faylini yaratamiz:

```bash
cp .env.local.example .env.local
nano .env.local
```

Quyidagicha to'ldiring:

```ini
NEXT_PUBLIC_API_URL=https://api.igniteblog.com/api
```

Saqlang va build qiling:

```bash
npm run build
```

---

## 5. PM2 bilan ishga tushirish

### 5.1. Backend'ni ishga tushirish

```bash
cd ~/ignite-blog/backend
pm2 start ecosystem.config.js
```

`ecosystem.config.js` ichida sozlamalar bor (nom: `ignite-api`).

### 5.2. Admin panelni ishga tushirish

```bash
cd ~/ignite-blog/admin
pm2 start ecosystem.config.js
```

(nom: `ignite-admin`).

### 5.3. Holatni ko'rish

```bash
pm2 status
```
Ikkala ilova `online` bo'lishi kerak.

```bash
pm2 logs
```
Loglarni real vaqtda ko'rsatadi (chiqish: `Ctrl+C`).

### 5.4. Server qayta yuklansa avtomatik ishga tushishi uchun

```bash
pm2 startup
```
Bu buyruq sizga **boshqa buyruq** ko'rsatadi — uni nusxalab bajaring.

```bash
pm2 save
```
Joriy holatni saqlaydi.

---

## 6. Nginx reverse proxy

### 6.1. O'rnatish

```bash
sudo apt install -y nginx
```

### 6.2. Konfiguratsiya fayllarini joylash

Loyihadagi `docs/nginx/api.conf` va `docs/nginx/admin.conf` namunalaridan
foydalanamiz.

API uchun:

```bash
sudo nano /etc/nginx/sites-available/api.igniteblog.com
```

`docs/nginx/api.conf` mazmunini nusxalab joylashtiring va domenni
moslang. Saqlang.

Admin uchun:

```bash
sudo nano /etc/nginx/sites-available/admin.igniteblog.com
```

`docs/nginx/admin.conf` mazmunini joylashtiring.

### 6.3. Saytlarni yoqish

```bash
sudo ln -s /etc/nginx/sites-available/api.igniteblog.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.igniteblog.com /etc/nginx/sites-enabled/
```

`ln -s` — symbolic link yaratadi (sites-enabled = faol saytlar).

Default saytni o'chiramiz (ixtiyoriy):

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 6.4. Tekshirish va qayta ishga tushirish

```bash
sudo nginx -t
```
Konfiguratsiyada xato yo'qligini tekshiradi (`syntax is ok` bo'lishi kerak).

```bash
sudo systemctl reload nginx
```
Nginx'ni yangi sozlama bilan qayta yuklaydi.

---

## 7. Domen ulash

Domeningiz boshqaruv panelida (masalan Namecheap, Cloudflare, GoDaddy)
**DNS yozuvlari (A records)** qo'shing:

| Tur | Nom (Host) | Qiymat (server IP) |
|-----|------------|--------------------|
| A   | `api`      | `123.45.67.89`     |
| A   | `admin`    | `123.45.67.89`     |

> Natijada `api.igniteblog.com` va `admin.igniteblog.com` sizning serveringizga
> ishora qiladi. DNS tarqalishi 5 daqiqadan bir necha soatgacha vaqt olishi mumkin.

Tekshirish (server IP qaytishi kerak):

```bash
ping api.igniteblog.com
```

---

## 8. SSL (HTTPS) — Let's Encrypt

Let's Encrypt — **bepul** SSL sertifikati beradi (saytga 🔒 qulf qo'yadi).

### 8.1. Certbot o'rnatish

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2. Sertifikat olish

```bash
sudo certbot --nginx -d api.igniteblog.com -d admin.igniteblog.com
```

- Email so'raydi — kiriting.
- Shartlarga rozilik — `Y`.
- HTTP'ni HTTPS'ga yo'naltirishni so'raydi — `2` (Redirect) tanlang.

Certbot avtomatik ravishda Nginx konfiguratsiyasini HTTPS bilan yangilaydi.

### 8.3. Avtomatik yangilanishni tekshirish

Sertifikat 90 kunda eskiradi, lekin Certbot avtomatik yangilaydi. Sinab ko'ramiz:

```bash
sudo certbot renew --dry-run
```

`success` chiqsa — hammasi joyida.

> Endi `https://api.igniteblog.com/api/docs` va `https://admin.igniteblog.com`
> ishlashi kerak!

---

## 9. Yangilanish chiqarish

Kodga o'zgartirish kiritganingizdan keyin serverda:

```bash
cd ~/ignite-blog
git pull
```

Backend o'zgargan bo'lsa:

```bash
cd backend
npm install
npm run prisma:deploy   # yangi migratsiya bo'lsa
npm run build
pm2 restart ignite-api
```

Admin o'zgargan bo'lsa:

```bash
cd ../admin
npm install
npm run build
pm2 restart ignite-admin
```

---

## 10. Muammolar

**Ilova ishlamayapti?**
```bash
pm2 logs ignite-api      # backend loglari
pm2 logs ignite-admin    # admin loglari
```

**Nginx 502 Bad Gateway?**
- Ilova ishlab turibdimi? `pm2 status`
- To'g'ri portmi? (backend 5000, admin 3000)

**Bazaga ulanmayapti?**
- `.env` dagi `DATABASE_URL` to'g'rimi?
- PostgreSQL ishlayaptimi? `sudo systemctl status postgresql`

**CORS xatosi (admin API'ga ulanmayapti)?**
- Backend `.env` dagi `CORS_ORIGIN` admin domeniga teng bo'lishi kerak
  (masalan `https://admin.igniteblog.com`).

**Firewall portni bloklayaptimi?**
```bash
sudo ufw status
```

---

Tabriklaymiz! 🎉 Loyihangiz endi internetda ishlamoqda.
```
