/**
 * 풀림 Q BE Phase 2 — mock data → DB seed.
 *
 * 실행:
 *   bun run db:seed
 *
 * 전제:
 *   - `docker compose up -d` 로 Postgres 컨테이너 기동
 *   - `bun run db:migrate` 로 10 테이블 생성
 *
 * 동작:
 *   - 10 테이블 TRUNCATE RESTART IDENTITY CASCADE 후 mock 재삽입 (idempotent)
 *   - mock 의 상대 시간 (`attemptedAgo: '12분 전'`, `nextReviewInHours: -8`, `daysAgo: 3`)
 *     → 절대 timestamp 변환 (NOW 기준)
 *
 * 시드 기준 시각: 2026-05-18 12:00 KST
 */

import { db } from '@/lib/db';
import {
  users,
  curriculumNodes,
  userCurriculumMastery,
  problems,
  errorPatterns,
  solveAttempts,
  wrongAttemptDiagnoses,
  thetaSnapshots,
  leitnerCards,
  memoryItems,
} from '@/lib/db/schema';
import {
  currentPersona,
  allCurricula,
  type CurriculumNode as MockCurriculumNode,
  solveDeck,
  solveHistory,
  explainLibrary,
  todaySession,
  errorPatterns as mockErrorPatterns,
  leitnerCards as mockLeitnerCards,
  memoryQueue,
  myAbility,
  thetaTrend,
  wrongAttemptDiagnoses as mockWrongDiagnoses,
} from '@/lib/mock';
import { sql } from 'drizzle-orm';

const NOW = new Date('2026-05-18T12:00:00+09:00');
const USER_ID = currentPersona.id; // 'student_001'

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** "12분 전", "1시간 전", "어제", "2일 전" → 절대 Date */
function parseRelativeAgo(ago: string, base: Date = NOW): Date {
  if (ago === '방금') return new Date(base);
  if (ago === '어제') return new Date(base.getTime() - DAY);
  const m = ago.match(/^(\d+)(분|시간|일)\s*전$/);
  if (m) {
    const n = parseInt(m[1], 10);
    const ms = m[2] === '분' ? n * 60 * 1000 : m[2] === '시간' ? n * HOUR : n * DAY;
    return new Date(base.getTime() - ms);
  }
  return new Date(base);
}

/** SKU prefix → subject 추정 (placeholder problems 용) */
function subjectFromSku(sku: string): string {
  if (sku.startsWith('Q-MATH-')) return 'math';
  if (sku.startsWith('Q-ENG-')) return 'english';
  if (sku.startsWith('Q-SCI-')) return 'science';
  if (sku.startsWith('Q-KOR-')) return 'korean';
  if (sku.startsWith('Q-SOC-')) return 'social';
  if (sku.startsWith('Q-HIST-')) return 'history';
  return 'math';
}

