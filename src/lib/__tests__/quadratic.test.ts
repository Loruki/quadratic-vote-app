import { describe, expect, it } from 'vitest';
import {
  canAffordAnyMoreVote,
  creditCost,
  maxVotesAffordable,
  nextVoteCost,
  refundForDecrement,
  remainingCredits,
  totalCreditsSpent,
  validateBudget,
} from '../quadratic';

describe('quadratic math', () => {
  describe('creditCost', () => {
    it('returns 0 for 0 votes', () => {
      expect(creditCost(0)).toBe(0);
    });
    it('returns N² for positive votes', () => {
      expect(creditCost(1)).toBe(1);
      expect(creditCost(2)).toBe(4);
      expect(creditCost(3)).toBe(9);
      expect(creditCost(10)).toBe(100);
    });
    it('treats negative votes with the same cost', () => {
      expect(creditCost(-3)).toBe(9);
      expect(creditCost(-7)).toBe(49);
    });
  });

  describe('maxVotesAffordable', () => {
    it('floors the square root of credits', () => {
      expect(maxVotesAffordable(100)).toBe(10);
      expect(maxVotesAffordable(99)).toBe(9);
      expect(maxVotesAffordable(0)).toBe(0);
    });
    it('returns 0 for negative input', () => {
      expect(maxVotesAffordable(-5)).toBe(0);
    });
  });

  describe('totalCreditsSpent', () => {
    it('sums squared votes across allocations', () => {
      const spent = totalCreditsSpent([
        { optionId: 'a', numVotes: 3 },
        { optionId: 'b', numVotes: -2 },
        { optionId: 'c', numVotes: 0 },
      ]);
      expect(spent).toBe(9 + 4 + 0);
    });
  });

  describe('validateBudget / remainingCredits', () => {
    it('passes when within budget', () => {
      expect(validateBudget([{ optionId: 'a', numVotes: 5 }], 25)).toBe(true);
    });
    it('fails when over budget', () => {
      expect(validateBudget([{ optionId: 'a', numVotes: 6 }], 25)).toBe(false);
    });
    it('computes remaining credits correctly', () => {
      expect(remainingCredits([{ optionId: 'a', numVotes: 5 }], 100)).toBe(75);
    });
  });

  describe('nextVoteCost / refundForDecrement', () => {
    it('costs 1 to go from 0 to 1', () => {
      expect(nextVoteCost(0)).toBe(1);
    });
    it('costs 3 to go from 1 to 2, 5 to go from 2 to 3', () => {
      expect(nextVoteCost(1)).toBe(3);
      expect(nextVoteCost(2)).toBe(5);
    });
    it('refundForDecrement matches the previous step cost', () => {
      expect(refundForDecrement(3)).toBe(5);
      expect(refundForDecrement(1)).toBe(1);
      expect(refundForDecrement(0)).toBe(0);
    });
  });

  describe('canAffordAnyMoreVote (stranded credits)', () => {
    it('returns false when budget is fully spent', () => {
      expect(canAffordAnyMoreVote([{ optionId: 'a', numVotes: 10 }], 100)).toBe(false);
    });
    it('detects classic stranded-credit scenario', () => {
      // budget 10, one option at 3 votes (9 credits). 1 credit remains.
      // up: cost = 7 (4²-3²). down: cost = -5. Min cost (positive) = 7. No room.
      // No other options to spend on either.
      expect(canAffordAnyMoreVote([{ optionId: 'a', numVotes: 3 }], 10)).toBe(false);
    });
    it('returns true when a fresh option could still be voted on', () => {
      expect(
        canAffordAnyMoreVote(
          [
            { optionId: 'a', numVotes: 3 },
            { optionId: 'b', numVotes: 0 },
          ],
          10,
        ),
      ).toBe(true);
    });
  });
});
