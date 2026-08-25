/**
 * DEMO SEED SCRIPT
 * ----------------
 * Namunaviy kontent: yangiliklar, qo'llanmalar, maqolalar + izoh va like'lar.
 * Saytni "to'la" holatda ko'rish va admin panelni sinash uchun.
 *
 * Asosiy seed.ts dan ATAYLAB ajratilgan: u productionda ham ishlaydi
 * (admin + kategoriya), bu esa FAQAT development uchun.
 *
 * Ishga tushirish:
 *   npm run seed:demo                -- qo'shadi / yangilaydi (idempotent)
 *   npm run seed:demo -- --clean     -- faqat demo kontentni o'chiradi
 *
 * O'yin va studiya nomlari o'ylab topilgan (haqiqiy mahsulotlar emas) —
 * namunaviy ma'lumot haqiqiy yangilik bilan adashtirilmasligi uchun.
 */

import {
  PrismaClient,
  ContentStatus,
  Difficulty,
  CommentStatus,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// ---------------------------------------------------------------- helpers

/**
 * Cloudinary'ning ochiq "demo" bulutidan abstrakt rangli banner.
 * next.config.mjs da res.cloudinary.com allaqachon ruxsat etilgan, shuning
 * uchun next/image qo'shimcha sozlamasiz ishlaydi.
 */
function banner(base: string, rgb: string): string {
  return (
    "https://res.cloudinary.com/demo/image/upload/" +
    "w_1200,h_675,c_fill,e_blur:2000,e_colorize:70,co_rgb:" +
    rgb +
    ",q_auto,f_auto/" +
    base +
    ".jpg"
  );
}

/** Bugundan n kun oldingi sana (kontent tartibi tabiiy ko'rinishi uchun). */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------- content

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  categories: string[]; // kategoriya slug'lari
  tags: string[]; // teg slug'lari
  days: number; // necha kun oldin chop etilgan
  status?: ContentStatus;
  difficulty?: Difficulty;
}

