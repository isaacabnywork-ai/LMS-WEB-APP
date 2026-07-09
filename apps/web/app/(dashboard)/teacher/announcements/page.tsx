import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TeacherAnnouncementsClient from "./TeacherAnnouncementsClient";

export default async function TeacherAnnouncementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch teacher's courses from Moodle
  const { moodle } = await import('@/lib/moodle/client');
  const moodleCourses = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: session.user.id
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const courses = moodleCourses.map((c: any) => ({
    id: String(c.id),
    title: c.fullname,
    enrolmentCount: c.enrolledusercount || 0
  }));

  // Fetch past announcements (mocked for now, as Prisma Announcement model was dropped)
  const pastAnnouncements = [
    {
      id: "mock1",
      title: "Welcome to the course!",
      course: courses[0]?.title || "General Course",
      date: new Date().toLocaleDateString(),
      reach: courses[0]?.enrolmentCount || 0
    }
  ];

  return <TeacherAnnouncementsClient courses={courses} pastAnnouncements={pastAnnouncements} />;
}
