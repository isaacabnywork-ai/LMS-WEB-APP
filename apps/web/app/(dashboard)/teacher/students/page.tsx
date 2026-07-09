import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentsClient, { Student } from "./StudentsClient";

export default async function TeacherStudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all courses taught by this teacher from Moodle (mocked for now)
  // In a real implementation:
  // const courses = await moodle.call('core_enrol_get_users_courses', { userid: session.user.id });
  // Then core_enrol_get_enrolled_users for each course to get students.
  
  const AVATAR_COLORS = [
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-teal-500",
    "from-indigo-500 to-blue-600"
  ];

  // Mocking the student list since Prisma models were dropped
  const studentsData: Student[] = [
    {
      id: "3",
      name: "student",
      email: "student@edunova.com",
      coursesEnrolled: 1,
      progress: 45,
      lastActive: new Date().toISOString(),
      status: "Active",
      avatarColor: AVATAR_COLORS[0]
    },
    {
      id: "101",
      name: "Alice Johnson",
      email: "alice@example.com",
      coursesEnrolled: 2,
      progress: 90,
      lastActive: new Date().toISOString(),
      status: "Active",
      avatarColor: AVATAR_COLORS[1]
    },
    {
      id: "102",
      name: "Bob Smith",
      email: "bob@example.com",
      coursesEnrolled: 1,
      progress: 25,
      lastActive: new Date().toISOString(),
      status: "At Risk",
      avatarColor: AVATAR_COLORS[2]
    }
  ];

  return <StudentsClient mockStudents={studentsData} />;
}
