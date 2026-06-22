"use client";

import React, { useState } from "react";

export type DiscussionType = {
  id: string;
  title: string;
  content: string;
  author: { name: string; avatar: string };
  createdAt: string;
  replies: {
    id: string;
    content: string;
    author: { name: string; avatar: string };
    createdAt: string;
  }[];
};

export default function CourseDiscussions({
  discussions = [],
  onCreateDiscussion,
  onReplyDiscussion
}: {
  discussions?: DiscussionType[];
  onCreateDiscussion?: (title: string, content: string) => Promise<void>;
  onReplyDiscussion?: (discussionId: string, content: string) => Promise<void>;
}) {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !onCreateDiscussion) return;
    setIsSubmitting(true);
    try {
      await onCreateDiscussion(newThreadTitle, newThreadContent);
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!replyContent.trim() || !onReplyDiscussion) return;
    try {
      await onReplyDiscussion(discussionId, replyContent);
      setReplyContent("");
      setReplyingTo(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Create New Thread */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-teal-500/20 shadow-sm">
        <h3 className="text-xl font-bold font-heading text-foreground mb-4">Start a new discussion</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            placeholder="Discussion Title"
            value={newThreadTitle}
            onChange={e => setNewThreadTitle(e.target.value)}
            required
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
          />
          <textarea
            rows={4}
            placeholder="What's on your mind? Ask a question or share an insight..."
            value={newThreadContent}
            onChange={e => setNewThreadContent(e.target.value)}
            required
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Thread"}
          </button>
        </form>
      </div>

      {/* Thread List */}
      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center py-10 opacity-50">No discussions yet. Be the first to start one!</div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion.id} className="glass-panel p-5 sm:p-6 rounded-2xl border border-foreground/10">
              {/* Thread OP */}
              <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                  {discussion.author.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-foreground">{discussion.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
                    <span className="font-semibold text-foreground/70">{discussion.author.name}</span>
                    <span>&bull;</span>
                    <span>{discussion.createdAt}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
                </div>
              </div>

              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="mt-4 ml-4 sm:ml-12 pl-4 border-l-2 border-foreground/10 space-y-4">
                  {discussion.replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-bold flex-shrink-0 text-xs">
                        {reply.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-1">
                          <span className="font-semibold text-foreground/70">{reply.author.name}</span>
                          <span>&bull;</span>
                          <span>{reply.createdAt}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="mt-4 ml-4 sm:ml-12">
                {replyingTo === discussion.id ? (
                  <div className="flex gap-2 items-start mt-2">
                    <textarea
                      rows={2}
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="flex-1 bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                    />
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleReply(discussion.id)}
                        className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600"
                      >
                        Reply
                      </button>
                      <button 
                        onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                        className="px-3 py-1.5 bg-foreground/10 text-foreground rounded-lg text-xs font-bold hover:bg-foreground/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setReplyingTo(discussion.id)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
