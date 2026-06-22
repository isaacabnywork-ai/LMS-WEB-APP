import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateAssignmentForm } from "./CreateAssignmentForm";

export default async function TeacherAssignmentCreatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch teacher's courses
  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true, title: true }
  });

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up mt-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">New Assignment</h1>
        <p className="text-foreground opacity-60">Create a task to evaluate your students' practical skills.</p>
      </div>

      <CreateAssignmentForm courses={courses} />
    </div>
  );
}
