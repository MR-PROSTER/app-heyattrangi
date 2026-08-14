import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Quicksand, Nunito } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Comprehensive mental health support platform connecting patients, caregivers, and therapists",
  icons: {
    icon: "/images/logo_light.png",
  },
};

import SessionProvider from "@/components/providers/SessionProvider";
import { auth } from "@/auth.config";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} ${nunito.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
