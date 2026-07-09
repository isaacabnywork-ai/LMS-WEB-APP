import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateQuizClient from "./CreateQuizClient";

export default async function TeacherQuizCreatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch courses owned by this teacher from Moodle
  const { moodle } = await import('@/lib/moodle/client');
  const moodleCourses = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: session.user.id
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const courses = moodleCourses.map((c: any) => ({
    id: String(c.id),
    title: c.fullname
  }));

  return <CreateQuizClient courses={courses} />;
}
