"use client";

import { useState } from "react";
import { publishAnnouncement } from "@/app/actions/admin";

export function AnnouncementPublisher() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;
    
    setLoading(true);
    setSuccess(false);
    
    try {
      await publishAnnouncement(title, content);
      setSuccess(true);
      setTitle("");
      setContent("");
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to publish announcement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm h-full">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        Broadcast Announcement
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Publish a message to all users on the platform.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. Scheduled Maintenance Notice"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            Message
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
            placeholder="Type your message here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title || !content}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish to All Users"}
        </button>

        {success && (
          <p className="text-sm text-teal-600 dark:text-teal-400 font-bold text-center bg-teal-50 dark:bg-teal-500/10 py-2 rounded-lg">
            ✅ Announcement published successfully!
          </p>
        )}
      </form>
    </div>
  );
}
