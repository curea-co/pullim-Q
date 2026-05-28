import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';

/**
 * GET /api/q/analysis/recent-mistakes?limit=10
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.6
 * solve_attempts (result in 'wrong'|'partial') × wrong_attempt_diagnoses left join,
 * 최근 attemptedAt 순.
 */
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const url = new URL(request.url);
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '', 10);
  const limit = clamp(Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT, 1, MAX_LIMIT);

  const rows = await db
    .select({
      attempt: schema.solveAttempts,
      problem: schema.problems,
      diagnosis: schema.wrongAttemptDiagnoses,
    })
    .from(schema.solveAttempts)
    .leftJoin(schema.problems, eq(schema.solveAttempts.sku, schema.problems.sku))
    .leftJoin(
      schema.wrongAttemptDiagnoses,
      eq(schema.solveAttempts.id, schema.wrongAttemptDiagnoses.attemptId),
    )
    .where(
      and(
        eq(schema.solveAttempts.userId, userId),
        inArray(schema.solveAttempts.result, ['wrong', 'partial']),
      ),
    )
    .orderBy(desc(schema.solveAttempts.attemptedAt))
    .limit(limit);

  return NextResponse.json({ items: rows, limit });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
