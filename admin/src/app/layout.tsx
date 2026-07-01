import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignite Blog — Admin",
  description: "Gaming blog CMS boshqaruv paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
