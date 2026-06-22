import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EditCourseForm } from "./client-form";

export default async function TeacherCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") {
    redirect("/");
  }

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.instructorId !== session.user.id) {
    return (
      <div className="p-8 text-center animate-slide-up">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-foreground/60">You do not have permission to edit this course.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up mt-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">Edit Course</h1>
        <p className="text-foreground opacity-60">Update details for {course.title}.</p>
      </div>

      <EditCourseForm course={course} />
    </div>
  );
}
