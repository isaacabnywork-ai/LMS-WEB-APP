import { NextResponse } from 'next/server';
import { moodle } from '@/lib/moodle/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') || '13';
  
  const token = process.env.MOODLE_WS_TOKEN;
  
  try {
    const fullContents = await moodle.call('core_course_get_contents', { courseid: courseId }, { cache: 'no-store' }, token);
    return NextResponse.json({ tokenExists: !!token, tokenPrefix: token ? token.substring(0, 5) : null, contents: fullContents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
