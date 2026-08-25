"use client";
import TaxonomyManager from "@/components/TaxonomyManager";

export default function CategoriesPage() {
  return (
    <TaxonomyManager
      apiPath="/categories"
      title="Kategoriyalar"
      hint="Kategoriya — kontentning asosiy bo'limi (masalan PC O'yinlar, Esports). Har bir maqola bir yoki bir nechta kategoriyaga tegishli bo'ladi."
    />
  );
}
