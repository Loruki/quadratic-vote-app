/**
 * First-visit teaching state machine for the vote page — the "F19"
 * just-in-time annotation. The gnomon grid shows the cost; this teaches
 * *why* it's quadratic, at the only two moments where it lands:
 *
 *   Beat 1 — the very first vote anywhere. Costs 1. The hook, not the
 *            lesson (1 credit is the one step that doesn't feel quadratic).
 *   Beat 2 — the first time an option goes 1 → 2. Costs 3, not another 1.
 *            This is the quadratic premium biting for the first time.
 *
 * Pure on purpose so the sequencing is unit-testable without rendering.
 * The component owns the localStorage flag and the auto-fade timer; this
 * only decides "given where we are, does this tap teach, and what's next?"
 */

export type TeachStep = 0 | 1 | 'done';

export interface TeachResult {
  /** The step to store after this tap. */
  step: TeachStep;
  /** Which beat to surface now, or null if this tap teaches nothing. */
  beat: 1 | 2 | null;
}

export function nextTeach(
  step: TeachStep,
  optionVotesBefore: number,
  totalVotesBefore: number,
  direction: 1 | -1,
): TeachResult {
  // Only increments teach, and only until the lesson is complete.
  if (step === 'done' || direction !== 1) return { step, beat: null };

  // Beat 1: the first vote of the whole ballot (nothing allocated yet).
  if (step === 0 && totalVotesBefore === 0) {
    return { step: 1, beat: 1 };
  }

  // Beat 2: the first option to reach a second vote — the quadratic bite.
  // Can land on a different option than beat 1; it's still "stack a second
  // vote and watch the price jump."
  if (step === 1 && optionVotesBefore === 1) {
    return { step: 'done', beat: 2 };
  }

  return { step, beat: null };
}
