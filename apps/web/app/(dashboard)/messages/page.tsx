import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;

  // For this MVP, we fetch all other users. In a large app, we would restrict this to shared courses.
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    select: { id: true, name: true, image: true, role: true }
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name || "Unknown User",
    image: u.image,
    role: u.role
  }));

  const formattedMessages = messages.map(m => ({
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt ? m.readAt.toISOString() : null
  }));

  return <MessagesClient currentUserId={userId} users={formattedUsers} initialMessages={formattedMessages} />;
}