const NEWS: Article[] = [
  {
    slug: "ashen-vale-2-qishki-yangilanish",
    title: "Ashen Vale 2 qishki yangilanishi: yangi xarita va reyd bossi",
    excerpt:
      "Studiya yil yakunidagi eng katta yangilanishni chiqardi — Sovuq Vodiy xaritasi, sakkiz kishilik reyd va qayta ishlangan yasash tizimi.",
    image: banner("mountain", "1e3a8a"),
    categories: ["pc-oyinlar"],
    tags: ["rpg", "update"],
    days: 1,
    content: `
<h2>Nima o'zgardi</h2>
<p>Qishki yangilanish o'yinning eng katta kengaytmasi bo'ldi. Uchta yo'nalishda ish olib borilgan: yangi hudud, guruhli kontent va yasash (crafting) tizimini qayta qurish.</p>
<ul>
  <li><strong>Sovuq Vodiy</strong> — mavjud xaritadan taxminan uchdan bir baravar katta yangi hudud.</li>
  <li><strong>Muz Qo'rg'oni</strong> — sakkiz kishilik reyd, uch bosqichli boss jangi bilan.</li>
  <li>Yasash tizimi endi retsept emas, <em>material xossalari</em> asosida ishlaydi.</li>
</ul>
<h2>Reyd haqida</h2>
<p>Boss jangi uch bosqichdan iborat va har bosqichda guruh joylashuvi butunlay o'zgaradi. Birinchi bosqichda maydon markazi muzlab boradi, ikkinchisida guruh ikkiga bo'linadi, uchinchisida esa butun maydon aylanma harakatga tushadi.</p>
<blockquote>
  <p>Biz reydni "o'rganish uchun o'lish kerak" tamoyilidan uzoqlashtirmoqchi edik. Har bir mexanika jang boshlanishidan oldin maydonda ko'rinib turadi.</p>
</blockquote>
<h2>Muvozanat o'zgarishlari</h2>
<table>
  <tbody>
    <tr><th>Sinf</th><th>O'zgarish</th></tr>
    <tr><td>Qorovul</td><td>Qalqon tiklanishi 12s dan 9s ga tushdi</td></tr>
    <tr><td>Mergan</td><td>Uzoq masofada zarar 8% kamaydi</td></tr>
    <tr><td>Shifokor</td><td>Guruhga davolash radiusi kengaydi</td></tr>
  </tbody>
</table>
<p>Yangilanish barcha platformalarda bepul tarqatilmoqda.</p>
`.trim(),
  },
  {
    slug: "vortex-arena-chempionati-toshkentda",
    title: "Vortex Arena jahon chempionati Toshkentda o'tkaziladi",
    excerpt:
      "Markaziy Osiyoda birinchi marta shu ko'lamdagi turnir — 16 jamoa, uch kunlik finallar va ochiq mahalliy saralash bosqichi.",
    image: banner("balloons", "7c2d12"),
    categories: ["esports"],
    tags: ["fps", "update"],
    days: 3,
    content: `
<h2>Turnir formati</h2>
<p>Jami 16 jamoa ishtirok etadi: 12 tasi mintaqaviy reytinglar orqali, 4 tasi ochiq saralash bosqichi orqali yo'llanma oladi. Guruh bosqichi ikki kun, finallar bir kun davom etadi.</p>
<ul>
  <li>Guruh bosqichi — to'rt guruh, har birida to'rt jamoa, ikki aylanali.</li>
  <li>Pley-off — bir marta yutqazsang chiqib ketasan (single elimination).</li>
  <li>Final — besh o'yingacha (Bo5).</li>
</ul>
<h2>Mahalliy jamoalar uchun</h2>
<p>Ochiq saralash bosqichi barcha uchun bepul va onlayn o'tkaziladi. Ro'yxatdan o'tish uchun jamoada kamida uch nafar o'yinchining hisobi mintaqaviy serverga bog'langan bo'lishi shart.</p>
<blockquote>
  <p>Bizning maqsadimiz — mintaqadagi jamoalarga xalqaro darajada o'ynash tajribasini berish.</p>
</blockquote>
<h2>Chiptalar</h2>
<p>Zal chiptalari uch bosqichda sotuvga chiqariladi. Guruh bosqichi kunlari alohida, finallar alohida sotiladi.</p>
`.trim(),
  },
  {
    slug: "neon-karvon-10-million-yuklab-olish",
    title: "Neon Karvon mobil versiyasi 10 million yuklab olishdan oshdi",
    excerpt:
      "Mustaqil studiya o'yini bir yilda o'nlab million foydalanuvchiga yetdi — reklamasiz, asosan og'zaki tavsiya orqali.",
    image: banner("bike", "4c1d95"),
    categories: ["mobil-oyinlar"],
    tags: ["indie"],
    days: 6,
    content: `
<h2>Bir yil ichida</h2>
<p>Besh kishilik jamoa tomonidan ishlab chiqilgan o'yin chiqqanidan buyon bir yil o'tdi. Studiya marketingga deyarli mablag' sarflamaganini, o'sish asosan foydalanuvchilar tavsiyasi hisobiga bo'lganini aytdi.</p>
<h2>Nima uchun ishladi</h2>
<ul>
  <li>Offlayn rejim — internetsiz ham to'liq o'ynasa bo'ladi.</li>
  <li>Energiya tizimi yo'q — o'yin vaqtini cheklaydigan mexanika ishlatilmagan.</li>
  <li>Bir martalik xarid, ichki sotuvlar yo'q.</li>
</ul>
<h2>Keyingi rejalar</h2>
<p>Studiya yil oxirigacha hikoya rejimiga ikkinchi bo'lim qo'shishni va o'yinni yana to'rt tilga tarjima qilishni rejalashtirmoqda.</p>
`.trim(),
  },
  {
    slug: "helios-studio-yangi-eksklyuziv",
    title: "Helios Studio yangi konsol eksklyuzivini e'lon qildi",
    excerpt:
      "Qoralama: e'lon tafsilotlari hali tasdiqlanmagan, chiqish oynasi ham aniq emas.",
    image: banner("woman", "065f46"),
    categories: ["konsol"],
    tags: ["update"],
    days: 0,
    status: ContentStatus.DRAFT,
    content: `
<h2>Qoralama</h2>
<p>Bu maqola hali chop etilmagan — u admin panelda <strong>DRAFT</strong> holatida turibdi va ommaviy saytda ko'rinmaydi. Qoralama va chop etilgan kontent farqini sinash uchun ataylab shunday qoldirilgan.</p>
<p>Matn to'ldirilgach, admin paneldan "Chop etish" tugmasi bosiladi.</p>
`.trim(),
  },
];

