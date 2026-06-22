"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/app/actions/teacher";

export function CreateAssignmentForm({ courses }: { courses: { id: string, title: string }[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const courseId = formData.get("courseId") as string;
    const maxScoreStr = formData.get("maxScore") as string;

    const dueDateStr = formData.get("dueAt") as string;
    const dueAt = dueDateStr ? new Date(dueDateStr) : undefined;

    if (!courseId) {
      setError("Please select a course.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createAssignment({ 
        title, 
        description, 
        courseId, 
        maxScore: parseInt(maxScoreStr, 10),
        dueAt
      });
      if (result.success) {
        router.push("/teacher/assignments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create assignment");
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-panel p-10 rounded-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="text-red-500 font-semibold">{error}</div>}
        
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Course</label>
          <select 
            name="courseId" 
            required
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium appearance-none"
          >
            <option value="">Select a course...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Assignment Title</label>
          <input 
            name="title"
            type="text" 
            required
            placeholder="e.g. Build a RESTful API" 
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Detailed Instructions</label>
          <textarea 
            name="description"
            rows={6}
            required
            placeholder="Provide step-by-step instructions and requirements..." 
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Total Points</label>
            <input 
              name="maxScore"
              type="number" 
              defaultValue="100" 
              required
              min="1"
              className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Due Date & Time (Optional)</label>
            <input 
              name="dueAt"
              type="datetime-local" 
              className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-foreground/10 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-8 py-4 rounded-xl font-bold opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
