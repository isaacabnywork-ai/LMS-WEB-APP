import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Return mock course for mobile API as Prisma Course model was dropped
    const course = {
      id: courseId,
      title: "Mock Course Details",
      status: "published",
      instructor: { name: "Mock Instructor", image: null, bio: "Mock Bio" },
      modules: [],
      _count: { enrolments: 0 },
      createdAt: new Date().toISOString()
    };

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("[MOBILE_COURSE_DETAILS_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