const GUIDES: Article[] = [
  {
    slug: "ashen-vale-2-birinchi-10-soat",
    title: "Ashen Vale 2: boshlovchilar uchun birinchi 10 soat",
    excerpt:
      "Qaysi sinfni tanlash, resursni nimaga sarflamaslik va birinchi kunda qaysi hududlarga bormaslik kerak.",
    image: banner("sample", "0f172a"),
    categories: ["pc-oyinlar"],
    tags: ["rpg"],
    days: 4,
    difficulty: Difficulty.BEGINNER,
    content: `
<h2>1. Sinf tanlash</h2>
<p>Birinchi o'yinda <strong>Qorovul</strong> yoki <strong>Sayyoh</strong> ni tanlang. Ikkalasi ham xatoni kechiradi: Qorovul ko'p zarbaga bardosh beradi, Sayyoh esa jangdan chiqib keta oladi. Mergan va Chaqiruvchi kuchli, lekin mexanikani yaxshi bilishni talab qiladi.</p>
<h2>2. Birinchi soatlarda nima qilmaslik kerak</h2>
<ul>
  <li>Kamyob materiallarni <em>sarflamang</em> — dastlabki qurollar baribir almashtiriladi.</li>
  <li>Shimoliy botqoqqa 15-darajagacha bormang.</li>
  <li>Savdogarga narsa sotmang; omborga yig'ing, keyinroq narxi oshadi.</li>
</ul>
<h2>3. Tavsiya etilgan tartib</h2>
<table>
  <tbody>
    <tr><th>Soat</th><th>Vazifa</th></tr>
    <tr><td>0-2</td><td>Asosiy hikoya, birinchi qishloq</td></tr>
    <tr><td>2-5</td><td>Yon vazifalar, 8-darajaga chiqish</td></tr>
    <tr><td>5-8</td><td>Birinchi zindon, guruh bilan</td></tr>
    <tr><td>8-10</td><td>Yasash stoli va birinchi to'plam</td></tr>
  </tbody>
</table>
<h2>4. Sozlamalar</h2>
<p>Boshidanoq nishonni (crosshair) kattalashtiring va kamera silkinishini o'chiring — uzoq o'ynaganda charchoqni sezilarli kamaytiradi.</p>
`.trim(),
  },
  {
    slug: "vortex-arena-reyting-oshirish",
    title: "Vortex Arena: reytingni oshiradigan 7 ta odat",
    excerpt:
      "Mexanik mahorat emas, qaror qabul qilish. Reytingda qotib qolganlar uchun amaliy ro'yxat.",
    image: banner("mountain", "7c2d12"),
    categories: ["esports"],
    tags: ["fps"],
    days: 9,
    difficulty: Difficulty.INTERMEDIATE,
    content: `
<h2>Nega mashqning o'zi yetarli emas</h2>
<p>Nishonga tekkizish mahorati ma'lum darajadan keyin reytingni oshirmaydi. O'sish to'xtaganda muammo odatda <em>qarorlarda</em> bo'ladi: qachon jangga kirish, qachon chekinish, qachon ma'lumot berish.</p>
<h2>Yetti odat</h2>
<ul>
  <li><strong>Har raund oldidan bitta reja</strong> — jamoaga bir jumlada ayting.</li>
  <li><strong>O'lganingizdan keyin sabab ayting</strong>, kimnidir ayblamang.</li>
  <li><strong>Karta o'rtasini bo'sh qoldirmang</strong> — ma'lumot shu yerdan keladi.</li>
  <li><strong>Iqtisodni jamoa bilan moslang</strong>, yakka xarid qilmang.</li>
  <li><strong>Ketma-ket ikki mag'lubiyatdan keyin uslubni o'zgartiring.</strong></li>
  <li><strong>Kuniga 3 ta reyting o'yini</strong> — ko'proq o'ynash natijani yomonlashtiradi.</li>
  <li><strong>Haftada bir marta o'z yozuvingizni ko'ring</strong>, faqat o'lim epizodlarini.</li>
</ul>
<h2>Isinish tartibi</h2>
<pre><code>10 daqiqa — nishon mashqi (faqat bir qurol)
5 daqiqa  — harakat mashqi
1 o'yin   — reytingsiz
--- shundan keyingina reyting ---</code></pre>
<blockquote>
  <p>Charchagan holda o'ynalgan har bir o'yin — ertangi kuningizdan o'g'irlangan reyting.</p>
</blockquote>
`.trim(),
  },
  {
    slug: "pc-yigish-byudjet-qollanma",
    title: "O'yin uchun PC yig'ish: byudjetni qanday taqsimlash kerak",
    excerpt:
      "Protsessor, videokarta, xotira va quvvat bloki o'rtasidagi nisbat — va odamlar eng ko'p qayerda xato qiladi.",
    image: banner("sample", "4c1d95"),
    categories: ["pc-oyinlar"],
    tags: ["review"],
    days: 14,
    difficulty: Difficulty.ADVANCED,
    content: `
<h2>Asosiy qoida</h2>
<p>Sof o'yin uchun yig'ilayotgan kompyuterda byudjetning eng katta ulushi <strong>videokartaga</strong> ketishi kerak. Protsessorga ortiqcha sarflash odatda kadr tezligiga deyarli ta'sir qilmaydi.</p>
<h2>Taxminiy taqsimot</h2>
<table>
  <tbody>
    <tr><th>Qism</th><th>Ulush</th><th>Izoh</th></tr>
    <tr><td>Videokarta</td><td>40-45%</td><td>Kadr tezligini shu hal qiladi</td></tr>
    <tr><td>Protsessor</td><td>18-22%</td><td>O'rta segment yetarli</td></tr>
    <tr><td>Xotira</td><td>10%</td><td>32GB, ikki tayoqcha</td></tr>
    <tr><td>SSD</td><td>10%</td><td>NVMe, kamida 1TB</td></tr>
    <tr><td>Quvvat bloki</td><td>10%</td><td>Bu yerda tejamang</td></tr>
    <tr><td>Korpus va sovutish</td><td>8%</td><td>Havo oqimi muhim</td></tr>
  </tbody>
</table>
<h2>Eng keng tarqalgan uchta xato</h2>
<ul>
  <li><strong>Arzon quvvat bloki.</strong> Sifatsiz blok butun tizimni olib ketishi mumkin.</li>
  <li><strong>Bitta xotira tayoqchasi.</strong> Ikki tayoqcha unumdorlikni sezilarli oshiradi.</li>
  <li><strong>Monitorni unutish.</strong> Kuchli videokarta 60Gts monitorda ma'nosini yo'qotadi.</li>
</ul>
<h2>Yig'ishdan oldin</h2>
<p>Anakartning quvvat bosqichlari va korpus o'lchamini videokarta uzunligi bilan solishtirib chiqing — eng ko'p muammo shu ikki joyda chiqadi.</p>
`.trim(),
  },
];

