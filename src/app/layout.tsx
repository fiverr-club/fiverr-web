import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fiverrex — Cloud-Native Freelance Services & Escrow Marketplace",
  description:
    "Discover top-rated engineering, AI, design, and DevOps talent with 100% escrow protection. Powered by Next.js 15 and 9 Spring Boot 3 DDD microservices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-gray-50/40 text-gray-800 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
