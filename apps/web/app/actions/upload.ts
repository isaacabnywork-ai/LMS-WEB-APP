"use server";

import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function uploadFile(formData: FormData, folder: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file uploaded");
  }

  // Ensure public/uploads/{folder} exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create a unique filename
  const extension = file.name.split(".").pop();
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Convert File to Buffer and write to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Return the public URL path
  return `/uploads/${folder}/${uniqueName}`;
}
