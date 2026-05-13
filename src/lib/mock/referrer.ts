/**
 * 진입 출처(referrer) 인식 — Studio↔Q↔Store 크로스 도메인 인지.
 * URL > sessionStorage > localStorage > direct 순.
 */

export type ReferrerKind = 'studio' | 'store' | 'direct';

export type StudioReferrerMeta = {
  kind: 'studio';
  authorType: 'self' | 'teacher';
  authorName?: string;
  kitId?: string;
  kitTitle?: string;
};

export type StoreReferrerMeta = {
  kind: 'store';
  mode: 'owned' | 'trial';
  productId?: string;
  productTitle?: string;
  authorName?: string;
};

export type DirectReferrerMeta = { kind: 'direct' };

export type ReferrerMeta =
  | StudioReferrerMeta
  | StoreReferrerMeta
  | DirectReferrerMeta;

const SESSION_KEY = 'pullim.lastReferrer';
const RECENT_KEY = 'pullim.recentReferrers';
const RECENT_TTL_DAYS = 7;
const RECENT_MAX = 5;

/** 순수 함수 — URL/sessionStorage 읽기만, 쓰기 없음 */
export function parseReferrer(searchParams: URLSearchParams): ReferrerMeta {
  const fromParam = searchParams.get('from');
  if (fromParam === 'studio' || fromParam === 'store') {
    return buildFromParams(fromParam, searchParams);
  }
  const session = readSession();
  if (session) return session;
  return { kind: 'direct' };
}

/** 사이드 이펙트 — sessionStorage 갱신 + recent 누적 */
export function trackReferrer(meta: ReferrerMeta): void {
  if (meta.kind === 'direct') return;
  persistSession(meta);
  pushRecent(meta.kind);
}

function buildFromParams(kind: 'studio' | 'store', params: URLSearchParams): ReferrerMeta {
  if (kind === 'studio') {
    const kit = params.get('kit');
    const authorType: 'self' | 'teacher' = kit === 'teacher' ? 'teacher' : 'self';
    return {
      kind: 'studio',
      authorType,
      authorName: params.get('teacher') ?? undefined,
      kitId: kit ?? undefined,
      kitTitle: params.get('kitTitle') ?? undefined,
    };
  }
  const mode: 'owned' | 'trial' = params.get('mode') === 'trial' ? 'trial' : 'owned';
  return {
    kind: 'store',
    mode,
    productId: params.get('product') ?? undefined,
    productTitle: params.get('productTitle') ?? undefined,
    authorName: params.get('publisher') ?? undefined,
  };
}

function persistSession(meta: ReferrerMeta): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
  } catch {
    /* private mode or quota */
  }
}

function readSession(): ReferrerMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReferrerMeta;
    if (parsed.kind === 'studio' || parsed.kind === 'store' || parsed.kind === 'direct') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

type RecentEntry = { kind: ReferrerKind; at: number };

function pushRecent(kind: ReferrerKind): void {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const cutoff = now - RECENT_TTL_DAYS * 24 * 60 * 60 * 1000;
    const raw = localStorage.getItem(RECENT_KEY);
    const list: RecentEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list
      .filter(e => e.at >= cutoff && e.kind !== kind)
      .slice(0, RECENT_MAX - 1);
    const next = [{ kind, at: now }, ...filtered];
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** localStorage에 남은 최근 출처 — direct 진입 시 카드 순서 결정 */
export function readRecentReferrers(): ReferrerKind[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const cutoff = Date.now() - RECENT_TTL_DAYS * 24 * 60 * 60 * 1000;
    const list: RecentEntry[] = JSON.parse(raw);
    return list.filter(e => e.at >= cutoff).map(e => e.kind);
  } catch {
    return [];
  }
}
