import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Return mock courses for mobile API as Prisma Course model was dropped
    const courses = [
      {
        id: "mock-1",
        title: "Mock Course",
        status: "published",
        instructor: { name: "Mock Instructor", image: null },
        _count: { enrolments: 0, modules: 0 },
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("[MOBILE_COURSES_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
