/**
 * Client-side persistence of polls created from this browser.
 *
 * The admin link is a secret URL token shown once. If the creator dismisses
 * the share dialog without copying it, they lose admin access forever. To
 * mitigate that without breaking the no-signup promise, we mirror every
 * created poll into localStorage so the creator can recover it on the same
 * browser via `/my`.
 */

const KEY = 'qv_my_polls_v1';
const MAX_ENTRIES = 200;

export interface SavedPoll {
  pollId: string;
  title: string;
  adminUrl: string;
  voterUrl: string | null;
  voterMode: 'open' | 'tokenized';
  visibility: 'public' | 'unlisted';
  voterCount?: number;
  createdAt: string;
}

const listeners = new Set<() => void>();
function notify(): void {
  listeners.forEach((l) => l());
}

/** Subscribe to localStorage poll changes — used by useSyncExternalStore. */
export function subscribeMyPolls(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) callback();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function read(): SavedPoll[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPoll);
  } catch {
    return [];
  }
}

function write(polls: SavedPoll[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(polls.slice(0, MAX_ENTRIES)));
    notify();
  } catch {
    // Quota errors etc. — best-effort.
  }
}

function isSavedPoll(v: unknown): v is SavedPoll {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.pollId === 'string' &&
    typeof o.title === 'string' &&
    typeof o.adminUrl === 'string' &&
    (o.voterUrl === null || typeof o.voterUrl === 'string') &&
    (o.voterMode === 'open' || o.voterMode === 'tokenized') &&
    (o.visibility === 'public' || o.visibility === 'unlisted') &&
    typeof o.createdAt === 'string'
  );
}

// useSyncExternalStore requires a stable snapshot reference. Cache the last
// raw serialized payload so identical reads return the same array instance,
// avoiding "getSnapshot should be cached" warnings.
let snapshotCache: { raw: string; value: SavedPoll[] } = { raw: '__init__', value: [] };

export function getMyPollsSnapshot(): SavedPoll[] {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  const raw = window.localStorage.getItem(KEY) ?? '';
  if (raw !== snapshotCache.raw) {
    snapshotCache = {
      raw,
      value: read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }
  return snapshotCache.value;
}

const SERVER_SNAPSHOT: SavedPoll[] = [];
export function getMyPollsServerSnapshot(): SavedPoll[] {
  return SERVER_SNAPSHOT;
}

export function listMyPolls(): SavedPoll[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addMyPoll(poll: SavedPoll): void {
  const polls = read();
  const filtered = polls.filter((p) => p.pollId !== poll.pollId);
  filtered.unshift(poll);
  write(filtered);
}

export function removeMyPoll(pollId: string): void {
  write(read().filter((p) => p.pollId !== pollId));
}

export function countMyPolls(): number {
  return read().length;
}
