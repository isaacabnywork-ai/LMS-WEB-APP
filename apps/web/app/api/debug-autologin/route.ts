import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { moodle } from '@/lib/moodle/client';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "You are not logged into Next.js. Please log in first." });
    }

    const privateToken = (session.user as any).privateToken;
    const moodleToken = (session.user as any).moodleToken;

    if (!privateToken) {
      return NextResponse.json({ 
        error: "Your Next.js session is missing the privateToken.",
        solution: "Try logging out of Next.js and logging back in so it can fetch the token." 
      });
    }

    // Try to get autologin key
    const autologinResponse = await moodle.call<any>('tool_mobile_get_autologin_key', {
      privatetoken: privateToken
    }, {}, moodleToken);

    return NextResponse.json({ 
      success: true, 
      message: "Here is the response from Moodle when Next.js tried to automatically log you in:",
      moodleResponse: autologinResponse,
      yourPrivateToken: privateToken,
      yourMoodleToken: moodleToken
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
