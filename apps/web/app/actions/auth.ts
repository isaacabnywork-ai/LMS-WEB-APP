"use server";

import { prisma } from "@/lib/prisma";
import { moodle } from "@/lib/moodle/client";

export async function registerUser(data: { name: string; username: string; email: string; password: string; role: "student" | "teacher" | "admin" }) {
  if (!data.email || !data.password || !data.name || !data.username) {
    return { error: "Missing required fields" };
  }

  const isEmail = data.email.includes("@");
  const actualEmail = isEmail ? data.email : `${data.email}@student.edunova.com`;
  const actualUsername = isEmail ? data.email.split("@")[0].toLowerCase() : data.email.toLowerCase();
  
  // We use data.email variable which now holds either username or email
  const existingLocalUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: actualEmail },
        // Add a check in case we want to support usernames natively later
      ]
    }
  });

  if (existingLocalUser) {
    return { error: "This account is already registered locally" };
  }

  const firstName = data.name.split(" ")[0] || actualUsername;
  const lastName = data.name.split(" ").slice(1).join(" ") || "User";

  try {
    // 1. Create the user in Moodle
    const newUsers: any = await moodle.call('core_user_create_users', {
      'users[0][username]': actualUsername,
      'users[0][password]': data.password,
      'users[0][firstname]': firstName,
      'users[0][lastname]': lastName,
      'users[0][email]': actualEmail,
    }, { method: 'POST' });

    // Handle Moodle API exceptions which might not be thrown as HTTP errors
    if (newUsers && newUsers.exception) {
      return { error: newUsers.message || "Moodle exception occurred" };
    }

    if (!newUsers || !Array.isArray(newUsers) || !newUsers[0] || !newUsers[0].id) {
      return { error: "Moodle did not return a valid user ID." };
    }

    const newMoodleUserId = String(newUsers[0].id);

    // 2. Sync the mapping to our local Prisma database
    await prisma.user.create({
      data: {
        id: newMoodleUserId,
        email: actualEmail,
        role: data.role,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Moodle registration error:", error);
    return { error: error.message || "Failed to register user in Moodle" };
  }
}

