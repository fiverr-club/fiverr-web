import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fiverrex.vercel.app"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FIVERREX — Cloud-Native Freelance Services & Escrow Marketplace",
    template: "%s | FIVERREX",
  },
  description:
    "Discover top-rated engineering, AI, design, and DevOps talent with 100% escrow protection, 500+ open projects, credit quests, and Gemini AI Copilot.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FIVERREX",
    title: "FIVERREX — Cloud-Native Freelance Services & Escrow Marketplace",
    description:
      "Hire verified architects, AI engineers, and designers with milestone-backed Escrow protection and 500+ live freelance projects.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIVERREX — Freelance Services & AI Engineering Marketplace",
    description:
      "500+ open projects, milestone escrow protection, +500 credit quests, and Gemini AI Agent Copilot.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#f8fafc] text-gray-800 antialiased selection:bg-emerald-100 selection:text-emerald-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
