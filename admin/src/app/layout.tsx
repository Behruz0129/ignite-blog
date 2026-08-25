import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="uz" className={inter.variable}>
      {/* suppressHydrationWarning: brauzer kengaytmalari <body> ga atribut qo'shadi */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
