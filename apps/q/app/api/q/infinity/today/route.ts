import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, gte, isNotNull } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { resolveUserId } from '@/lib/api/user';
import { todaySession } from '@/lib/mock';

/**
 * GET /api/q/infinity/today
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.2
 * - session: 오늘 풀이 KPI (problemsSolved/accuracyToday/hintsUsedToday/estimatedThetaGain).
 *   totalToday(목표) 와 patternsCovered 는 DB 미존재 → mock fallback (user_goals 도입 시 이관).
 * - recentHistory: 최근 5건 solve_attempts.
 * - recommendedExplains: shortExplanation 있는 problem 3건 (간단 추천).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayAttempts, recentHistory, recommendedExplains] = await Promise.all([
    db
      .select()
      .from(schema.solveAttempts)
      .where(
        and(
          eq(schema.solveAttempts.userId, userId),
          gte(schema.solveAttempts.attemptedAt, startOfToday),
        ),
      ),
    db
      .select()
      .from(schema.solveAttempts)
      .where(eq(schema.solveAttempts.userId, userId))
      .orderBy(desc(schema.solveAttempts.attemptedAt))
      .limit(5),
    db
      .select()
      .from(schema.problems)
      .where(isNotNull(schema.problems.shortExplanation))
      .limit(3),
  ]);

  const problemsSolved = todayAttempts.length;
  const correct = todayAttempts.filter((a) => a.result === 'correct').length;
  const accuracyToday =
    problemsSolved > 0 ? Math.round((correct / problemsSolved) * 100) : 0;
  const hintsUsedToday = todayAttempts.reduce((s, a) => s + a.hintsUsed, 0);
  const estimatedThetaGain = todayAttempts.reduce(
    (s, a) => s + (a.thetaDelta ?? 0),
    0,
  );

  return NextResponse.json({
    session: {
      problemsSolved,
      totalToday: todaySession.totalToday,
      accuracyToday,
      estimatedThetaGain,
      hintsUsedToday,
      patternsCovered: todaySession.patternsCovered,
    },
    recentHistory,
    recommendedExplains,
  });
}
