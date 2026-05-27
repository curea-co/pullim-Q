import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * GET /api/q/review/error-patterns
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3.9
 * error_patterns × leitner_cards LEFT JOIN GROUP BY → cardCount 추가.
 *
 * 카탈로그 자체는 user 비의존 (Ph5 에서 user-별 분리 예정). 그 사이엔 user 헤더 무시.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db
    .select({
      id: schema.errorPatterns.id,
      code: schema.errorPatterns.code,
      subject: schema.errorPatterns.subject,
      name: schema.errorPatterns.name,
      rootCause: schema.errorPatterns.rootCause,
      frequency: schema.errorPatterns.frequency,
      totalQuestions: schema.errorPatterns.totalQuestions,
      conquered: schema.errorPatterns.conquered,
      difficultyMin: schema.errorPatterns.difficultyMin,
      difficultyMax: schema.errorPatterns.difficultyMax,
      cardCount: sql<number>`count(${schema.leitnerCards.id})::int`,
    })
    .from(schema.errorPatterns)
    .leftJoin(
      schema.leitnerCards,
      eq(schema.errorPatterns.id, schema.leitnerCards.errorPatternId),
    )
    .groupBy(schema.errorPatterns.id);

  return NextResponse.json({ items: rows });
}
