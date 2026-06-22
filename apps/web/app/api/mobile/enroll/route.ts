import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Basic JWT verification placeholder - this would use a real JWT verifier in production
    // For now we'll accept the userId directly from the body for rapid prototyping
    const body = await req.json();
    const { courseId, userId } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (courseId, userId)" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrolment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrolment.create({
      data: {
        userId,
        courseId,
        progress: 0,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("[MOBILE_ENROLL_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
