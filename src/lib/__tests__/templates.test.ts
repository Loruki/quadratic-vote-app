import { describe, expect, it } from 'vitest';
import { CREDIT_OPTIONS, MAX_OPTIONS, MIN_OPTIONS } from '../constants';
import { POLL_TEMPLATES, getTemplate, recommendedCredits } from '../templates';
import { createPollSchema } from '../validators/poll';

describe('poll templates', () => {
  it('have unique ids', () => {
    const ids = POLL_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(POLL_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s passes the create-poll schema',
    (_id, t) => {
      const parsed = createPollSchema.safeParse({
        title: t.title,
        description: t.description,
        options: t.options,
        creditsPerVoter: recommendedCredits(t.options.length),
      });
      expect(parsed.success).toBe(true);
    },
  );

  it('getTemplate resolves known ids and rejects unknown ones', () => {
    expect(getTemplate('retro')?.id).toBe('retro');
    expect(getTemplate('nope')).toBeUndefined();
    expect(getTemplate(undefined)).toBeUndefined();
  });
});

describe('recommendedCredits', () => {
  it('always returns a selectable budget', () => {
    for (let n = MIN_OPTIONS; n <= MAX_OPTIONS; n++) {
      expect(CREDIT_OPTIONS).toContain(recommendedCredits(n));
    }
  });

  it('grows with the number of options', () => {
    expect(recommendedCredits(3)).toBe(100);
    expect(recommendedCredits(10)).toBe(150);
    expect(recommendedCredits(20)).toBe(200);
  });
});
