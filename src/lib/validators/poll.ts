import { z } from 'zod';
import {
  CREDIT_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  MAX_OPTIONS,
  MAX_OPTION_LABEL_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_VOTERS_TOKENIZED,
  MAX_VOTES_PER_OPTION,
  MIN_OPTIONS,
  MAX_VOTER_LABEL_LENGTH,
} from '@/lib/constants';

export const pollVisibilities = ['public', 'unlisted'] as const;
export const voterModes = ['open', 'tokenized'] as const;
export type PollVisibility = (typeof pollVisibilities)[number];
export type VoterMode = (typeof voterModes)[number];

export const createPollSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(MAX_TITLE_LENGTH),
    description: z
      .string()
      .trim()
      .max(MAX_DESCRIPTION_LENGTH)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    options: z
      .array(z.string().trim().min(1, 'Option cannot be empty').max(MAX_OPTION_LABEL_LENGTH))
      .min(MIN_OPTIONS, `At least ${MIN_OPTIONS} options required`)
      .max(MAX_OPTIONS, `At most ${MAX_OPTIONS} options allowed`),
    creditsPerVoter: z
      .number()
      .int()
      .refine(
        (v) => (CREDIT_OPTIONS as readonly number[]).includes(v),
        `Credits must be one of: ${CREDIT_OPTIONS.join(', ')}`,
      ),
    visibility: z.enum(pollVisibilities).default('unlisted'),
    voterMode: z.enum(voterModes).default('open'),
    // Only used when voterMode === 'tokenized'. Each entry becomes one
    // pre-issued voter token. Empty strings → unlabeled token.
    voters: z
      .array(z.string().trim().max(MAX_VOTER_LABEL_LENGTH))
      .max(MAX_VOTERS_TOKENIZED, `At most ${MAX_VOTERS_TOKENIZED} voters supported`)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.voterMode === 'tokenized') {
        return (data.voters?.length ?? 0) >= 1;
      }
      return true;
    },
    {
      message: 'Tokenized polls need at least one voter',
      path: ['voters'],
    },
  );

export type CreatePollInput = z.infer<typeof createPollSchema>;

export const submitVoteSchema = z
  .object({
    voterToken: z.string().trim().min(1).max(64).optional(),
    allocations: z
      .array(
        z.object({
          optionId: z.string().min(1).max(64),
          numVotes: z
            .number()
            .int()
            .min(0, 'numVotes must be 0 or positive')
            .max(MAX_VOTES_PER_OPTION, `numVotes must be ≤ ${MAX_VOTES_PER_OPTION}`),
        }),
      )
      .max(MAX_OPTIONS, `At most ${MAX_OPTIONS} allocations allowed`),
  })
  .refine(
    (data) => {
      const seen = new Set<string>();
      for (const a of data.allocations) {
        if (seen.has(a.optionId)) return false;
        seen.add(a.optionId);
      }
      return true;
    },
    { message: 'Duplicate optionId in allocations', path: ['allocations'] },
  );

export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;

export const updatePollSchema = z.object({
  isClosed: z.boolean(),
});

export type UpdatePollInput = z.infer<typeof updatePollSchema>;
