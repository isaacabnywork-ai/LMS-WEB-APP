import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { moodle } from "@/lib/moodle/client";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (userId && courseId) {
      try {
        console.log(`Payment successful for user ${userId} on course ${courseId}. Enrolling in Moodle...`);
        
        // We use enrol_manual_enrol_users to manually enroll the user in the course.
        await moodle.call('enrol_manual_enrol_users', {
          'enrolments[0][roleid]': 5,
          'enrolments[0][userid]': userId,
          'enrolments[0][courseid]': courseId,
        }, { method: 'POST' });

        console.log(`Successfully enrolled user ${userId} in course ${courseId}`);
      } catch (err) {
        console.error("Failed to enroll user in Moodle after successful payment:", err);
        // Depending on your business logic, you might want to alert an admin here.
      }
    }
  }

  return NextResponse.json({ received: true });
}
