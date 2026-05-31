/**
 * Seed a small set of CURATED public polls into whatever DATABASE_URL points to.
 *
 * Unlike `seed.ts` (which inserts 8 thematic demo polls for local dev), this
 * one is meant to be run against production once — to make /explore feel
 * alive from day one with three real, opinionated questions plus the kind
 * of vote distributions you'd actually expect from organic engagement.
 *
 * Run with:
 *   DATABASE_URL='postgresql://...neon-pooler...' npx tsx src/db/seed-public.ts
 *
 * Idempotent on title — if a poll with the same title already exists,
 * it's skipped.
 */
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db, schema } from './index';
import { creditCost } from '../lib/quadratic';

// Fail loudly if the caller didn't set DATABASE_URL explicitly. This script
// is meant to write to prod (Neon), and silently falling back to a local
// Docker container is exactly the wrong default — we'd seed nothing useful
// and the user would think the script worked. Force the prefix:
//   DATABASE_URL='...neon-pooled-url...' npm run db:seed:public
if (!process.env.DATABASE_URL) {
  console.error(
    'ERROR: DATABASE_URL is not set.\n' +
      'This script writes curated public polls to production.\n' +
      'Run as: DATABASE_URL=\'...neon-pooled-url...\' npm run db:seed:public',
  );
  process.exit(1);
}

// Print where we’re about to write so misroutes (local vs Neon) are obvious.
{
  const url = new URL(process.env.DATABASE_URL);
  console.log(`Target: ${url.hostname} / db=${url.pathname.slice(1)}\n`);
}

interface SeedPoll {
  title: string;
  description?: string;
  creditsPerVoter: 25 | 50 | 100 | 150 | 200;
  options: string[];
  /** Number of fake voters to generate. */
  voters: number;
  /** Per-option preference weight. Must match options.length. */
  weights: number[];
}

const SEEDS: SeedPoll[] = [
  {
    title: 'What should product managers prioritize learning in 2026?',
    description:
      'The PM role is being redefined faster than most can keep up with. Spread your credits across the skills you would most invest in — yours, your team’s, or what you wish you had learned earlier.',
    creditsPerVoter: 100,
    voters: 38,
    options: [
      'AI tooling mastery (Claude, Cursor, agents)',
      'Strategic thinking and vision',
      'User research and customer interviews',
      'SQL and data analysis',
      'Storytelling and pitching',
      'Distribution, growth and marketing',
      'Leadership and cross-team influence',
      'Technical depth (reading code, debugging)',
      'Design skills (interaction, information architecture)',
      'Financial literacy and business modeling',
    ],
    weights: [0.22, 0.18, 0.14, 0.12, 0.1, 0.07, 0.06, 0.05, 0.04, 0.02],
  },
  {
    title: 'What do you actually use AI assistants for?',
    description:
      'Honest look at where AI is genuinely saving time. Vote heavier on the tasks you reach for AI on every week — not the ones you tried once at a hackathon.',
    creditsPerVoter: 100,
    voters: 52,
    options: [
      'Writing or refactoring code',
      'Drafting and rewriting emails',
      'Brainstorming ideas',
      'Summarizing long documents',
      'Research and source curation',
      'Long-form writing (articles, posts)',
      'Translation',
      'Building presentations and slides',
      'Data analysis and SQL',
      'Preparing for hard conversations',
    ],
    weights: [0.26, 0.14, 0.12, 0.1, 0.09, 0.07, 0.07, 0.05, 0.06, 0.04],
  },
  {
    title: 'The best French tech invention of the 21st century',
    description:
      'France has a quietly remarkable track record. Which of these companies most deserves the spotlight? Heavy votes for the ones you think changed how something gets done.',
    creditsPerVoter: 100,
    voters: 27,
    options: [
      'Mistral AI',
      'Doctolib',
      'Hugging Face',
      'BlaBlaCar',
      'Back Market',
      'Qonto',
      'Ledger',
      'ManoMano',
      'Believe',
      'Veepee (Vente-Privée)',
    ],
    weights: [0.22, 0.16, 0.13, 0.14, 0.09, 0.08, 0.07, 0.04, 0.04, 0.03],
  },
];

/**
 * Quadratic-cost-aware allocator. Same logic as in seed.ts — duplicated
 * here on purpose so this script can run independently without dragging
 * the original 8-poll seed set along.
 */
function allocate(
  optionIds: string[],
  weights: number[],
  budget: number,
): { optionId: string; numVotes: number; creditsSpent: number }[] {
  const noisy = weights.map((w) => Math.max(0, w + (Math.random() - 0.5) * 0.18));
  const sum = noisy.reduce((s, w) => s + w, 0) || 1;
  const desiredCredits = noisy.map((w) => (w / sum) * budget);

  const maxVotesPerOption = Math.floor(Math.sqrt(budget));
  const votes = desiredCredits.map((c) => {
    const v = Math.round(Math.sqrt(c));
    return Math.min(maxVotesPerOption, Math.max(0, v));
  });

  let total = votes.reduce((s, v) => s + creditCost(v), 0);
  while (total > budget) {
    let worst = -1;
    let worstRatio = Infinity;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i] === 0) continue;
      const r = noisy[i] / creditCost(votes[i]);
      if (r < worstRatio) {
        worstRatio = r;
        worst = i;
      }
    }
    if (worst < 0) break;
    votes[worst]--;
    total = votes.reduce((s, v) => s + creditCost(v), 0);
  }

  // ~15% of voters drop an option entirely (partial ballot — feels human).
  if (Math.random() < 0.15) {
    const dropIdx = Math.floor(Math.random() * votes.length);
    votes[dropIdx] = 0;
  }

  return optionIds
    .map((id, idx) => ({
      optionId: id,
      numVotes: votes[idx],
      creditsSpent: creditCost(votes[idx]),
    }))
    .filter((a) => a.numVotes > 0);
}

async function seed() {
  console.log('Seeding curated public polls…');
  for (const seedPoll of SEEDS) {
    const existing = await db.query.polls.findFirst({
      where: eq(schema.polls.title, seedPoll.title),
    });
    if (existing) {
      console.log(`  · Skipping "${seedPoll.title}" — already exists`);
      continue;
    }

    const [poll] = await db
      .insert(schema.polls)
      .values({
        title: seedPoll.title,
        description: seedPoll.description,
        creditsPerVoter: seedPoll.creditsPerVoter,
        visibility: 'public',
        voterMode: 'open',
      })
      .returning();

    const optionRows = await db
      .insert(schema.options)
      .values(
        seedPoll.options.map((label, position) => ({
          pollId: poll.id,
          label,
          position,
        })),
      )
      .returning();
    const optionIds = optionRows.map((o) => o.id);

    for (let v = 0; v < seedPoll.voters; v++) {
      const voterId = createId();
      const allocs = allocate(optionIds, seedPoll.weights, poll.creditsPerVoter);
      const totalSpent = allocs.reduce((s, a) => s + a.creditsSpent, 0);
      const [ballot] = await db
        .insert(schema.ballots)
        .values({ pollId: poll.id, voterId, creditsSpent: totalSpent })
        .returning();
      if (allocs.length > 0) {
        await db.insert(schema.votes).values(
          allocs.map((a) => ({
            pollId: poll.id,
            ballotId: ballot.id,
            voterId,
            optionId: a.optionId,
            numVotes: a.numVotes,
            creditsSpent: a.creditsSpent,
          })),
        );
      }
    }

    console.log(`  ✓ "${seedPoll.title}" — ${seedPoll.voters} voters`);
  }
  console.log('Done.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
