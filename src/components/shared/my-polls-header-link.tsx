'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
  getMyPollsServerSnapshot,
  getMyPollsSnapshot,
  subscribeMyPolls,
} from '@/lib/my-polls';

/**
 * Header link to /my that only renders when this browser has actually
 * created a poll. Keeps the header lean for first-time visitors while
 * giving creators a clear way back to their admin links.
 */
export function MyPollsHeaderLink() {
  const polls = useSyncExternalStore(
    subscribeMyPolls,
    getMyPollsSnapshot,
    getMyPollsServerSnapshot,
  );
  const count = polls.length;
  if (count === 0) return null;

  return (
    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
      <Link href="/my">
        My polls
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-grad-brand px-1.5 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      </Link>
    </Button>
  );
}
