import { createId } from '@paralleldrive/cuid2';
import { cookies } from 'next/headers';
import { VOTER_COOKIE, VOTER_COOKIE_MAX_AGE } from './constants';

export async function getOrCreateVoterId(): Promise<{ voterId: string; isNew: boolean }> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE)?.value;
  if (existing && existing.length > 0) return { voterId: existing, isNew: false };
  const voterId = createId();
  store.set(VOTER_COOKIE, voterId, {
    maxAge: VOTER_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  return { voterId, isNew: true };
}

export async function getVoterId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(VOTER_COOKIE)?.value;
}
