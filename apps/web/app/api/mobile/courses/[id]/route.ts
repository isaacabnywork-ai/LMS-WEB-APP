import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        instructor: {
          select: {
            name: true,
            image: true,
            bio: true,
          },
        },
        modules: {
          where: {
            isPublished: true,
          },
          orderBy: {
            position: "asc",
          },
          include: {
            lessons: {
              where: {
                isPublished: true,
              },
              orderBy: {
                position: "asc",
              },
            },
            quizzes: {
              orderBy: {
                position: "asc",
              },
            },
            assignments: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
        _count: {
          select: {
            enrolments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Only allow access to published courses via this public/mobile API
    if (course.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Course is not available" },
        { status: 403 }
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
