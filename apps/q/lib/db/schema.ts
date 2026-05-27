/**
 * Drizzle schema — 풀림 Q DB
 *
 * mock domain → BE 1차 정합 (proc/spec/2026-05-18_q-be-api-design.md §2).
 * 변경 시 `bun run db:generate`로 SQL diff 생성.
 *
 * 10 tables:
 *   users, curriculum_nodes, user_curriculum_mastery, problems, error_patterns,
 *   solve_attempts, wrong_attempt_diagnoses, theta_snapshots, leitner_cards, memory_items
 */

import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  smallint,
  boolean,
  date,
  timestamp,
  jsonb,
  real,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';

/* ─── users ──────────────────────────────────────────────────────────────
 * 학생 단일 페르소나 (Ph8 인증 전까지는 'student_001' 하드코딩).
 * mock: lib/mock/persona.ts > currentPersona
 * ──────────────────────────────────────────────────────────────────────── */

export const users = pgTable('users', {
  id: text('id').primaryKey(),                                  // 'student_001'
  name: text('name').notNull(),
  grade: text('grade').notNull(),                               // '고1'|'고2'|'고3'|'재수'
  track: text('track').notNull(),                               // '문과'|'이과'|'예체능'
  school: text('school'),
  examDate: date('exam_date').notNull(),                        // 다음 시험 D-day 기준
  examLabel: text('exam_label').notNull(),                      // '6월 모의평가'
  focusSubjects: text('focus_subjects').array().notNull().default(sql`'{}'::text[]`),
  weeklyHours: integer('weekly_hours').notNull(),
  preferredStudyTime: text('preferred_study_time').notNull(),   // '아침'|'오후'|'저녁'|'심야'
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull(),
  streakDays: integer('streak_days').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  curriculumMastery: many(userCurriculumMastery),
  solveAttempts: many(solveAttempts),
  thetaSnapshots: many(thetaSnapshots),
  leitnerCards: many(leitnerCards),
  memoryItems: many(memoryItems),
}));

/* ─── curriculum_nodes — 자기 참조 트리 (depth 1~3) ───────────────────────
 * mock: lib/mock/curriculum.ts > allCurricula
 * - mastery 는 별도 user_curriculum_mastery 로 분리 (멀티 사용자 대응).
 * - depth-3 만 mastery 추적 (mock 구조와 동일).
 * ──────────────────────────────────────────────────────────────────────── */

export const curriculumNodes = pgTable(
  'curriculum_nodes',
  {
    id: text('id').primaryKey(),                                // 'math.calc_diff.application'
    parentId: text('parent_id'),                                // self-FK (declared in relations below)
    subject: text('subject').notNull(),                         // SubjectKey
    depth: smallint('depth').notNull(),                         // 1=과목 · 2=단원 · 3=성취기준
    label: text('label').notNull(),
    position: integer('position').notNull().default(0),
    course: text('course'),                                     // '미적분', '수능 영역' 등 (선택)
    appliedGrades: text('applied_grades'),                      // '고2 일반선택' 등
    source: text('source'),                                     // 기본 출처와 다를 때만 (KICE 등)
  },
  (table) => ({
    subjectDepthIdx: index('curriculum_nodes_subject_depth_idx').on(table.subject, table.depth),
    parentIdx: index('curriculum_nodes_parent_idx').on(table.parentId),
  }),
);

export const curriculumNodesRelations = relations(curriculumNodes, ({ one, many }) => ({
  parent: one(curriculumNodes, {
    fields: [curriculumNodes.parentId],
    references: [curriculumNodes.id],
    relationName: 'curriculum_tree',
  }),
  children: many(curriculumNodes, { relationName: 'curriculum_tree' }),
  masteryRows: many(userCurriculumMastery),
  memoryItems: many(memoryItems),
}));

/* ─── user_curriculum_mastery — (user × node) 마스터리 캐시 ────────────────
 * mock 의 curriculum_nodes[].mastery 값을 student_001 기준으로 분리.
 * 운영: solve_attempts aggregation 으로 nightly 재계산 (Ph6+).
 * ──────────────────────────────────────────────────────────────────────── */

export const userCurriculumMastery = pgTable(
  'user_curriculum_mastery',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    nodeId: text('node_id').notNull().references(() => curriculumNodes.id, { onDelete: 'cascade' }),
    mastery: real('mastery').notNull(),                         // 0~1
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.nodeId] }),
  }),
);

export const userCurriculumMasteryRelations = relations(userCurriculumMastery, ({ one }) => ({
  user: one(users, { fields: [userCurriculumMastery.userId], references: [users.id] }),
  node: one(curriculumNodes, { fields: [userCurriculumMastery.nodeId], references: [curriculumNodes.id] }),
}));

/* ─── problems — 문제 SKU 마스터 ───────────────────────────────────────
 * mock: lib/mock/infinity.ts > solveDeck
 * choices·hints 는 jsonb / text[] 로 저장. mock 의 expectedSec 도 같이.
 * ──────────────────────────────────────────────────────────────────────── */

