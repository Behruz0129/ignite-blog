import type { Metadata } from "next";
import ContentIndex from "@/components/ContentIndex";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Qo'llanmalar",
  description: "Bosqichma-bosqich gaming qo'llanmalari va maslahatlar.",
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <ContentIndex type="guides" page={Number(page) || 1} />;
}
