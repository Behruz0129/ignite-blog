import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

// Apple SF Pro'ga eng yaqin bepul shrift - Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ignite — Gaming yangiliklari, qo'llanmalar va fikrlar",
    template: "%s — Ignite",
  },
  description:
    "Gaming olamidan eng so'nggi yangiliklar, foydali qo'llanmalar va fikr-mulohazalar. Minimalistik va tez.",
  openGraph: {
    type: "website",
    siteName: "Ignite",
    locale: "uz_UZ",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