export const problems = pgTable(
  'problems',
  {
    sku: text('sku').primaryKey(),                              // 'Q-MATH-CALC-0042'
    subject: text('subject').notNull(),
    unit: text('unit').notNull(),                               // '미적분 / 도함수의 활용' 등 디스플레이용
    difficulty: real('difficulty').notNull(),                   // IRT b
    discrimination: real('discrimination'),                     // IRT a (선택, 추후 보강)
    guessing: real('guessing'),                                 // IRT c (선택)
    statement: text('statement').notNull(),
    choices: jsonb('choices').$type<string[]>().notNull(),
    answerIndex: smallint('answer_index').notNull(),
    hints: text('hints').array().notNull().default(sql`'{}'::text[]`),
    shortExplanation: text('short_explanation'),
    expectedSec: integer('expected_sec'),
    /** 출처: '수능'|'모평'|'학평'|'스튜디오'|'AI 예측' 등 */
    sourceKind: text('source_kind'),
    sourceLabel: text('source_label'),                          // '2024' 등 라벨
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    subjectIdx: index('problems_subject_idx').on(table.subject),
  }),
);

/* ─── error_patterns — 오답 패턴 카탈로그 ──────────────────────────────
 * mock: lib/mock/conqueror.ts > errorPatterns
 * - 멀티 사용자 운영 시 frequency·totalQuestions·conquered 는 user 별로 분리해야 함
 *   (Ph5+). Ph1 에선 mock 구조 그대로(글로벌 카탈로그) 유지.
 * ──────────────────────────────────────────────────────────────────────── */

export const errorPatterns = pgTable('error_patterns', {
  id: text('id').primaryKey(),                                  // 'ep1'
  code: text('code').notNull().unique(),                        // 'ENG_BLANK_LOGIC_001'
  subject: text('subject').notNull(),
  name: text('name').notNull(),
  rootCause: text('root_cause').notNull(),
  frequency: integer('frequency').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(0),
  conquered: integer('conquered').notNull().default(0),
  difficultyMin: real('difficulty_min'),
  difficultyMax: real('difficulty_max'),
});

/* ─── solve_attempts — 학생 풀이 시도 이력 ────────────────────────────
 * mock: lib/mock/infinity.ts > solveHistory
 * - attemptedAgo("12분 전") 대신 절대 timestamp 저장.
 * - selectedIndex 는 wrong_attempt_diagnoses 와 정합되도록 같이 저장.
 * ──────────────────────────────────────────────────────────────────────── */

export const solveAttempts = pgTable(
  'solve_attempts',
  {
    id: text('id').primaryKey(),                                // 'h1' 등 mock id 유지
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().references(() => problems.sku, { onDelete: 'restrict' }),
    result: text('result').notNull(),                           // 'correct'|'wrong'|'partial'
    selectedIndex: smallint('selected_index'),                  // 학생이 고른 답 (null = 미응답)
    timeSec: integer('time_sec').notNull(),
    hintsUsed: integer('hints_used').notNull().default(0),
    thetaDelta: real('theta_delta').notNull().default(0),
    isBookmarked: boolean('is_bookmarked').notNull().default(false),
    attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userAttemptedIdx: index('solve_attempts_user_attempted_idx').on(table.userId, table.attemptedAt),
    skuIdx: index('solve_attempts_sku_idx').on(table.sku),
  }),
);

export const solveAttemptsRelations = relations(solveAttempts, ({ one }) => ({
  user: one(users, { fields: [solveAttempts.userId], references: [users.id] }),
  problem: one(problems, { fields: [solveAttempts.sku], references: [problems.sku] }),
  diagnosis: one(wrongAttemptDiagnoses, {
    fields: [solveAttempts.id],
    references: [wrongAttemptDiagnoses.attemptId],
  }),
}));

/* ─── wrong_attempt_diagnoses — 오답 원인 진단 (attempt 1:1) ──────────────
 * mock: lib/mock/wrong-reason.ts > wrongAttemptDiagnoses
 * - sku·selectedIndex·correctIndex 는 solve_attempts × problems join 으로 재구성 가능 → 비저장
 * - wrongReasonCodes 는 text[] (FaaS §8.1 10종 enum). 최대 2개.
 * ──────────────────────────────────────────────────────────────────────── */

