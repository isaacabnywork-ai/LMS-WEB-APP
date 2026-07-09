import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateAssignmentForm } from "./CreateAssignmentForm";

export default async function TeacherAssignmentCreatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch teacher's courses from Moodle
  const { moodle } = await import('@/lib/moodle/client');
  const moodleCourses = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: session.user.id
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const courses = moodleCourses.map((c: any) => ({
    id: String(c.id),
    title: c.fullname
  }));

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
