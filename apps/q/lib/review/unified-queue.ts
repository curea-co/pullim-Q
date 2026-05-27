import type { LeitnerCard, LeitnerBox, MemoryItem } from '@/lib/mock';

export type QueueItem =
  | { kind: 'leitner'; key: string; sku: string; subject: string; summary: string; box: LeitnerBox; hours: number }
  | { kind: 'memory';  key: string; id: string; label: string; source: MemoryItem['source']; retention: number; hours: number };

// 24시간 안 + overdue 한 큐로 — overdue 가장 먼저.
export function unifiedQueue(cards: LeitnerCard[], memoryItems: MemoryItem[]): QueueItem[] {
  const wrong: QueueItem[] = cards.map(c => ({
    kind: 'leitner',
    key: `lc-${c.id}`,
    sku: c.problemSku,
    subject: c.subject,
    summary: c.summary,
    box: c.box,
    hours: c.nextReviewInHours,
  }));
  const memory: QueueItem[] = memoryItems.map(m => ({
    kind: 'memory',
    key: `mq-${m.id}`,
    id: m.id,
    label: m.label,
    source: m.source,
    retention: m.retention,
    hours: m.nextReviewInHours,
  }));
  return [...wrong, ...memory]
    .filter(i => i.hours <= 24)
    .sort((a, b) => a.hours - b.hours);
}
