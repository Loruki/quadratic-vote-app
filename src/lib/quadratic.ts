/**
 * Core quadratic voting math.
 *
 * Cost of N votes on a single option = N² credits.
 * Total credits spent across all allocations must be ≤ creditsPerVoter.
 *
 * Negative votes (voting "against") are excluded from the product UX for
 * comprehension reasons — but the math primitive squares any input, so a
 * future poll-creator toggle could re-enable opposition without changes here.
 */

export interface Allocation {
  optionId: string;
  numVotes: number;
}

export function creditCost(numVotes: number): number {
  return numVotes * numVotes;
}

export function maxVotesAffordable(creditsAvailable: number): number {
  if (creditsAvailable < 0) return 0;
  return Math.floor(Math.sqrt(creditsAvailable));
}

export function totalCreditsSpent(allocations: Allocation[]): number {
  return allocations.reduce((sum, a) => sum + creditCost(a.numVotes), 0);
}

export function remainingCredits(allocations: Allocation[], budget: number): number {
  return budget - totalCreditsSpent(allocations);
}

export function validateBudget(allocations: Allocation[], budget: number): boolean {
  return totalCreditsSpent(allocations) <= budget;
}

/**
 * Cost of the *next* positive vote on an option, given current votes.
 * From 0 → 1 costs 1, from 1 → 2 costs 3, from 2 → 3 costs 5, …
 * (2N + 1 where N is the current count.)
 */
export function nextVoteCost(currentVotes: number): number {
  const next = currentVotes + 1;
  return creditCost(next) - creditCost(currentVotes);
}

/**
 * Refund the voter gets when stepping one vote back toward zero on this
 * option. Always non-negative.
 */
export function refundForDecrement(currentVotes: number): number {
  if (currentVotes <= 0) return 0;
  return creditCost(currentVotes) - creditCost(currentVotes - 1);
}

/**
 * Can the voter spend any *additional* credits on any option with the
 * remaining budget? Used to detect "stranded credits."
 */
export function canAffordAnyMoreVote(allocations: Allocation[], budget: number): boolean {
  const remaining = remainingCredits(allocations, budget);
  if (remaining <= 0) return false;
  return allocations.some((a) => 2 * a.numVotes + 1 <= remaining);
}
