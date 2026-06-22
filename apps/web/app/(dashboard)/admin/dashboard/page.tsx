import { getPlatformStats } from "@/app/actions/admin";
import { EngagementChart } from "@/components/AdminCharts";
import { AnnouncementPublisher } from "@/components/AnnouncementPublisher";
import { Users, BookOpen, GraduationCap, FileText } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Students</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {stats.totalStudents}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Teachers</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {stats.totalTeachers}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Courses</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {stats.totalCourses}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Enrollments</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {stats.totalEnrollments}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Engagement Overview
              </h2>
              <p className="text-sm text-slate-500">Signups and course completions over time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                <span className="text-sm text-slate-500">Signups</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-sm text-slate-500">Completions</span>
              </div>
            </div>
          </div>
          <EngagementChart />
        </div>
        
        <div className="lg:col-span-1">
          <AnnouncementPublisher />
        </div>
      </div>
    </div>
  );
}