export const wrongAttemptDiagnoses = pgTable('wrong_attempt_diagnoses', {
  attemptId: text('attempt_id').primaryKey().references(() => solveAttempts.id, { onDelete: 'cascade' }),
  wrongReasonCodes: text('wrong_reason_codes').array().notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ─── theta_snapshots — IRT θ 시계열 ─────────────────────────────────────
 * mock: lib/mock/irt.ts > myAbility (현재) + thetaTrend (8주)
 * - subject 별로 시간순 누적. 최근값이 현재 θ.
 * ──────────────────────────────────────────────────────────────────────── */

export const thetaSnapshots = pgTable(
  'theta_snapshots',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    theta: real('theta').notNull(),                             // -3 ~ +3
    se: real('se').notNull(),                                   // 표준오차
    expectedGrade: smallint('expected_grade'),                  // 1~9
    percentile: smallint('percentile'),                         // 0~100
    delta24h: real('delta_24h'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    userSubjectRecordedIdx: index('theta_snapshots_user_subject_recorded_idx')
      .on(table.userId, table.subject, table.recordedAt),
  }),
);

/* ─── leitner_cards — 오답 정복 5-box ───────────────────────────────────
 * mock: lib/mock/conqueror.ts > leitnerCards
 * - nextReviewInHours (상대) → nextReviewAt (절대 timestamp).
 * - firstMissedAgo (일) → firstMissedAt (절대).
 * ──────────────────────────────────────────────────────────────────────── */

export const leitnerCards = pgTable(
  'leitner_cards',
  {
    id: text('id').primaryKey(),                                // 'lc1'
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    problemSku: text('problem_sku').notNull(),                  // problems.sku 와 정합 (FK 미걸음 — mock 의 lc1~10 일부 SKU 가 problems 에 없음)
    subject: text('subject').notNull(),
    summary: text('summary').notNull(),
    errorPatternId: text('error_pattern_id').references(() => errorPatterns.id, { onDelete: 'set null' }),
    box: smallint('box').notNull(),                             // 1~5
    streak: integer('streak').notNull().default(0),
    nextReviewAt: timestamp('next_review_at', { withTimezone: true }).notNull(),
    firstMissedAt: timestamp('first_missed_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    lastResult: text('last_result').notNull(),                  // 'correct'|'wrong'|'fresh'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userNextReviewIdx: index('leitner_cards_user_next_review_idx').on(table.userId, table.nextReviewAt),
    userBoxIdx: index('leitner_cards_user_box_idx').on(table.userId, table.box),
  }),
);

export const leitnerCardsRelations = relations(leitnerCards, ({ one }) => ({
  user: one(users, { fields: [leitnerCards.userId], references: [users.id] }),
  errorPattern: one(errorPatterns, { fields: [leitnerCards.errorPatternId], references: [errorPatterns.id] }),
}));

/* ─── memory_items — 망각 곡선 복습 큐 ──────────────────────────────────
 * mock: lib/mock/memory.ts > memoryQueue
 * - daysAgo (상대) → firstLearnedAt (절대).
 * - nextReviewInHours (상대) → nextReviewAt (절대).
 * - source 는 어떤 기능에서 학습이 흘러왔는지 (cross-app event bus).
 * ──────────────────────────────────────────────────────────────────────── */

export const memoryItems = pgTable(
  'memory_items',
  {
    id: text('id').primaryKey(),                                // 'm1'
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    source: text('source').notNull(),                           // 'infinity'|'conqueror'|'index'|'visual'|'classbot'|'planner'|'exam'
    curriculumNodeId: text('curriculum_node_id').references(() => curriculumNodes.id, { onDelete: 'set null' }),
    retention: real('retention').notNull(),                     // 0~1
    firstLearnedAt: timestamp('first_learned_at', { withTimezone: true }).notNull(),
    nextReviewAt: timestamp('next_review_at', { withTimezone: true }).notNull(),
    prompt: text('prompt').notNull(),
    answer: text('answer').notNull(),
    hint: text('hint'),
    mnemonic: text('mnemonic'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userNextReviewIdx: index('memory_items_user_next_review_idx').on(table.userId, table.nextReviewAt),
    userSourceIdx: index('memory_items_user_source_idx').on(table.userId, table.source),
  }),
);

export const memoryItemsRelations = relations(memoryItems, ({ one }) => ({
  user: one(users, { fields: [memoryItems.userId], references: [users.id] }),
  curriculumNode: one(curriculumNodes, {
    fields: [memoryItems.curriculumNodeId],
    references: [curriculumNodes.id],
  }),
}));

/* ─── 추론 타입 export ─────────────────────────────────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CurriculumNode = typeof curriculumNodes.$inferSelect;
export type UserCurriculumMastery = typeof userCurriculumMastery.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type ErrorPattern = typeof errorPatterns.$inferSelect;
export type SolveAttempt = typeof solveAttempts.$inferSelect;
export type NewSolveAttempt = typeof solveAttempts.$inferInsert;
export type WrongAttemptDiagnosis = typeof wrongAttemptDiagnoses.$inferSelect;
export type ThetaSnapshot = typeof thetaSnapshots.$inferSelect;
export type LeitnerCard = typeof leitnerCards.$inferSelect;
export type NewLeitnerCard = typeof leitnerCards.$inferInsert;
export type MemoryItem = typeof memoryItems.$inferSelect;
export type NewMemoryItem = typeof memoryItems.$inferInsert;
