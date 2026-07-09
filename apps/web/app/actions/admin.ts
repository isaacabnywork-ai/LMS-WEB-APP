"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper to ensure only admins can perform these actions
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") throw new Error("Forbidden: Admin access required");
  
  return user;
}

export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalStudents,
    totalTeachers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } })
  ]);

  // Models Course and Enrolment have been moved to Moodle/dropped from Prisma
  const totalCourses = 0; 
  const totalEnrollments = 0;

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments
  };
}

export async function getAllUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  // Since name and image are now in Moodle, we'll map dummy values or parse email 
  // until Moodle WS integration for users is built.
  return users.map(user => ({
    ...user,
    name: user.email ? user.email.split('@')[0] : "Unknown User",
    image: null
  }));
}

export async function updateUserRole(userId: string, newRole: string) {
  await requireAdmin();

  if (!["student", "teacher", "admin"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function publishAnnouncement(title: string, content: string) {
  const admin = await requireAdmin();

  // The Course and Announcement models have been migrated to Moodle.
  // Until Moodle Forums are fully integrated via WS, we'll just mock success.
  console.log(`Announcement published by ${admin.email}: ${title}`);

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/teacher/dashboard");
  
  return { 
    success: true, 
    announcement: { 
      id: "mock_id", 
      title, 
      content, 
      createdAt: new Date() 
    } 
  };
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  // If integrating heavily with Moodle, we would call 'core_user_delete_users' here.
  // For now, we delete from the local database.
  
  // Note: Since cascade deleting can be dangerous, we just delete the user record.
  // If there are relations, Prisma will throw unless onDelete: Cascade is configured in schema.
  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
