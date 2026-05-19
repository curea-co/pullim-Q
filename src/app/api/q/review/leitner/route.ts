import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';
import { leitnerMeta, type LeitnerBox } from '@/lib/mock';

/**
 * GET /api/q/review/leitner
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.7
 * overdue (next_review_at < now) / today (now ≤ x < now+24h) / byBox (1~5) / meta (mock leitnerMeta).
 */
export const dynamic = 'force-dynamic';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const all = await db
    .select()
    .from(schema.leitnerCards)
    .where(eq(schema.leitnerCards.userId, userId));

  const now = Date.now();
  const dayLater = now + ONE_DAY_MS;
  const overdue: typeof all = [];
  const today: typeof all = [];
  const byBox: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const card of all) {
    const t = card.nextReviewAt.getTime();
    if (t < now) overdue.push(card);
    else if (t < dayLater) today.push(card);
    const b = card.box as LeitnerBox;
    if (b >= 1 && b <= 5) byBox[b]++;
  }

  // overdue 는 가장 오래된 것 먼저
  overdue.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());
  today.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());

  return NextResponse.json({ overdue, today, byBox, meta: leitnerMeta });
}
