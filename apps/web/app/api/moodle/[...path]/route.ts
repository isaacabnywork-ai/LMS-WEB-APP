import { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await auth();
  const path = (await params).path.join('/');
  const searchParams = req.nextUrl.searchParams;
  
  // Construct the Moodle URL
  const moodleUrl = new URL(`${process.env.MOODLE_URL}${path}`);
  searchParams.forEach((value, key) => moodleUrl.searchParams.append(key, value));

  const headers = new Headers();
  // Pass the Moodle Session cookie if we have one?
  // We don't have the Moodle Session cookie in Next.js backend unless we fetched it!
  // BUT we do have the token!
  // Wait, Moodle doesn't accept token for view.php!
  return new Response("Not implemented", { status: 501 });
}
