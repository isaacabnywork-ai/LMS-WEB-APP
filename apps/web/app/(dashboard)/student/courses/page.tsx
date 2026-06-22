import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentCourses({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { tab } = await searchParams;
  const activeTab = tab || "all";

  // Fetch student's enrolments
  const enrolments = await prisma.enrolment.findMany({
    where: { userId: session.user.id },
    include: { course: true }
  });

  const courses = enrolments.map(e => ({
    ...e.course,
    progress: e.progress
  }));

  const tabs = [
    { id: "all", label: "All" },
    { id: "in-progress", label: "In progress" },
    { id: "completed", label: "Completed" },
  ];

  const filteredCourses = courses.filter(c => {
    if (activeTab === "in-progress") return c.progress < 100;
    if (activeTab === "completed") return c.progress === 100;
    return true;
  });

  return (
    <div className="w-full animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">My Courses</h1>
          <p className="text-foreground opacity-60 text-sm">Course overview and progress tracking</p>
        </div>
        <Link href="/student/catalog" className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm w-full sm:w-auto text-center inline-block">
          Browse Catalog
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`?tab=${tab.id}`}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                  : "bg-black/5 dark:bg-white/5 text-foreground opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="glass-panel rounded-2xl overflow-hidden glass-panel-hover group flex flex-col h-full cursor-pointer">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={course.thumbnailUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur dark:bg-slate-900/90 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  {course.category}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-4 text-foreground leading-tight group-hover:text-teal-500 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="opacity-60">{course.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className="bg-teal-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <Link href={`/student/courses/${course.id}`} className="w-full py-2.5 rounded-xl border border-foreground/10 font-bold text-sm hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all flex justify-center">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p className="text-xl font-bold">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}
