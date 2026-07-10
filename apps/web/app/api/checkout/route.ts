import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { moodle } from "@/lib/moodle/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    // Get course details from Moodle to display on Stripe checkout
    const coursesResponse = await moodle.call<any>('core_course_get_courses_by_field', {
      field: 'id',
      value: courseId
    }, { cache: 'no-store' }, session.user.moodleToken).catch(() => ({ courses: [] }));
    
    const course = coursesResponse.courses?.[0];
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Determine the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000"
    );

    // Create Stripe Checkout session
    // For now, we use a default price of $49.00 USD. 
    // You can customize this later to pull prices from a database.
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.fullname,
              description: course.summary.replace(/(<([^>]+)>)/gi, "").substring(0, 255) || "Moodle Course",
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/student/courses/${courseId}?success=true`,
      cancel_url: `${baseUrl}/student/courses/${courseId}?canceled=true`,
      metadata: {
        userId: session.user.id,
        courseId: courseId,
      },
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
