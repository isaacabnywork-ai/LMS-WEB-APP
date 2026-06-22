import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconStar = ({ filled = true }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const IconDollar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
const IconTrendUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
const IconAward = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
);
const IconCreditCard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
const IconGraduate = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);

// ─── Components ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bgColor }: { label: string; value: string; icon: React.ReactNode; color: string; bgColor: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor} ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const isPublished = course.status === "published";
  const studentsCount = course._count.enrolments;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border ${isPublished ? "bg-teal-500/20 border-teal-400/40 text-teal-300" : "bg-amber-500/20 border-amber-400/40 text-amber-300"}`}>
          {isPublished ? "● Published" : "○ Draft"}
        </span>
        <span className="absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 border border-white/10">
          {course.category || "Uncategorized"}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-foreground text-base leading-snug mb-1.5 line-clamp-1">{course.title}</h3>
        <p className="text-sm text-foreground/55 leading-relaxed line-clamp-2 mb-4 flex-1">{course.description || "No description provided."}</p>
        
        <div className="flex items-center gap-4 mb-4 pt-3 border-t border-black/5 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-foreground/60 text-xs">
            <span className="text-teal-500"><IconUsers /></span>
            <span className="font-semibold text-foreground/80">{studentsCount}</span>
            <span>students</span>
          </div>
        </div>

        <p className="text-[11px] text-foreground/40 mb-4">Updated {new Date(course.updatedAt).toLocaleDateString()}</p>

        <div className="flex gap-2">
          <Link href={`/teacher/courses/${course.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-200">
            <IconEdit /> Edit
          </Link>
          <Link href={`/teacher/courses/${course.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground/70 hover:text-foreground border border-black/10 dark:border-white/10 transition-all duration-200">
            <IconEye /> View
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6"><IconGraduate /></div>
      <h3 className="text-xl font-bold text-foreground mb-2">No courses yet</h3>
      <p className="text-foreground/50 text-sm max-w-xs mb-8">Create your first course and start sharing your knowledge with students around the world.</p>
      <Link href="/teacher/courses/create" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02]">
        <IconPlus /> Create Your First Course
      </Link>
    </div>
  );
}

// ─── Main Page (Server Component) ─────────────────────────────────────────────
export default async function TeacherCoursesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { status } = await searchParams;
  const filterStatus = status || "all";

  // Fetch from Prisma
  const allCourses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: { 
      _count: { select: { enrolments: true } },
      reviews: { select: { rating: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const filteredCourses = allCourses.filter(c => filterStatus === "all" || c.status === filterStatus);

  let totalRatingSum = 0;
  let totalReviews = 0;
  
  const totalStudents = allCourses.reduce((sum, c) => sum + c._count.enrolments, 0);
  const publishedCount = allCourses.filter(c => c.status === "published").length;
  const draftCount = allCourses.length - publishedCount;

  allCourses.forEach(c => {
    c.reviews.forEach(r => {
      totalRatingSum += r.rating;
      totalReviews++;
    });
  });
  const avgRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-slide-up">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">Manage Courses</h1>
            <p className="text-foreground/50 text-sm mt-1">Create, edit, and track the performance of your courses.</p>
          </div>
          <Link href="/teacher/courses/create" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto w-full sm:w-auto justify-center">
            <IconPlus /> Create New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Courses" value={String(allCourses.length)} icon={<IconBook />} color="text-teal-500 dark:text-teal-400" bgColor="bg-teal-500/15" />
          <StatCard label="Published" value={String(publishedCount)} icon={<IconAward />} color="text-sky-500 dark:text-sky-400" bgColor="bg-sky-500/15" />
          <StatCard label="Total Students" value={totalStudents.toLocaleString()} icon={<IconUsers />} color="text-amber-500 dark:text-amber-400" bgColor="bg-amber-500/15" />
          <StatCard label="Avg Rating" value={`${avgRating}★`} icon={<IconStar />} color="text-violet-500 dark:text-violet-400" bgColor="bg-violet-500/15" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-fit">
            {[
              { id: "all", label: "All", count: allCourses.length },
              { id: "published", label: "Published", count: publishedCount },
              { id: "draft", label: "Draft", count: draftCount },
            ].map((f) => (
              <Link
                key={f.id}
                href={`?status=${f.id}`}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterStatus === f.id
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {f.label} <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
