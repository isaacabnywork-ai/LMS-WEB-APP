"use client";

import React, { useState } from "react";
import Link from "next/link";
import CourseDiscussions, { DiscussionType } from "./CourseDiscussions";

// ─── Mock Data ────────────────────────────────────────────────────────────────

export type CourseDetailProps = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  instructor: { name: string | null; avatar: string; role: string };
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  duration: string;
  lastUpdated: string;
  level: string;
  language: string;
  certificate: boolean;
  progress: number;
  isEnrolled: boolean;
  skills: string[];
  modules: {
    id: string;
    title: string;
    duration: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: string;
      completed: boolean;
    }[];
  }[];
  discussions?: DiscussionType[];
  reviews?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    author: { id: string; name: string; avatar: string };
  }[];
  currentUserId?: string;
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const QuizIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${filled ? "text-amber-400" : "text-foreground opacity-20"}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CertificateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LevelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLessonIcon(type: string) {
  if (type === "video") return <VideoIcon />;
  if (type === "quiz") return <QuizIcon />;
  return <ReadingIcon />;
}

function getLessonColor(type: string) {
  if (type === "video") return "text-blue-500";
  if (type === "quiz") return "text-violet-500";
  return "text-amber-500";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} />
      ))}
    </div>
  );
}

// ─── Module Accordion Item ─────────────────────────────────────────────────────