const OPINIONS: Article[] = [
  {
    slug: "erta-kirish-sinov-quyonimi",
    title: "Erta kirish o'yinchini sinov quyoniga aylantirdimi?",
    excerpt:
      "Tugallanmagan o'yin uchun to'liq narx to'lash qachon hamkorlik, qachon esa shunchaki tovar sifatida sotilgan va'da?",
    image: banner("yellow_tulip", "0f172a"),
    categories: ["pc-oyinlar"],
    tags: ["indie", "review"],
    days: 7,
    content: `
<h2>Va'da qanday boshlangan</h2>
<p>Erta kirish (early access) modeli mustaqil studiyalar uchun tug'ilgan edi: o'yinchi ishlab chiqishni moliyalashtiradi, buning evaziga jarayonga ta'sir qiladi. Bu adolatli almashuv edi.</p>
<h2>Nima o'zgardi</h2>
<p>Bugun katta noshirlar ham xuddi shu yorliqdan foydalanmoqda — lekin moliyalashtirish ehtiyoji bo'lmagan holda. Yorliq endi ko'pincha boshqa vazifani bajaradi: tanqiddan himoya.</p>
<blockquote>
  <p>"Bu hali erta kirish" — bu jumla qachon izoh, qachon esa javobgarlikdan qochish ekanini ajratish tobora qiyinlashmoqda.</p>
</blockquote>
<h2>Qayerda chegara</h2>
<ul>
  <li>Aniq yo'l xaritasi va sanalar bor — bu hamkorlik.</li>
  <li>"Yaqin kelajakda" degan noaniq va'dalar — bu tovar.</li>
  <li>Jamoa yangilanishlarni ochiq izohlaydi — bu hamkorlik.</li>
  <li>Ikki yil davomida bitta katta yangilanish — bu tovar.</li>
</ul>
<h2>Xulosa</h2>
<p>Erta kirishning o'zi muammo emas. Muammo — uni tugallanmaganlik uchun doimiy uzr sifatida ishlatish. O'yinchi hamkor sifatida qatnashayotganini his qilishi kerak, sinov quyoni sifatida emas.</p>
`.trim(),
  },
  {
    slug: "esports-olimpiadaga-kirishi-kerakmi",
    title: "Esports Olimpiadaga kirishi kerakmi?",
    excerpt:
      "Tan olinish katta pul va barqarorlik olib keladi. Lekin qaysi o'yin tanlanishini kim hal qiladi?",
    image: banner("lady", "1e3a8a"),
    categories: ["esports"],
    tags: ["review"],
    days: 11,
    content: `
<h2>Tarafdorlarning dalili</h2>
<p>Olimpiada tan olinishi esportsga sport infratuzilmasini olib keladi: shifokor, murabbiy, pensiya, viza rejimi. Bugungi o'yinchilar ko'pincha bularning hech biriga ega emas.</p>
<h2>Muxoliflarning dalili</h2>
<p>An'anaviy sportdan farqli o'laroq, har bir o'yin — xususiy kompaniyaning mulki. Qoidalarni federatsiya emas, nashriyot o'zgartiradi. Bu esa sport uchun g'alati asos.</p>
<ul>
  <li>Nashriyot o'yinni yopsa, "sport turi" ham yo'qoladi.</li>
  <li>Muvozanat yangilanishi bir kechada butun tayyorgarlikni bekor qiladi.</li>
  <li>Qaysi o'yin kiritilishi — sport emas, tijorat qarori bo'lib qolishi mumkin.</li>
</ul>
<h2>Oraliq yo'l</h2>
<p>Ehtimol javob "ha yoki yo'q" da emas. Ochiq qoidali, hech kimga tegishli bo'lmagan o'yinlar alohida toifada, nashriyot o'yinlari esa alohida maqomda qatnashishi mumkin.</p>
<blockquote>
  <p>Savol esports sportmi degani emas. Savol — qoidalarni kim yozadi.</p>
</blockquote>
`.trim(),
  },
];

