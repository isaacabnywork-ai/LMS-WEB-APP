import React from "react";
import { Header } from "@/components/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Slim Header for the Player */}
      <Header user={user} />

      {/* Main player content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
