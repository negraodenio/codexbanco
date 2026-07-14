import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodexBanco Evidence Intelligence",
  description: "Banking document fraud and decision intelligence platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}

