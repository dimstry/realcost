import type { Metadata } from "next";
import { DM_Mono, Lexend } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "RealCost: harga sebenarnya dari setiap belanja", template: "%s · RealCost" },
  description:
    "Hitung berapa nilai uangmu kalau diinvestasikan, bukan dibelanjakan. Gratis, tanpa daftar, semua dihitung di browsermu.",
  applicationName: "RealCost",
  openGraph: { type: "website", locale: "id_ID", siteName: "RealCost", images: [{ url: "/api/og", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/api/og"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${lexend.variable} ${dmMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
