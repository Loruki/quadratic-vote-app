import { SMALL_GROUP_THRESHOLD } from '@/lib/constants';

/**
 * Small groups are the sweet spot for this tool, but one enthusiastic voter
 * can swing a small result. Point people at the per-option breakdown rather
 * than telling them the result is untrustworthy.
 */
export function SmallGroupNote({ voterCount }: { voterCount: number }) {
  if (voterCount === 0 || voterCount >= SMALL_GROUP_THRESHOLD) return null;
  return (
    <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
      With {voterCount} {voterCount === 1 ? 'voter' : 'voters'}, one person who cares a lot can
      move an option up the ranking. Open an option&apos;s breakdown to see whether its support
      is broad or comes from a few people.
    </div>
  );
}
