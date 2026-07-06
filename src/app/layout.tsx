import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hydroponics Nutrient Calculator for Side-Hustle Growers",
    template: "%s · Hydroponics Hub",
  },
  description:
    "An advanced recipe-solving engine, made simple. Free EC-to-ppm converter, fertilizer label decoder, and a real multi-salt nutrient recipe solver for small hydroponics operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
