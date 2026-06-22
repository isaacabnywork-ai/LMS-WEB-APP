import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/");

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Account Settings</h1>
      <SettingsClient 
        user={{
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          phone: user.phone || "",
          image: user.image || "",
          role: user.role
        }} 
      />
    </div>
  );
}
