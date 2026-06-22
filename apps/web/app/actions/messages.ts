"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function sendMessage(receiverId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content,
    }
  });

  revalidatePath("/messages");
  return { success: true };
}

export async function markMessagesAsRead(senderId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.message.updateMany({
    where: {
      senderId: senderId,
      receiverId: session.user.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  revalidatePath("/messages");
}
