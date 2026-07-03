import type { Metadata } from "next";
import ContentIndex from "@/components/ContentIndex";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Maqolalar",
  description: "Mualliflarning fikr, tahlil va mulohazalari.",
};

export default async function OpinionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <ContentIndex type="opinions" page={Number(page) || 1} />;
}
