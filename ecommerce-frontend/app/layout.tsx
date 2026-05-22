import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoCart - Ecommerce",
  description: "Ecommerce website built with Next.js and ASP.NET Core",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
