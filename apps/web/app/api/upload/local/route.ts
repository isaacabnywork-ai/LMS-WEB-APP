import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";

// This file is ONLY used as a fallback if S3 keys are not provided.
// It accepts a raw PUT request with binary body and writes to /public/uploads
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    if (!filename) {
      return new NextResponse("Missing filename", { status: 400 });
    }

    const buffer = Buffer.from(await req.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Local upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