function ModuleItem({
  module,
  index,
  isOpen,
  onToggle,
}: {
  module: CourseDetailProps["modules"][0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const completedCount = module.lessons.filter((l) => l.completed).length;
  const allDone = completedCount === module.lessons.length;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "border-teal-500/40 shadow-sm shadow-teal-500/10"
          : "border-foreground/10 hover:border-teal-500/30"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left bg-[var(--background)] hover:bg-teal-500/5 transition-colors"
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            allDone
              ? "bg-teal-500 text-white"
              : "bg-foreground/8 text-foreground/50"
          }`}
        >
          {allDone ? <CheckIcon /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug truncate">{module.title}</p>
          <p className="text-xs text-foreground/50 mt-0.5">
            {completedCount}/{module.lessons.length} lessons · {module.duration}
          </p>
        </div>
        {/* mini progress pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-foreground/50 flex-shrink-0">
          <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-700"
              style={{ width: `${(completedCount / module.lessons.length) * 100}%` }}
            />
          </div>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Lessons */}
      {isOpen && (
        <ul className="divide-y divide-foreground/5 border-t border-foreground/8">
          {module.lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={`flex items-center gap-3 px-5 py-3 group transition-colors ${
                lesson.completed
                  ? "bg-teal-500/4"
                  : "hover:bg-foreground/3 cursor-pointer"
              }`}
            >
              {/* type icon */}
              <span className={`${getLessonColor(lesson.type)}`}>
                {getLessonIcon(lesson.type)}
              </span>

              {/* title */}
              <span
                className={`flex-1 text-sm font-medium leading-snug ${
                  lesson.completed ? "text-foreground/50 line-through-none" : "text-foreground"
                }`}
              >
                {lesson.title}
              </span>

              {/* duration */}
              <span className="text-xs text-foreground/40 flex-shrink-0">{lesson.duration}</span>

              {/* completed check */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                  lesson.completed
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "border-foreground/20 group-hover:border-teal-400"
                }`}
              >
                {lesson.completed && <CheckIcon />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

const TABS = ["Overview", "Curriculum", "Discussion", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function CourseDetailClient({ 
  course, 
  onEnroll,
  onCreateDiscussion,
  onReplyDiscussion
}: { 
  course: CourseDetailProps;
  onEnroll: () => Promise<void>;
  onCreateDiscussion?: (title: string, content: string) => Promise<void>;
  onReplyDiscussion?: (discussionId: string, content: string) => Promise<void>;
  onSubmitReview?: (rating: number, comment?: string) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
}) {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<Tab>("Curriculum");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const completedLessons = course.modules.flatMap((m) => m.lessons).filter((l) => l.completed).length;
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;

  const handleEnroll = async () => {
    setIsEnrolling(true);
    await onEnroll();
    setIsEnrolling(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitReview) return;
    setIsSubmittingReview(true);
    try {
      await onSubmitReview(reviewRating, reviewComment);
      setReviewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const toggleModule = (idx: number) => {
    setOpenModule((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full animate-slide-up pb-16">

      {/* ── Back breadcrumb ── */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-teal-500 font-medium mb-6 transition-colors group"
      >
        <BackIcon />
        <span className="group-hover:underline hidden sm:inline">My Courses</span>
        <span className="group-hover:underline sm:hidden">Back</span>
      </Link>

      {/* ══════════════════════════════════════════════════════════
          COURSE HERO
      ══════════════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-2xl overflow-hidden mb-6">
        {/* gradient banner */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-400 flex items-end p-6 sm:p-8">
          {/* subtle texture overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          {/* category badge */}
          <div className="absolute top-5 left-6 sm:left-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold tracking-wide">
              {course.category}
            </span>
          </div>

          {/* level badge */}
          <div className="absolute top-5 right-6 sm:right-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur text-white text-xs font-semibold">
              {course.level}
            </span>
          </div>

          {/* title area */}
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white leading-tight drop-shadow-sm">
              {course.title}
            </h1>
          </div>
        </div>

        {/* hero bottom bar */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* instructor */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {course.instructor.avatar}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm">{course.instructor.name}</p>
              <p className="text-xs text-foreground/50 truncate">{course.instructor.role}</p>
            </div>
          </div>

          {/* rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={course.rating} />
            <span className="text-sm font-bold text-foreground">{course.rating}</span>
            <span className="text-xs text-foreground/40">({course.reviewCount.toLocaleString()})</span>
          </div>

          {/* enroll / continue button */}
          <div className="sm:ml-4">
            {course.isEnrolled ? (
              <Link href={`/learn/${course.id}`} className="inline-block w-full sm:w-auto px-7 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-95 text-center">
                Continue Learning
              </Link>
            ) : (
              <button onClick={handleEnroll} disabled={isEnrolling} className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all active:scale-95 disabled:opacity-50">
                {isEnrolling ? "Enrolling..." : "Enroll Now — Free"}
              </button>
            )}
          </div>
        </div>

        {/* progress bar — only if enrolled */}
        {course.isEnrolled && (
          <div className="px-6 sm:px-8 pb-5">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-foreground/60">Your progress</span>
              <span className="text-teal-500">{course.progress}% complete · {completedLessons}/{totalLessons} lessons</span>
            </div>
            <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000 ease-out relative"
                style={{ width: `${course.progress}%` }}
              >
                {/* shimmer */}
                <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TABS
      ══════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar border-b border-foreground/10 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? "border-teal-500 text-teal-500"
                : "border-transparent text-foreground/50 hover:text-foreground hover:border-foreground/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TWO-COLUMN LAYOUT
      ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Overview tab content */}
          {activeTab === "Overview" && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 animate-slide-up">
              <h2 className="text-xl font-bold font-heading text-foreground">About this course</h2>
              <p className="text-foreground/70 leading-relaxed">{course.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { label: "Duration", value: course.duration, icon: <ClockIcon /> },
                  { label: "Level", value: course.level, icon: <LevelIcon /> },
                  { label: "Language", value: course.language, icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  )},
                  { label: "Updated", value: course.lastUpdated, icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-teal-500">
                      <path d="M3 12a9 9 0 109 9" />
                      <polyline points="3 8 3 12 7 12" />
                    </svg>
                  )},
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-foreground/4">
                    {item.icon}
                    <p className="text-xs text-foreground/50 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum tab content */}
          {activeTab === "Curriculum" && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold font-heading text-foreground">Course Curriculum</h2>
                <p className="text-sm text-foreground/50">
                  {course.modules.length} modules · {totalLessons} lessons
                </p>
              </div>
              {course.modules.map((module, idx) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  index={idx}
                  isOpen={openModule === idx}
                  onToggle={() => toggleModule(idx)}
                />
              ))}
            </div>
          )}

          {/* Discussion placeholder */}
          {activeTab === "Discussion" && (
            <CourseDiscussions 
              discussions={course.discussions} 
              onCreateDiscussion={onCreateDiscussion} 
              onReplyDiscussion={onReplyDiscussion} 
            />
          )}

          {/* Reviews content */}
          {activeTab === "Reviews" && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 animate-slide-up space-y-8">
              <h2 className="text-xl font-bold font-heading text-foreground">Student Reviews</h2>
              
              {/* Aggregate Rating */}
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                <div className="text-center">
                  <p className="text-6xl font-extrabold text-teal-500">{course.rating}</p>
                  <StarRating rating={course.rating} />
                  <p className="text-xs text-foreground/50 mt-1">{course.reviewCount.toLocaleString()} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5 hidden sm:block">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = course.reviews?.filter(r => r.rating === star).length || 0;
                    const pct = course.reviews?.length ? Math.round((count / course.reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-foreground/50 w-4 text-right">{star}</span>
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-400" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-foreground/40 w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review Form */}
              {course.isEnrolled && onSubmitReview && (
                <div className="border border-foreground/10 rounded-2xl p-5 bg-background/50">
                  <h3 className="font-bold text-sm mb-3">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground/70 mb-2 block">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`p-1 transition-transform hover:scale-110 ${reviewRating >= star ? "text-amber-400" : "text-foreground/20"}`}
                          >
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill={reviewRating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground/70 mb-2 block">Comment (Optional)</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of the course?"
                        className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isSubmittingReview} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all disabled:opacity-50">
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6 mt-6">
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((rev) => (
                    <div key={rev.id} className="border-t border-foreground/8 pt-6 group relative">
                      {course.currentUserId === rev.author.id && onDeleteReview && (
                        <button 
                          onClick={() => onDeleteReview(rev.id)}
                          className="absolute top-6 right-0 text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                          {rev.author.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{rev.author.name}</p>
                          <p className="text-xs text-foreground/40">{rev.createdAt}</p>
                        </div>
                        <div className="ml-auto"><StarRating rating={rev.rating} /></div>
                      </div>
                      {rev.comment && <p className="text-sm text-foreground/70 leading-relaxed bg-foreground/3 p-4 rounded-xl">{rev.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/50 text-sm text-center py-8">No reviews yet. Be the first to review this course!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR (1/3) ── */}
        <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6 space-y-4 order-last lg:order-none">

          {/* Course Info Card */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            {/* mini banner */}
            <div className="h-28 bg-gradient-to-br from-teal-500 to-cyan-400 relative flex items-center justify-center">
              <span className="text-5xl font-black text-white/20 select-none">RN</span>
              <div className="absolute bottom-3 left-3">
                <span className="text-xs font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">{course.category}</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* rating row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={course.rating} />
                  <span className="text-sm font-bold text-foreground ml-0.5">{course.rating}</span>
                </div>
                <span className="text-xs text-foreground/50">{course.reviewCount.toLocaleString()} reviews</span>
              </div>

              {/* stats */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <UsersIcon />
                  <div>
                    <p className="text-xs text-foreground/50">Students enrolled</p>
                    <p className="text-sm font-bold text-foreground">{course.enrolledCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon />
                  <div>
                    <p className="text-xs text-foreground/50">Total duration</p>
                    <p className="text-sm font-bold text-foreground">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LevelIcon />
                  <div>
                    <p className="text-xs text-foreground/50">Skill level</p>
                    <p className="text-sm font-bold text-foreground">{course.level}</p>
                  </div>
                </div>
                {course.certificate && (
                  <div className="flex items-center gap-3">
                    <CertificateIcon />
                    <div>
                      <p className="text-xs text-foreground/50">Certificate</p>
                      <p className="text-sm font-bold text-teal-500">Included on completion</p>
                    </div>
                  </div>
                )}
              </div>

              {/* divider */}
              <div className="border-t border-foreground/10 pt-4">
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">Skills you&apos;ll gain</p>
                <div className="flex flex-wrap gap-1.5">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {course.isEnrolled ? (
                <Link href={`/learn/${course.id}`} className="block w-full text-center py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-95 mt-1">
                  Continue Learning
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={isEnrolling} className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-95 mt-1 disabled:opacity-50">
                  {isEnrolling ? "Enrolling..." : "Enroll for Free"}
                </button>
              )}

              {course.isEnrolled && (
                <div className="text-center">
                  <div className="flex justify-between text-xs font-medium text-foreground/50 mb-1.5">
                    <span>Progress</span>
                    <span className="text-teal-500 font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructor mini card */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Your Instructor</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                {course.instructor.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm">{course.instructor.name}</p>
                <p className="text-xs text-foreground/50 truncate">{course.instructor.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <StarRating rating={course.rating} />
              <span className="text-xs font-semibold text-foreground/70">{course.rating} instructor rating</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
