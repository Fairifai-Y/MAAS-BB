import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitchannel - Change the Channel",
  description: "Fitchannel - Change the Channel. Interne platform voor professionele IT-ondersteuning en project management.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/auth"
      signUpUrl="/auth"
      signInFallbackRedirectUrl="/post-auth"
      signUpFallbackRedirectUrl="/post-auth"
    >
      <html lang="nl">
        <head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
          <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
          <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
