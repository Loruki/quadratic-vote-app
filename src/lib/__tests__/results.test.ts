import { describe, expect, it } from 'vitest';
import { summarizeVotes } from '../results';

describe('summarizeVotes', () => {
  it('returns empty totals for no votes', () => {
    const s = summarizeVotes([]);
    expect(s.voterCount).toBe(0);
    expect(s.totalCreditsSpent).toBe(0);
    expect(s.perOption.size).toBe(0);
  });

  it('aggregates net votes, credits, supporters and a histogram per option', () => {
    const s = summarizeVotes([
      { voterId: 'a', optionId: 'x', numVotes: 1 },
      { voterId: 'b', optionId: 'x', numVotes: 1 },
      { voterId: 'c', optionId: 'x', numVotes: 3 },
      { voterId: 'a', optionId: 'y', numVotes: 2 },
    ]);
    expect(s.perOption.get('x')).toEqual({
      netVotes: 5,
      creditsSpent: 11,
      supporters: 3,
      histogram: [
        { votes: 1, voters: 2 },
        { votes: 3, voters: 1 },
      ],
    });
    expect(s.perOption.get('y')?.supporters).toBe(1);
    expect(s.voterCount).toBe(3);
    expect(s.totalCreditsSpent).toBe(15);
  });

  it('ignores zero-vote rows for supporters and voter count', () => {
    const s = summarizeVotes([
      { voterId: 'a', optionId: 'x', numVotes: 0 },
      { voterId: 'b', optionId: 'x', numVotes: 2 },
    ]);
    expect(s.voterCount).toBe(1);
    expect(s.perOption.get('x')?.supporters).toBe(1);
  });

  it('distinguishes broad from concentrated support with equal totals', () => {
    // Four people × 1 vote vs one person × 4 votes (costs 16 credits).
    const s = summarizeVotes([
      { voterId: 'a', optionId: 'broad', numVotes: 1 },
      { voterId: 'b', optionId: 'broad', numVotes: 1 },
      { voterId: 'c', optionId: 'broad', numVotes: 1 },
      { voterId: 'd', optionId: 'broad', numVotes: 1 },
      { voterId: 'e', optionId: 'narrow', numVotes: 4 },
    ]);
    expect(s.perOption.get('broad')?.netVotes).toBe(4);
    expect(s.perOption.get('narrow')?.netVotes).toBe(4);
    expect(s.perOption.get('broad')?.creditsSpent).toBe(4);
    expect(s.perOption.get('narrow')?.creditsSpent).toBe(16);
  });
});
