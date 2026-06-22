"use client";

import React, { useState } from "react";
import { createAnnouncement } from "@/app/actions/teacher";

export default function TeacherAnnouncementsClient({
  courses,
  pastAnnouncements
}: {
  courses: { id: string; title: string; enrolmentCount: number }[];
  pastAnnouncements: { id: string; title: string; course: string; date: string; reach: number }[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCourse = courses.find(c => c.id === courseId);
  const reach = selectedCourse ? selectedCourse.enrolmentCount : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      await createAnnouncement({ courseId, title, content });
      setTitle("");
      setContent("");
      alert("Announcement broadcasted successfully!");
    } catch (err: any) {
      alert("Failed to broadcast: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up mt-10 pb-20">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight mb-2">Broadcast Announcement</h1>
        <p className="text-foreground opacity-60">Instantly notify your students about updates, deadlines, or general news.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-panel p-4 sm:p-8 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Target Course</label>
                <select 
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium appearance-none"
                  required
                >
                  <option value="" disabled>Select a Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Announcement Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Keep it clear and concise..." 
                  required
                  className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Message Body</label>
                <div className="border border-foreground/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                  <div className="bg-black/5 dark:bg-white/5 border-b border-foreground/10 p-3 flex space-x-2">
                    <button type="button" className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></button>
                    <button type="button" className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors font-bold text-serif">B</button>
                    <button type="button" className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors italic font-serif">I</button>
                  </div>
                  <textarea 
                    rows={8}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your announcement here..." 
                    className="w-full bg-transparent px-6 py-4 focus:outline-none font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center space-x-2 text-sm opacity-70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span>Will notify ~{reach} students</span>
                </div>
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                  <span>{isLoading ? "Sending..." : "Send Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-xl font-heading">Recent Broadcasts</h3>
          {pastAnnouncements.length === 0 ? (
            <p className="opacity-50 text-sm">No recent broadcasts.</p>
          ) : pastAnnouncements.map((ann) => (
            <div key={ann.id} className="glass-panel p-4 sm:p-6 rounded-2xl hover:border-teal-500/30 transition-colors cursor-pointer group">
              <h4 className="font-bold mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{ann.title}</h4>
              <p className="text-sm opacity-60 mb-4">{ann.course}</p>
              <div className="flex justify-between items-center text-xs font-semibold opacity-50 uppercase tracking-wider">
                <span>{ann.date}</span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <span>{ann.reach} views</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
