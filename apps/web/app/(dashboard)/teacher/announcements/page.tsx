import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TeacherAnnouncementsClient from "./TeacherAnnouncementsClient";

export default async function TeacherAnnouncementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch teacher's courses
  const coursesData = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    select: {
      id: true,
      title: true,
      _count: { select: { enrolments: true } }
    }
  });

  const courses = coursesData.map(c => ({
    id: c.id,
    title: c.title,
    enrolmentCount: c._count.enrolments
  }));

  // Fetch past announcements
  const announcementsData = await prisma.announcement.findMany({
    where: { authorId: session.user.id },
    include: { course: { select: { title: true, _count: { select: { enrolments: true } } } } },
    orderBy: { createdAt: "desc" }
  });

  const pastAnnouncements = announcementsData.map(ann => ({
    id: ann.id,
    title: ann.title,
    course: ann.course.title,
    date: new Date(ann.createdAt).toLocaleDateString(),
    reach: ann.course._count.enrolments
  }));

  return <TeacherAnnouncementsClient courses={courses} pastAnnouncements={pastAnnouncements} />;
}
