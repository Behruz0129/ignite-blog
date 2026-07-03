import type { Metadata } from "next";
import ContentIndex from "@/components/ContentIndex";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Yangiliklar",
  description: "Gaming olamidan eng so'nggi yangiliklar.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <ContentIndex type="news" page={Number(page) || 1} />;
}
