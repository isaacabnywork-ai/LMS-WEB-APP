import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CourseDetailClient, { CourseDetailProps } from "@/components/CourseDetailClient";
import { enrollInCourse, submitReview, deleteReview } from "@/app/actions/student";
import { createDiscussion, replyDiscussion } from "@/app/actions/course";

export default async function CatalogCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: true,
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          }
        }
      },
      enrolments: true,
      discussions: {
        include: {
          author: true,
          replies: { include: { author: true }, orderBy: { createdAt: "asc" } }
        },
        orderBy: { createdAt: "desc" }
      },
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!course) redirect("/student/catalog");

  // Check enrollment
  const enrolment = course.enrolments.find(e => e.userId === session.user.id);
  const isEnrolled = !!enrolment;
  const progress = enrolment?.progress || 0;

  // Check which lessons are completed
  const completedProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: { module: { courseId: course.id } },
      isCompleted: true
    },
    select: { lessonId: true }
  });
  const completedLessonIds = new Set(completedProgress.map(p => p.lessonId));

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const duration = `${Math.floor(totalLessons * 25 / 60)}h ${totalLessons * 25 % 60}m`; // Mock duration

  const averageRating = course.reviews.length > 0
    ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
    : 0;

  const courseProps: CourseDetailProps = {
    id: course.id,
    title: course.title,
    category: course.category,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    instructor: {
      name: course.instructor.name,
      avatar: course.instructor.name?.[0]?.toUpperCase() || "T",
      role: "Instructor"
    },
    rating: parseFloat(averageRating.toFixed(1)),
    reviewCount: course.reviews.length,
    enrolledCount: course.enrolments.length,
    duration: duration,
    lastUpdated: course.updatedAt.toLocaleDateString(),
    level: "All Levels",
    language: "English",
    certificate: true,
    progress: progress,
    isEnrolled: isEnrolled,
    skills: [course.category || "General"],
    modules: course.modules.map(m => ({
      id: m.id,
      title: m.title,
      duration: `${m.lessons.length * 25}m`,
      lessons: m.lessons.map(l => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: "25m",
        completed: completedLessonIds.has(l.id)
      }))
    })),
    discussions: course.discussions.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      author: {
        name: d.author.name || "Student",
        avatar: d.author.name?.[0]?.toUpperCase() || "S"
      },
      createdAt: d.createdAt.toLocaleDateString(),
      replies: d.replies.map(r => ({
        id: r.id,
        content: r.content,
        author: {
          name: r.author.name || "Student",
          avatar: r.author.name?.[0]?.toUpperCase() || "S"
        },
        createdAt: r.createdAt.toLocaleDateString()
      }))
    })),
    reviews: course.reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt.toLocaleDateString(),
      author: {
        id: r.user.id,
        name: r.user.name || "Student",
        avatar: r.user.name?.[0]?.toUpperCase() || "S"
      }
    })),
    currentUserId: session.user.id
  };

  const enrollAction = async () => {
    "use server";
    await enrollInCourse(courseId);
    redirect(`/learn/${courseId}`);
  };

  const createDiscussionAction = async (title: string, content: string) => {
    "use server";
    await createDiscussion(courseId, title, content);
  };

  const replyDiscussionAction = async (discussionId: string, content: string) => {
    "use server";
    await replyDiscussion(discussionId, courseId, content);
  };

  const submitReviewAction = async (rating: number, comment?: string) => {
    "use server";
    await submitReview(courseId, rating, comment);
  };

  const deleteReviewAction = async (reviewId: string) => {
    "use server";
    await deleteReview(reviewId, courseId);
  };

  return (
    <CourseDetailClient 
      course={courseProps} 
      onEnroll={enrollAction} 
      onCreateDiscussion={createDiscussionAction}
      onReplyDiscussion={replyDiscussionAction}
      onSubmitReview={submitReviewAction}
      onDeleteReview={deleteReviewAction}
    />
  );
}
