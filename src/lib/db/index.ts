/**
 * Drizzle DB client — Next.js API route 안에서 import해서 사용.
 *
 * 사용 예 (Ph3 endpoint 구현 시):
 *   import { db } from '@/lib/db';
 *   import { solveAttempts } from '@/lib/db/schema';
 *   const rows = await db.select().from(solveAttempts).where(eq(solveAttempts.userId, userId));
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Next.js hot reload 시 Pool 중복 생성 방지 (Node runtime 기준)
declare global {
  // eslint-disable-next-line no-var
  var __pullim_q_pg_pool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pullim_q_db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

// lazy: build time(page data collection) 에 DATABASE_URL 없이도 module import 통과.
// 실제 query 호출 시점에 throw — 친절한 에러 메시지 보존.
// production: module-scope _db 로 단일 인스턴스 보장. dev: globalThis 로 hot reload 회피.
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (_db) return _db;
  if (process.env.NODE_ENV !== 'production' && globalThis.__pullim_q_db) {
    _db = globalThis.__pullim_q_db;
    return _db;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and start `docker compose up -d`.',
    );
  }
  const pool =
    (process.env.NODE_ENV !== 'production' ? globalThis.__pullim_q_pg_pool : undefined) ??
    new Pool({ connectionString, max: 10 });
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__pullim_q_pg_pool = pool;
  }
  _db = drizzle(pool, { schema });
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__pullim_q_db = _db;
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const target = getDb() as unknown as Record<string | symbol, unknown>;
    const value = target[prop];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
  },
});

export { schema };
