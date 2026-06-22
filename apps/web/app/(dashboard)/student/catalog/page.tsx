import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { enrollInCourse } from "@/app/actions/student";

export default async function StudentCatalog() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all published courses
  const allCourses = await prisma.course.findMany({
    where: { status: "published" },
    include: { instructor: true }
  });

  // Fetch student's current enrolments
  const enrolments = await prisma.enrolment.findMany({
    where: { userId: session.user.id },
    select: { courseId: true }
  });
  
  const enrolledCourseIds = new Set(enrolments.map(e => e.courseId));

  return (
    <div className="w-full animate-slide-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">Course Catalog</h1>
          <p className="text-foreground opacity-60 text-sm">Discover new skills and enroll in courses.</p>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {allCourses.length > 0 ? (
          allCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <div key={course.id} className="glass-panel rounded-2xl overflow-hidden glass-panel-hover flex flex-col h-full">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur dark:bg-slate-900/90 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-1 text-foreground leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs font-semibold opacity-60 mb-4">by {course.instructor.name}</p>
                  
                  <div className="mt-auto">
                    {isEnrolled ? (
                      <Link href={`/learn/${course.id}`} className="w-full py-2.5 rounded-xl border border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm transition-all flex justify-center">
                        Go to Course
                      </Link>
                    ) : (
                      <form action={async () => {
                        "use server";
                        await enrollInCourse(course.id);
                      }}>
                        <button type="submit" className="w-full py-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-600 font-bold text-sm transition-all shadow-md">
                          Enroll Now
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
            <p className="text-xl font-bold">No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
