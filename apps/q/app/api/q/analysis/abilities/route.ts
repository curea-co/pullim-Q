import { NextResponse, type NextRequest } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';
import { lastDiagnosis } from '@/lib/mock';

/**
 * GET /api/q/analysis/abilities
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.4
 * - current: 과목별 최신 θ snapshot.
 * - trend: 전체 snapshot (시간 asc).
 * - diagnosisMeta: 진단 history 테이블 미존재 → mock `lastDiagnosis` fallback (Ph4+ 이관 예정).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const all = await db
    .select()
    .from(schema.thetaSnapshots)
    .where(eq(schema.thetaSnapshots.userId, userId))
    .orderBy(asc(schema.thetaSnapshots.recordedAt));

  // 과목별 최신 = sorted asc 후 같은 subject 의 마지막 행.
  const latestBySubject = new Map<string, (typeof all)[number]>();
  for (const s of all) latestBySubject.set(s.subject, s);
  const current = Array.from(latestBySubject.values());

  return NextResponse.json({
    current,
    trend: all,
    diagnosisMeta: lastDiagnosis,
  });
}