// ---------------------------------------------------------------- upsert

type Kind = "news" | "guides" | "opinions";

async function upsertArticle(kind: Kind, a: Article, authorId: string) {
  const base = {
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    featuredImage: a.image,
    metaTitle: a.title,
    metaDescription: a.excerpt,
    status: a.status ?? ContentStatus.PUBLISHED,
    publishedAt: a.status === ContentStatus.DRAFT ? null : daysAgo(a.days),
    // Ro'yxatlar createdAt bo'yicha saralanadi. Uni ham chop etilgan sanaga
    // moslamasak, hamma yozuv bir soniyada yaratilib, sanalar aralash chiqadi.
    createdAt: daysAgo(a.days),
    authorId,
  };

  const rel = {
    categories: { connect: a.categories.map((slug) => ({ slug })) },
    tags: { connect: a.tags.map((slug) => ({ slug })) },
  };

  // update'da avval bog'lanishlarni tozalaymiz — skript qayta ishga
  // tushirilganda eski kategoriya/teg osilib qolmasligi uchun
  const relReset = {
    categories: { set: [], connect: a.categories.map((slug) => ({ slug })) },
    tags: { set: [], connect: a.tags.map((slug) => ({ slug })) },
  };

  if (kind === "guides") {
    const extra = { difficulty: a.difficulty ?? Difficulty.BEGINNER };
    return prisma.guide.upsert({
      where: { slug: a.slug },
      update: { ...base, ...extra, ...relReset },
      create: { slug: a.slug, ...base, ...extra, ...rel },
    });
  }

  if (kind === "opinions") {
    return prisma.opinion.upsert({
      where: { slug: a.slug },
      update: { ...base, ...relReset },
      create: { slug: a.slug, ...base, ...rel },
    });
  }

  return prisma.news.upsert({
    where: { slug: a.slug },
    update: { ...base, ...relReset },
    create: { slug: a.slug, ...base, ...rel },
  });
}

// ---------------------------------------------------------------- demo users

// Demo mehmon izohlarining emaillari — tozalashda shular bo'yicha topamiz
const GUEST_EMAILS = [
  "mehmon@example.com",
  "anon@example.com",
  "oquvchi@example.com",
];

