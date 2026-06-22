"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function updateProfile(data: { name?: string; bio?: string; phone?: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      bio: data.bio,
      phone: data.phone,
      image: data.image
    }
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function uploadProfileImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `profile-${session.user.id}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${fileName}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl }
  });

  revalidatePath("/settings");
  return { success: true, url: publicUrl };
}
