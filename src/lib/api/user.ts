import type { NextRequest } from 'next/server';

/**
 * 단일 mock 사용자 (Ph8 인증 도입 전까지 fallback).
 */
export const DEFAULT_USER_ID = 'student_001';

/**
 * 요청 헤더에서 `x-user-id` 를 읽어 사용자 ID 를 반환. 없으면 `student_001` fallback.
 *
 * spec: proc/spec/2026-05-18_q-be-api-design.md §3 (Ph8 까지 유지)
 */
export function resolveUserId(request: NextRequest | Request): string {
  return request.headers.get('x-user-id') ?? DEFAULT_USER_ID;
}
