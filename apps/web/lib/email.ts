// Mock Email Utility for Local Development
// In production, this would use the `resend` SDK.

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("\n==============================");
  console.log(`📧 MOCK EMAIL DISPATCHED`);
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body: ${payload.html}`);
  console.log("==============================\n");

  return { success: true, messageId: `mock-${Date.now()}` };
}
