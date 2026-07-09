import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hydroponicity.com"),
  title: {
    default: "Hydroponicity: Nutrient calculator for side-hustle growers",
    template: "%s · Hydroponicity",
  },
  description:
    "Free hydroponics calculators and a real multi-salt nutrient recipe solver: EC to ppm, VPD, fertilizer label decoder, and more. No signup needed.",
  applicationName: "Hydroponicity",
  keywords: [
    "hydroponics nutrient calculator",
    "EC to ppm converter",
    "fertilizer label decoder",
    "recipe solver",
    "hydroponics",
  ],
  openGraph: {
    type: "website",
    siteName: "Hydroponicity",
    title: "Hydroponicity: Nutrient calculator for side-hustle growers",
    description:
      "A real multi-salt recipe solver, source-water correction, and ion balance: research-grade math with an operator-friendly surface.",
    url: "/",
    images: [{ url: "/og.svg", width: 1200, height: 630, type: "image/svg+xml" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hydroponicity",
    description:
      "An advanced recipe-solving engine, made simple. Built for side-hustle growers.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
