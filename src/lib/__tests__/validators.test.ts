import { describe, expect, it } from 'vitest';
import { createPollSchema, submitVoteSchema, updatePollSchema } from '../validators/poll';

describe('createPollSchema', () => {
  it('accepts a valid poll', () => {
    const result = createPollSchema.safeParse({
      title: 'Choose features',
      options: ['a', 'b'],
      creditsPerVoter: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 options', () => {
    const result = createPollSchema.safeParse({
      title: 'x',
      options: ['only one'],
      creditsPerVoter: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 20 options', () => {
    const result = createPollSchema.safeParse({
      title: 'x',
      options: Array.from({ length: 21 }, (_, i) => `opt ${i}`),
      creditsPerVoter: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown credit values', () => {
    const result = createPollSchema.safeParse({
      title: 'x',
      options: ['a', 'b'],
      creditsPerVoter: 77,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createPollSchema.safeParse({
      title: '   ',
      options: ['a', 'b'],
      creditsPerVoter: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe('submitVoteSchema', () => {
  it('accepts empty ballot (abstention)', () => {
    const r = submitVoteSchema.safeParse({ allocations: [] });
    expect(r.success).toBe(true);
  });

  it('rejects negative votes (opposition is not supported)', () => {
    const r = submitVoteSchema.safeParse({
      allocations: [{ optionId: 'x', numVotes: -3 }],
    });
    expect(r.success).toBe(false);
  });

  it('rejects non-integer votes', () => {
    const r = submitVoteSchema.safeParse({
      allocations: [{ optionId: 'x', numVotes: 1.5 }],
    });
    expect(r.success).toBe(false);
  });

  it('rejects duplicate optionId in allocations', () => {
    const r = submitVoteSchema.safeParse({
      allocations: [
        { optionId: 'x', numVotes: 2 },
        { optionId: 'x', numVotes: 2 },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rejects numVotes outside the configured bound', () => {
    const huge = submitVoteSchema.safeParse({
      allocations: [{ optionId: 'x', numVotes: 1_000_000 }],
    });
    expect(huge.success).toBe(false);
  });

  it('accepts a voterToken', () => {
    const r = submitVoteSchema.safeParse({
      voterToken: 'abc123',
      allocations: [{ optionId: 'x', numVotes: 2 }],
    });
    expect(r.success).toBe(true);
  });
});

describe('createPollSchema (extended)', () => {
  it('defaults visibility=unlisted and voterMode=open', () => {
    const r = createPollSchema.safeParse({
      title: 'x',
      options: ['a', 'b'],
      creditsPerVoter: 100,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.visibility).toBe('unlisted');
      expect(r.data.voterMode).toBe('open');
    }
  });

  it('requires voters when voterMode is tokenized', () => {
    const r = createPollSchema.safeParse({
      title: 'x',
      options: ['a', 'b'],
      creditsPerVoter: 100,
      voterMode: 'tokenized',
      voters: [],
    });
    expect(r.success).toBe(false);
  });

  it('accepts tokenized polls with named voters', () => {
    const r = createPollSchema.safeParse({
      title: 'x',
      options: ['a', 'b'],
      creditsPerVoter: 100,
      voterMode: 'tokenized',
      voters: ['Alice', 'Bob'],
    });
    expect(r.success).toBe(true);
  });
});

describe('updatePollSchema', () => {
  it('accepts boolean isClosed', () => {
    expect(updatePollSchema.safeParse({ isClosed: true }).success).toBe(true);
    expect(updatePollSchema.safeParse({ isClosed: false }).success).toBe(true);
  });
  it('rejects non-boolean', () => {
    expect(updatePollSchema.safeParse({ isClosed: 'yes' }).success).toBe(false);
  });
});
