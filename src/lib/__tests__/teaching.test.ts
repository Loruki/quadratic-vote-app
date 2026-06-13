import { describe, expect, it } from 'vitest';
import { nextTeach, type TeachStep } from '../teaching';

describe('nextTeach', () => {
  it('beat 1 fires on the first vote of the ballot', () => {
    expect(nextTeach(0, 0, 0, 1)).toEqual({ step: 1, beat: 1 });
  });

  it('does not re-fire beat 1 once past step 0', () => {
    // A later 0→1 on a fresh option (other votes already exist) teaches nothing.
    expect(nextTeach(1, 0, 3, 1)).toEqual({ step: 1, beat: null });
  });

  it('beat 2 fires the first time an option goes 1 → 2', () => {
    expect(nextTeach(1, 1, 1, 1)).toEqual({ step: 'done', beat: 2 });
  });

  it('beat 2 can land on a different option than beat 1', () => {
    // beat 1 was on option A; now option B (also at 1 vote) gets its second.
    expect(nextTeach(1, 1, 2, 1)).toEqual({ step: 'done', beat: 2 });
  });

  it('teaches nothing once done', () => {
    expect(nextTeach('done', 0, 0, 1)).toEqual({ step: 'done', beat: null });
    expect(nextTeach('done', 1, 5, 1)).toEqual({ step: 'done', beat: null });
  });

  it('never teaches on a decrement', () => {
    for (const step of [0, 1, 'done'] as TeachStep[]) {
      expect(nextTeach(step, 2, 4, -1).beat).toBeNull();
    }
  });

  it('a 1→2 before beat 1 (impossible in practice) does not skip to beat 2', () => {
    // Defensive: beat 2 requires step 1, so an out-of-order call is inert.
    expect(nextTeach(0, 1, 1, 1)).toEqual({ step: 0, beat: null });
  });

  it('runs the full happy path: tap A, tap A again', () => {
    let step: TeachStep = 0;
    let r = nextTeach(step, 0, 0, 1); // tap A: 0→1, first vote
    expect(r.beat).toBe(1);
    step = r.step;
    r = nextTeach(step, 1, 1, 1); // tap A again: 1→2
    expect(r.beat).toBe(2);
    expect(r.step).toBe('done');
  });
});
