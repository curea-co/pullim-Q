import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';

/**
 * GET /api/me — 현재 사용자 + D-day (서버 계산).
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.1
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);
  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: 'user_not_found', userId }, { status: 404 });
  }

  const examMs = new Date(row.examDate).getTime();
  const dDay = Math.ceil((examMs - Date.now()) / 86_400_000);

  return NextResponse.json({
    id: row.id,
    name: row.name,
    grade: row.grade,
    track: row.track,
    examDate: row.examDate,
    examLabel: row.examLabel,
    focusSubjects: row.focusSubjects,
    dDay,
    streakDays: row.streakDays,
  });
}
