import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import UserSidebar from "@/components/UserSidebar";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/ChatbotAdvisorBox";

export const metadata: Metadata = {
  title: "GoCart - Ecommerce",
  description: "Ecommerce website built with Next.js and ASP.NET Core",
};

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