async function main() {
  console.log('🌱 풀림 Q seed 시작 (기준 시각: 2026-05-18 12:00 KST)\n');

  /* ─── 0. TRUNCATE ─────────────────────────────────────────────────────── */
  await db.execute(sql`
    TRUNCATE
      memory_items,
      leitner_cards,
      theta_snapshots,
      wrong_attempt_diagnoses,
      solve_attempts,
      problems,
      error_patterns,
      user_curriculum_mastery,
      curriculum_nodes,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log('✓ 기존 데이터 정리');

  /* ─── 1. users ────────────────────────────────────────────────────────── */
  await db.insert(users).values({
    id: currentPersona.id,
    name: currentPersona.name,
    grade: currentPersona.grade,
    track: currentPersona.track,
    school: currentPersona.school,
    examDate: currentPersona.examDate,
    examLabel: currentPersona.examLabel,
    focusSubjects: currentPersona.focusSubjects,
    weeklyHours: currentPersona.weeklyHours,
    preferredStudyTime: currentPersona.preferredStudyTime,
    joinedAt: new Date(currentPersona.joinedAt),
    streakDays: currentPersona.streakDays,
  });
  console.log(`✓ users — ${currentPersona.name} (${currentPersona.id})`);

  /* ─── 2. curriculum_nodes — depth 1 → 2 → 3 순으로 (FK self-ref) ─────── */
  const allNodes: { tree: MockCurriculumNode; subject: string }[] = [];
  for (const [subject, tree] of Object.entries(allCurricula)) {
    for (const node of tree.nodes) {
      allNodes.push({ tree: node, subject });
    }
  }
  allNodes.sort((a, b) => a.tree.depth - b.tree.depth);

  let position = 0;
  for (const { tree: node, subject } of allNodes) {
    await db.insert(curriculumNodes).values({
      id: node.id,
      parentId: node.parent ?? null,
      subject,
      depth: node.depth,
      label: node.label,
      position: position++,
      course: node.course ?? null,
      appliedGrades: node.appliedGrades ?? null,
      source: node.source ?? null,
    });
  }
  console.log(`✓ curriculum_nodes — ${allNodes.length} rows (6 트리 flatten)`);

  /* ─── 3. user_curriculum_mastery — mock 의 node.mastery → 분리 테이블 ── */
  const masteryRows = allNodes
    .filter(({ tree }) => tree.mastery !== undefined)
    .map(({ tree }) => ({
      userId: USER_ID,
      nodeId: tree.id,
      mastery: tree.mastery!,
      updatedAt: NOW,
    }));
  if (masteryRows.length) {
    await db.insert(userCurriculumMastery).values(masteryRows);
  }
  console.log(`✓ user_curriculum_mastery — ${masteryRows.length} rows`);

  /* ─── 4. error_patterns ──────────────────────────────────────────────── */
  for (const p of mockErrorPatterns) {
    await db.insert(errorPatterns).values({
      id: p.id,
      code: p.code,
      subject: p.subject,
      name: p.name,
      rootCause: p.rootCause,
      frequency: p.frequency,
      totalQuestions: p.totalQuestions,
      conquered: p.conquered,
      difficultyMin: p.difficultyRange[0],
      difficultyMax: p.difficultyRange[1],
    });
  }
  console.log(`✓ error_patterns — ${mockErrorPatterns.length} rows`);

  /* ─── 5. problems — solveDeck(full) + explainLibrary(meta) + 합성 SKU ── */
  // 5-a. solveDeck 5건 (full data)
  for (const p of solveDeck) {
    await db.insert(problems).values({
      sku: p.sku,
      subject: p.subject,
      unit: p.unit,
      difficulty: p.difficulty,
      statement: p.statement,
      choices: p.choices,
      answerIndex: p.answerIndex,
      hints: p.hints,
      shortExplanation: p.shortExplanation,
      expectedSec: p.expectedSec,
    });
  }

  // 5-b. solveHistory + wrongAttemptDiagnoses 의 SKU 중 5-a 에 없는 것 → 메타 보강
  const seededSkus = new Set(solveDeck.map((p) => p.sku));
  const extraSkus = new Set<string>();
  for (const h of solveHistory) if (!seededSkus.has(h.sku)) extraSkus.add(h.sku);
  for (const d of mockWrongDiagnoses) if (!seededSkus.has(d.sku)) extraSkus.add(d.sku);

  let extraCount = 0;
  for (const sku of extraSkus) {
    // explainLibrary 가 같은 SKU 를 들고 있으면 거기서 unit/difficulty 가져오기
    const explain = explainLibrary.find((e) => e.sku === sku);
    const history = solveHistory.find((h) => h.sku === sku);
    const diag = mockWrongDiagnoses.find((d) => d.sku === sku);

    await db.insert(problems).values({
      sku,
      subject: explain?.subject ?? history?.subject ?? subjectFromSku(sku),
      unit: explain?.unit ?? history?.unit ?? '미정',
      difficulty: explain?.difficulty ?? 0.5,
      statement: diag?.summary ?? explain?.summary ?? `(placeholder) ${sku}`,
      choices: [],
      answerIndex: 0,
      hints: [],
      shortExplanation: null,
      expectedSec: null,
    });
    extraCount++;
  }
  console.log(`✓ problems — ${solveDeck.length} (solveDeck) + ${extraCount} (placeholder) = ${solveDeck.length + extraCount} rows`);

  /* ─── 6. solve_attempts — solveHistory 8 + 합성 h9~h12 (diagnosis FK 용) ─ */
  for (const h of solveHistory) {
    await db.insert(solveAttempts).values({
      id: h.id,
      userId: USER_ID,
      sku: h.sku,
      result: h.result,
      selectedIndex: null,
      timeSec: h.timeSec,
      hintsUsed: h.hintsUsed,
      thetaDelta: h.thetaDelta,
      isBookmarked: h.isBookmarked,
      attemptedAt: parseRelativeAgo(h.attemptedAgo),
    });
  }

  // wrongAttemptDiagnoses 중 solveHistory 에 없는 attemptId (h9~h12) 는 placeholder attempt 삽입
  const historyIds = new Set(solveHistory.map((h) => h.id));
  const syntheticDiag = mockWrongDiagnoses.filter((d) => !historyIds.has(d.attemptId));
  let synthCount = 0;
  for (const d of syntheticDiag) {
    // 과거 시각 — diag 순서대로 N일 전 배치
    const daysBack = 3 + synthCount * 2;
    await db.insert(solveAttempts).values({
      id: d.attemptId,
      userId: USER_ID,
      sku: d.sku,
      result: 'wrong',
      selectedIndex: d.selectedIndex,
      timeSec: 0,
      hintsUsed: 0,
      thetaDelta: 0,
      isBookmarked: false,
      attemptedAt: new Date(NOW.getTime() - daysBack * DAY),
    });
    synthCount++;
  }
  console.log(`✓ solve_attempts — ${solveHistory.length} (history) + ${synthCount} (synthetic for diagnosis) = ${solveHistory.length + synthCount} rows`);

  /* ─── 7. wrong_attempt_diagnoses ─────────────────────────────────────── */
  for (const d of mockWrongDiagnoses) {
    await db.insert(wrongAttemptDiagnoses).values({
      attemptId: d.attemptId,
      wrongReasonCodes: d.wrongReasonCodes,
      summary: d.summary,
    });
  }
  console.log(`✓ wrong_attempt_diagnoses — ${mockWrongDiagnoses.length} rows`);

  /* ─── 8. theta_snapshots — 현재 (myAbility) + 8주 추세 (thetaTrend) ──── */
  // 8-a. 현재 — myAbility 3건
  let thetaId = 0;
  for (const a of myAbility) {
    await db.insert(thetaSnapshots).values({
      id: `ts_now_${thetaId++}`,
      userId: USER_ID,
      subject: a.subject,
      theta: a.theta,
      se: a.se,
      expectedGrade: a.expectedGrade,
      percentile: a.percentile,
      delta24h: a.delta24h,
      recordedAt: NOW,
    });
  }

  // 8-b. 8주 추세 — week 라벨을 주차로 환산 (지금=0, 8주전=8)
  const weekIndex = (label: string): number => {
    if (label === '지금') return 0;
    const m = label.match(/^(\d+)주전$/);
    return m ? parseInt(m[1], 10) : 0;
  };
  let trendCount = 0;
  for (const t of thetaTrend) {
    if (t.week === '지금') continue; // 8-a 와 중복
    const weeksAgo = weekIndex(t.week);
    const recordedAt = new Date(NOW.getTime() - weeksAgo * WEEK);
    for (const subject of ['math', 'english', 'science'] as const) {
      await db.insert(thetaSnapshots).values({
        id: `ts_${weeksAgo}w_${subject}`,
        userId: USER_ID,
        subject,
        theta: t[subject],
        se: 0.25, // 과거값엔 se 따로 없음 — 기본값
        expectedGrade: null,
        percentile: null,
        delta24h: null,
        recordedAt,
      });
      trendCount++;
    }
  }
  console.log(`✓ theta_snapshots — ${myAbility.length} (now) + ${trendCount} (trend) = ${myAbility.length + trendCount} rows`);

  /* ─── 9. leitner_cards ───────────────────────────────────────────────── */
  for (const c of mockLeitnerCards) {
    await db.insert(leitnerCards).values({
      id: c.id,
      userId: USER_ID,
      problemSku: c.problemSku,
      subject: c.subject,
      summary: c.summary,
      errorPatternId: c.errorPatternId,
      box: c.box,
      streak: c.streak,
      nextReviewAt: new Date(NOW.getTime() + c.nextReviewInHours * HOUR),
      firstMissedAt: new Date(NOW.getTime() - c.firstMissedAgo * DAY),
      attempts: c.attempts,
      lastResult: c.lastResult,
    });
  }
  console.log(`✓ leitner_cards — ${mockLeitnerCards.length} rows`);

  /* ─── 10. memory_items ───────────────────────────────────────────────── */
  // 일부 mock 의 curriculumNodeId 가 curriculum_nodes 에 없을 수 있음 → 검증 후 null 처리
  const validNodeIds = new Set(allNodes.map(({ tree }) => tree.id));
  let memoryDroppedFk = 0;
  for (const m of memoryQueue) {
    const nodeId = m.curriculumNodeId && validNodeIds.has(m.curriculumNodeId)
      ? m.curriculumNodeId
      : (m.curriculumNodeId ? (memoryDroppedFk++, null) : null);
    await db.insert(memoryItems).values({
      id: m.id,
      userId: USER_ID,
      label: m.label,
      source: m.source,
      curriculumNodeId: nodeId,
      retention: m.retention,
      firstLearnedAt: new Date(NOW.getTime() - m.daysAgo * DAY),
      nextReviewAt: new Date(NOW.getTime() + m.nextReviewInHours * HOUR),
      prompt: m.prompt,
      answer: m.answer,
      hint: m.hint ?? null,
      mnemonic: m.mnemonic ?? null,
    });
  }
  if (memoryDroppedFk > 0) {
    console.log(`  ⚠ ${memoryDroppedFk}건의 curriculumNodeId 가 트리에 없어 null 로 떨어뜨림`);
  }
  console.log(`✓ memory_items — ${memoryQueue.length} rows`);

  console.log('\n🌱 seed 완료. todaySession KPI 는 solve_attempts 집계로 derive (BE Ph3 에서):');
  console.log(`  - 오늘 풀이 ${todaySession.problemsSolved}/${todaySession.totalToday}`);
  console.log(`  - 정답률 ${todaySession.accuracyToday}%`);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ seed 실패:', err);
  process.exit(1);
});
