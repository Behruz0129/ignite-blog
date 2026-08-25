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
// Nusxa emas, aynan API ishlatadigan slugify — ikkalasi ajralib ketmasligi uchun
import { slugify } from "../src/utils/slugify";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding boshlandi...");

  // 1) ADMIN foydalanuvchi
  const adminName = process.env.ADMIN_NAME || "Super Admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@igniteblog.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345!";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  /**
   * Parol tiklash oqimi olib tashlangan (email xizmati saqlanmaydi), shuning
   * uchun admin parolini unutganda yagona yo'l — shu skript. `ADMIN_PASSWORD`
   * berilgan bo'lsa parol HAR SAFAR shu qiymatga tenglashtiriladi; berilmasa
   * mavjud parolga tegilmaydi.
   *
   * Diqqat: Render har deploy'da `npm run seed` ni ishga tushiradi, ya'ni
   * muhitda `ADMIN_PASSWORD` turgan ekan, deploy'dan keyin admin paroli doim
   * o'sha bo'ladi.
   */
  const resetPassword = Boolean(process.env.ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.SUPER_ADMIN, // asosiy admin har doim SUPER_ADMIN
      emailVerified: true,
      ...(resetPassword ? { password: hashedPassword } : {}),
    },
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
  console.log(
    resetPassword
      ? "    Parol ADMIN_PASSWORD qiymatiga tenglashtirildi"
      : "    Parolga tegilmadi (ADMIN_PASSWORD berilmagan)"
  );

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
