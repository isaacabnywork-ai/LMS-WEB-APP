import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateQuizClient from "./CreateQuizClient";

export default async function TeacherQuizCreatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch courses owned by this teacher
  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" }
  });

  return <CreateQuizClient courses={courses} />;
}
