import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dennisfx - Deriv Dashboard",
  description: "Custom Deriv trading dashboard by Dennis",
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
