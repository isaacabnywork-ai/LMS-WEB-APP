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
    totalTeachers,
    totalCourses,
    totalEnrollments
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.course.count(),
    prisma.enrolment.count()
  ]);

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
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true
    }
  });

  return users;
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
