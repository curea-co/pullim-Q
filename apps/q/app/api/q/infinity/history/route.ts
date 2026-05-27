import { NextResponse, type NextRequest } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';

/**
 * GET /api/q/infinity/history?limit=20&offset=0
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.3
 * 메모리 룰 — N=10,000+ 가정. limit 은 100 으로 제한.
 */
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const url = new URL(request.url);
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '', 10);
  const offsetRaw = Number.parseInt(url.searchParams.get('offset') ?? '', 10);
  const limit = clamp(Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = Math.max(0, Number.isFinite(offsetRaw) ? offsetRaw : 0);

  const [items, totalRow] = await Promise.all([
    db
      .select()
      .from(schema.solveAttempts)
      .where(eq(schema.solveAttempts.userId, userId))
      .orderBy(desc(schema.solveAttempts.attemptedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.solveAttempts)
      .where(eq(schema.solveAttempts.userId, userId)),
  ]);

  return NextResponse.json({
    items,
    total: totalRow[0]?.count ?? 0,
    limit,
    offset,
  });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
