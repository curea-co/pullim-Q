import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';
import { memorySourceMeta } from '@/lib/mock';

/**
 * GET /api/q/review/memory
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.8
 * overdue / today (24h 이내) / sourceMeta (cross-app event bus 라벨, mock).
 */
export const dynamic = 'force-dynamic';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const all = await db
    .select()
    .from(schema.memoryItems)
    .where(eq(schema.memoryItems.userId, userId));

  const now = Date.now();
  const dayLater = now + ONE_DAY_MS;
  const overdue: typeof all = [];
  const today: typeof all = [];

  for (const item of all) {
    const t = item.nextReviewAt.getTime();
    if (t < now) overdue.push(item);
    else if (t < dayLater) today.push(item);
  }

  overdue.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());
  today.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());

  return NextResponse.json({ overdue, today, sourceMeta: memorySourceMeta });
}
