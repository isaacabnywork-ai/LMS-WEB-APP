import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const fileExtension = filename.split(".").pop();
    const uniqueFilename = `${session.user.id}-${Date.now()}.${fileExtension}`;

    // LOCAL FALLBACK MODE
    // If S3 keys are not provided, we return a URL that points to our local Next.js server
    if (!process.env.S3_BUCKET_NAME || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      console.warn("⚠️ S3 credentials missing. Using local upload fallback.");
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.json({
        uploadUrl: `${origin}/api/upload/local?filename=${uniqueFilename}`,
        finalUrl: `/uploads/${uniqueFilename}`
      });
    }

    // REAL S3 UPLOAD MODE
    const s3 = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT, // Required for Cloudflare R2 / DigitalOcean
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
      // ACL: "public-read", // Uncomment if your bucket supports ACLs
    });

    // URL expires in 5 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Assuming the bucket is public and connected to a custom domain
    // If using R2, this would be your custom domain.
    const publicDomain = process.env.S3_PUBLIC_DOMAIN || `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com`;
    const finalUrl = `${publicDomain}/${uniqueFilename}`;

    return NextResponse.json({ uploadUrl, finalUrl });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
