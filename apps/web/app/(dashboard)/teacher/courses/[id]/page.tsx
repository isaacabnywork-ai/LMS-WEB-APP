import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CurriculumBuilder } from "@/components/CurriculumBuilder";
import { toggleCourseStatus, deleteCourse } from "@/app/actions/teacher";
import { DeleteCourseButton } from "@/components/DeleteCourseButton";

export default async function TeacherCourseViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: { enrolments: true },
      },
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" } },
          assignments: { orderBy: { position: "asc" } },
          quizzes: { orderBy: { position: "asc" } }
        }
      },
      discussions: {
        include: { author: true, replies: true },
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!course || course.instructorId !== session.user.id) {
    return (
      <div className="p-8 text-center animate-slide-up">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-foreground/60 mb-6">The course you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/teacher/courses" className="text-teal-500 hover:underline">
          &larr; Back to Courses
        </Link>
      </div>
    );
  }

  const isPublished = course.status === "published";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-slide-up">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Courses
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/teacher/courses/${course.id}/edit`} className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold py-2 px-5 rounded-xl transition-all border border-black/10 dark:border-white/10">
              Edit Course
            </Link>
            <DeleteCourseButton courseId={course.id} />
            <form action={async () => {
              "use server";
              await toggleCourseStatus(course.id);
            }}>
              <button type="submit" className={`font-semibold py-2 px-5 rounded-xl transition-all shadow-lg ${isPublished ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" : "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20"}`}>
                {isPublished ? "Unpublish" : "Publish Now"}
              </button>
            </form>
          </div>
        </div>

        {/* Course Header Banner */}
        <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border border-white/10 group">
          <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border ${isPublished ? "bg-teal-500/30 border-teal-400/50 text-teal-200" : "bg-amber-500/30 border-amber-400/50 text-amber-200"}`}>
                {isPublished ? "● Published" : "○ Draft"}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                {course.category || "Uncategorized"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">{course.title}</h1>
          </div>
        </div>

        {/* Course Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">About This Course</h2>
              <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">{course.description || "No description provided."}</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <CurriculumBuilder 
                courseId={course.id} 
                initialModules={course.modules.map(m => ({
                  id: m.id,
                  title: m.title,
                  position: m.position,
                  items: [
                    ...m.lessons.map(l => ({ id: l.id, title: l.title, type: l.type.toUpperCase(), contentUrl: l.contentUrl, position: l.position })),
                    ...m.assignments.map(a => ({ id: a.id, title: a.title, type: "ASSIGNMENT", position: a.position })),
                    ...m.quizzes.map(q => ({ id: q.id, title: q.title, type: "EXAM", position: q.position }))
                  ].sort((a, b) => a.position - b.position)
                }))} 
              />
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">Course Discussions</h2>
              {course.discussions && course.discussions.length > 0 ? (
                <div className="space-y-4">
                  {course.discussions.map(d => (
                    <div key={d.id} className="p-4 border border-foreground/10 rounded-xl bg-black/5 dark:bg-white/5">
                      <h3 className="font-bold">{d.title}</h3>
                      <p className="text-sm opacity-70 mb-2">{d.content}</p>
                      <div className="text-xs text-foreground/50">By {d.author.name} · {d.replies.length} replies</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/50 text-sm">No discussions yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-500 flex flex-shrink-0 items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">Enrolled</p>
                <p className="text-3xl font-extrabold">{course._count.enrolments}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex flex-shrink-0 items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-1">Created On</p>
                <p className="text-lg font-bold">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