const DEMO_USERS = [
  { name: "Aziza Karimova", email: "demo.aziza@igniteblog.dev" },
  { name: "Sardor Yo'ldoshev", email: "demo.sardor@igniteblog.dev" },
  { name: "Javohir Rasulov", email: "demo.javohir@igniteblog.dev" },
];

async function ensureDemoUsers() {
  const password = await bcrypt.hash("Demo12345!", 10);
  const users = [];
  for (const u of DEMO_USERS) {
    users.push(
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          password,
          role: Role.USER,
          provider: "LOCAL",
          emailVerified: true,
        },
      })
    );
  }
  return users;
}

// ---------------------------------------------------------------- clean

async function clean() {
  // Avval faqat demo izohlarni olib tashlaymiz — kontent o'chganda Cascade
  // qolganini ham olib ketardi, jumladan haqiqiy o'quvchilarnikini.
  const demoUserIds = (
    await prisma.user.findMany({
      where: { email: { in: DEMO_USERS.map((x) => x.email) } },
      select: { id: true },
    })
  ).map((u) => u.id);

  const c = await prisma.comment.deleteMany({
    where: {
      OR: [
        { userId: { in: demoUserIds } },
        { authorEmail: { in: GUEST_EMAILS } },
      ],
    },
  });

  // Demo maqolalarda begona (haqiqiy) izoh qolgan bo'lsa — ogohlantiramiz:
  // maqola o'chsa, Cascade ularni ham olib ketadi.
  const foreign = await prisma.comment.count({
    where: {
      OR: [
        { news: { slug: { in: NEWS.map((a) => a.slug) } } },
        { guide: { slug: { in: GUIDES.map((a) => a.slug) } } },
        { opinion: { slug: { in: OPINIONS.map((a) => a.slug) } } },
      ],
    },
  });
  if (foreign > 0) {
    console.warn(
      "DIQQAT: demo maqolalarda " +
        foreign +
        " ta begona izoh bor — maqola bilan birga o'chadi."
    );
  }

  const n = await prisma.news.deleteMany({
    where: { slug: { in: NEWS.map((a) => a.slug) } },
  });
  const g = await prisma.guide.deleteMany({
    where: { slug: { in: GUIDES.map((a) => a.slug) } },
  });
  const o = await prisma.opinion.deleteMany({
    where: { slug: { in: OPINIONS.map((a) => a.slug) } },
  });
  const u = await prisma.user.deleteMany({
    where: { email: { in: DEMO_USERS.map((x) => x.email) } },
  });

  console.log(
    "O'chirildi: " +
      c.count +
      " izoh, " +
      n.count +
      " yangilik, " +
      g.count +
      " qo'llanma, " +
      o.count +
      " maqola, " +
      u.count +
      " demo foydalanuvchi"
  );
}

// ---------------------------------------------------------------- main

