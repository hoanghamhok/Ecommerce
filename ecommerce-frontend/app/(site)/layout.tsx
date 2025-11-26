import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar"; // ✅ Import navbar
import UserSidebar from "@/components/UserSidebar"; // ✅ Import UserSidebar
import Footer from "@/components/Footer"; // ✅ Import footer
import FloatingChatbot from "@/components/ChatbotAdvisorBox"; // ✅ Import FloatingChatbot
<meta charSet="UTF-8" />

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoCart - Trang thương mại điện tử",
  description: "Website bán hàng Next.js + ASP.NET",
};

// app/site/layout.tsx
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 min-h-screen p-4">{children}</main>
      </div>
      <Footer />
      <FloatingChatbot />
    </>
  );
}


