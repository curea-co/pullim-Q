import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';
import { wrongReasonCatalog, type WrongReasonCode } from '@/lib/mock';

/**
 * GET /api/q/analysis/wrong-reasons?topN=3
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.5
 * wrong_attempt_diagnoses × solve_attempts join → wrongReasonCodes aggregate. label 은 mock catalog.
 */
export const dynamic = 'force-dynamic';

const DEFAULT_TOP_N = 3;
const MAX_TOP_N = 20;

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const url = new URL(request.url);
  const topNRaw = Number.parseInt(url.searchParams.get('topN') ?? '', 10);
  const topN = clamp(Number.isFinite(topNRaw) ? topNRaw : DEFAULT_TOP_N, 1, MAX_TOP_N);

  const rows = await db
    .select({ codes: schema.wrongAttemptDiagnoses.wrongReasonCodes })
    .from(schema.wrongAttemptDiagnoses)
    .innerJoin(
      schema.solveAttempts,
      eq(schema.wrongAttemptDiagnoses.attemptId, schema.solveAttempts.id),
    )
    .where(eq(schema.solveAttempts.userId, userId));

  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const c of r.codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  }

  const topReasons = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([code, count]) => ({
      code: code as WrongReasonCode,
      count,
      label: wrongReasonCatalog[code as WrongReasonCode]?.label ?? code,
    }));

  return NextResponse.json({ topReasons });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
