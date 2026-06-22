"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { sendEmail } from "@/lib/email";

export async function registerUser(data: { name: string; username: string; email: string; password: string; role: "student" | "teacher" | "admin" }) {
  if (!data.email || !data.password || !data.name || !data.username) {
    throw new Error("Missing required fields");
  }

  const existingUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: data.email },
        { username: data.username }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new Error("Email is already registered");
    }
    if (existingUser.username === data.username) {
      throw new Error("Username is already taken");
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
    }
  });

  return { success: true };
}
