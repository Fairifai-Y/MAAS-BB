import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAAS Platform - Managed Application as a Service",
  description: "Professionele IT-ondersteuning op maat met flexibele pakketten en uren tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