async function main() {
  if (process.argv.includes("--clean")) {
    await clean();
    return;
  }

  console.log("Demo kontent seeding boshlandi...");

  // 1) Muallif — asosiy admin (seed.ts yaratgan)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@igniteblog.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    throw new Error(
      "Admin topilmadi (" +
        adminEmail +
        '). Avval "npm run seed" ni ishga tushiring.'
    );
  }

  // 2) Kategoriya va teglar mavjudligiga ishonch hosil qilamiz
  const needCats: Record<string, string> = {
    "pc-oyinlar": "PC O'yinlar",
    konsol: "Konsol",
    esports: "Esports",
    "mobil-oyinlar": "Mobil O'yinlar",
  };
  for (const [slug, name] of Object.entries(needCats)) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const needTags: Record<string, string> = {
    rpg: "RPG",
    fps: "FPS",
    indie: "Indie",
    update: "Update",
    review: "Review",
  };
  for (const [slug, name] of Object.entries(needTags)) {
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  // 3) Kontent
  const news = [];
  for (const a of NEWS) news.push(await upsertArticle("news", a, admin.id));
  const guides = [];
  for (const a of GUIDES) guides.push(await upsertArticle("guides", a, admin.id));
  const opinions = [];
  for (const a of OPINIONS)
    opinions.push(await upsertArticle("opinions", a, admin.id));

  console.log(
    news.length +
      " yangilik, " +
      guides.length +
      " qo'llanma, " +
      opinions.length +
      " maqola tayyor"
  );

  // 4) Demo o'quvchilar
  const users = await ensureDemoUsers();
  console.log(users.length + " demo foydalanuvchi tayyor (parol: Demo12345!)");

  // 5) Izohlar — moderatsiya ekranini sinash uchun uch xil holatda.
  //
  // MUHIM: faqat SHU skript yaratgan izohlarni o'chiramiz. Ilgari bu yerda
  // "demo maqolaga tegishli hamma izoh" o'chirilardi — bunda saytda qoldirilgan
  // haqiqiy izohlar ham yo'q bo'lib ketardi.
  await prisma.comment.deleteMany({
    where: {
      OR: [
        { userId: { in: users.map((u) => u.id) } },
        { authorEmail: { in: GUEST_EMAILS } },
      ],
    },
  });

  // Ilova ro'yxatdan o'tgan foydalanuvchi izohida authorName/authorEmail ni
  // ham saqlaydi (comment.service.ts). Demo ma'lumot ham shu shaklda bo'lsin,
  // aks holda admin ro'yxatlarida muallif ustuni bo'sh chiqadi.
  const byUser = (i: number) => ({
    userId: users[i].id,
    authorName: users[i].name,
    authorEmail: users[i].email,
  });

  await prisma.comment.createMany({
    data: [
      {
        ...byUser(0),
        newsId: news[0].id,
        content:
          "Reyd mexanikasi juda yoqdi, lekin uchinchi bosqich guruhsiz o'ynaganda haddan tashqari og'ir.",
        status: CommentStatus.APPROVED,
      },
      {
        ...byUser(1),
        newsId: news[0].id,
        content: "Yasash tizimi qayta qurilgani eng katta yangilik. Nihoyat.",
        status: CommentStatus.APPROVED,
      },
      {
        ...byUser(2),
        newsId: news[1].id,
        content: "Saralash bosqichiga qanday ro'yxatdan o'tsa bo'ladi?",
        status: CommentStatus.APPROVED,
      },
      {
        authorName: "Mehmon",
        authorEmail: "mehmon@example.com",
        newsId: news[1].id,
        content: "Chiptalar narxi qachon e'lon qilinadi?",
        status: CommentStatus.PENDING,
      },
      {
        ...byUser(0),
        guideId: guides[1].id,
        content:
          "Kuniga 3 ta o'yin qoidasini sinab ko'rdim — bir oyda sezilarli farq bo'ldi.",
        status: CommentStatus.APPROVED,
      },
      {
        authorName: "Anon",
        authorEmail: "anon@example.com",
        guideId: guides[2].id,
        content: "arzon qismlar http://spam.example.com bu yerda",
        status: CommentStatus.REJECTED,
      },
      {
        ...byUser(1),
        opinionId: opinions[0].id,
        content:
          "Yo'l xaritasi bor yoki yo'qligi — eng to'g'ri mezon. Shu bo'yicha xarid qilaman.",
        status: CommentStatus.APPROVED,
      },
      {
        authorName: "O'quvchi",
        authorEmail: "oquvchi@example.com",
        opinionId: opinions[1].id,
        content: "Qoidalarni kim yozadi degan savol juda o'rinli qo'yilgan.",
        status: CommentStatus.PENDING,
      },
    ],
  });
  console.log("8 ta izoh tayyor (tasdiqlangan / kutayotgan / rad etilgan)");

  // 6) Like'lar
  await prisma.like.deleteMany({
    where: { userId: { in: users.map((u) => u.id) } },
  });
  await prisma.like.createMany({
    data: [
      { userId: users[0].id, newsId: news[0].id },
      { userId: users[1].id, newsId: news[0].id },
      { userId: users[2].id, newsId: news[0].id },
      { userId: users[0].id, newsId: news[1].id },
      { userId: users[1].id, newsId: news[2].id },
      { userId: users[0].id, guideId: guides[0].id },
      { userId: users[1].id, guideId: guides[1].id },
      { userId: users[2].id, guideId: guides[1].id },
      { userId: users[0].id, opinionId: opinions[0].id },
      { userId: users[2].id, opinionId: opinions[1].id },
    ],
    skipDuplicates: true,
  });
  console.log("10 ta like tayyor");

  console.log("Demo seeding tugadi!");
}

main()
  .catch((e) => {
    console.error("Demo seeding xatosi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
