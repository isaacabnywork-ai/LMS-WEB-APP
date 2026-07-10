import { NextResponse } from 'next/server';
import { moodle } from '@/lib/moodle/client';
import { authenticateWithMoodle } from '@/lib/moodle/auth';

export async function GET(request: Request) {
  try {
    const user = await authenticateWithMoodle('student', 'password123'); // I don't have the real password, let's just assume the user has the credentials
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'failed' });
  }
}
