/**
 * SEED SCRIPT
 * -----------
 * Bu skript ma'lumotlar bazasiga boshlang'ich ma'lumotlarni qo'shadi:
 *   1) Birinchi ADMIN foydalanuvchi (.env dagi ADMIN_* qiymatlardan)
 *   2) Bir nechta namunaviy kategoriya va teglar
 *
 * Ishga tushirish:
 *   npm run seed
 *
 * "upsert" ishlatamiz - ya'ni mavjud bo'lsa yangilaydi, bo'lmasa yaratadi.
 * Shu sababli skriptni xavfsiz tarzda bir necha marta ishga tushirish mumkin.
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Oddiy slug yaratuvchi (utils/slugify bilan bir xil mantiq)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  console.log("🌱  Seeding boshlandi...");

  // 1) ADMIN foydalanuvchi
  const adminName = process.env.ADMIN_NAME || "Super Admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@igniteblog.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345!";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.SUPER_ADMIN, emailVerified: true }, // asosiy admin har doim SUPER_ADMIN
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      provider: "LOCAL",
      emailVerified: true,
    },
  });

  console.log(`✅  Admin tayyor: ${admin.email}`);
  console.log(`    Parol (faqat birinchi yaratishda): ${adminPassword}`);

  // 2) Kategoriyalar
  const categories = ["PC O'yinlar", "Konsol", "Esports", "Mobil O'yinlar"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  console.log(`✅  ${categories.length} ta kategoriya tayyor`);

  // 3) Teglar
  const tags = ["RPG", "FPS", "Indie", "Update", "Review"];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  console.log(`✅  ${tags.length} ta teg tayyor`);

  console.log("🎉  Seeding tugadi!");
}

main()
  .catch((e) => {
    console.error("❌  Seeding xatosi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
