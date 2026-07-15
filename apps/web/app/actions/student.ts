"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { moodle } from "@/lib/moodle/client";

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    console.log("Enrolling with courseId:", courseId, "userid:", session.user.id);
    // Attempt manual enrolment via Moodle Admin token
    await moodle.call('enrol_manual_enrol_users', {
      'enrolments[0][roleid]': 5, // Standard student role ID
      'enrolments[0][userid]': session.user.id,
      'enrolments[0][courseid]': courseId
    });
  } catch (error: any) {
    // Moodle often throws 'Message was not sent' if email isn't configured, even though enrolment succeeded.
    if (error.message && error.message.includes('Message was not sent')) {
      console.log("Enrolment succeeded but Moodle email notification failed. Ignoring.");
    } else {
      console.error("Enrolment error:", error.message);
      return { success: false, error: `This course does not have Manual Enrolment enabled, or you are already enrolled. (${error.message})` };
    }
  }

  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses`);
  revalidatePath(`/student/catalog`);
  revalidatePath(`/student/dashboard`);
  return { success: true };
}

import { redirect } from "next/navigation";

export async function createStripeCheckout(courseId: string, courseTitle: string, courseSummary: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' as any });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: courseTitle,
            description: courseSummary.substring(0, 255) || "Moodle Course",
          },
          unit_amount: 4900, // $49.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/student/courses/${courseId}?success=true`,
    cancel_url: `${baseUrl}/student/catalog/${courseId}?canceled=true`,
    metadata: {
      userId: session.user.id,
      courseId: String(courseId),
    },
    customer_email: session.user.email || undefined,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}

export async function markLessonComplete(lessonId: string, courseId: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) throw new Error("Unauthorized");

  // In Moodle, completion is usually tied to a cmid (Course Module ID)
  // We assume lessonId here corresponds to the cmid in Moodle.
  try {
    await moodle.call('core_completion_update_activity_module_completion_status', {
      courseid: courseId,
      cmid: lessonId,
      completed: isCompleted ? 1 : 0
    }, {}, session.user.moodleToken);
  } catch (error) {
    console.error("Failed to mark completion:", error);
  }

  revalidatePath(`/student/courses/${courseId}/learn`);
  revalidatePath(`/student/courses/${courseId}/learn/lessons/${lessonId}`);
  return { success: true };
}

export async function submitAssignment(assignmentId: string, data: { contentUrl?: string; textContent?: string }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) throw new Error("Unauthorized");

  try {
    await moodle.call('mod_assign_save_submission', {
      assignmentid: assignmentId,
      plugindata: {
        onlinetext_editor: {
          text: data.textContent || "",
          format: 1, // HTML
          itemid: 0
        }
      }
    }, {}, session.user.moodleToken);
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    throw new Error("Submission failed");
  }

  revalidatePath(`/student/assignments/${assignmentId}/submit`);
  revalidatePath("/student/assignments");
  return { success: true, submissionId: assignmentId };
}

export async function submitQuizAttempt(quizId: string, answers: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) throw new Error("Unauthorized");

  // In Moodle, quiz attempts require first starting an attempt, 
  // then processing it (mod_quiz_start_attempt -> mod_quiz_process_attempt)
  // We'll leave a mock structure here until fully integrated with specific quiz flow UI.
  console.log("Submitting quiz to Moodle:", quizId, answers);

  revalidatePath("/student/quizzes");
  return { success: true, score: 0 };
}

export async function submitReview(courseId: string, rating: number, comment?: string) {
  // Reviews are app-specific metadata, handled by your future custom Moodle block or local logic.
  console.log("Submitting review:", { courseId, rating, comment });
  revalidatePath(`/student/catalog/${courseId}`);
  return { success: true };
}

export async function deleteReview(reviewId: string, courseId: string) {
  console.log("Deleting review:", reviewId);
  revalidatePath(`/student/catalog/${courseId}`);
  return { success: true };
}
