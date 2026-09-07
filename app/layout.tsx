import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BatchFlow — Reliable Image Processing",
  description:
    "A proof-of-work batch image processing UI with partial failure recovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
