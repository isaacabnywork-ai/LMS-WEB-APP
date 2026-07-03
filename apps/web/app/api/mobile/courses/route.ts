import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: "published",
      },
      include: {
        instructor: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            enrolments: true,
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("[MOBILE_COURSES_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
