"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createDiscussion(courseId: string, title: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.discussion.create({
    data: {
      courseId,
      title,
      content,
      authorId: session.user.id
    }
  });

  revalidatePath(`/student/catalog/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function replyDiscussion(discussionId: string, courseId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.discussionReply.create({
    data: {
      discussionId,
      content,
      authorId: session.user.id
    }
  });

  revalidatePath(`/student/catalog/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}
