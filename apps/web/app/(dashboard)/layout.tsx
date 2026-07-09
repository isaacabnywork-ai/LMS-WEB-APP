import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = {
    ...session.user,
    name: session.user.name || "Student",
    image: session.user.image || null,
    role: session.user.role || "STUDENT"
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — hidden on mobile, fixed desktop */}
      <Sidebar user={user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header user={user} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile bottom nav */}
      <BottomNav user={user} />
    </div>
  );
}
