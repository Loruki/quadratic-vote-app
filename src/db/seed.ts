/**
 * Seed the database with realistic public polls so /explore looks alive
 * from day one. Idempotent on the title: if a poll with the same title
 * already exists we skip it.
 *
 * Run with: npm run db:seed
 */
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db, schema } from './index';
import { creditCost } from '../lib/quadratic';

interface SeedPoll {
  title: string;
  description?: string;
  creditsPerVoter: 25 | 50 | 100 | 150 | 200;
  options: string[];
  /** Roughly how many fake voters to generate. */
  voters: number;
  /**
   * Per-option preference weight. Higher = voters more likely to spend
   * credits here. Must match options.length. Doesn't have to sum to 1.
   */
  weights: number[];
}

const SEEDS: SeedPoll[] = [
  {
    title: 'What should Quadratic Vote ship next?',
    description:
      'Help us pick the next thing to build. The math will tell us what people actually care about.',
    creditsPerVoter: 100,
    voters: 34,
    options: [
      'Slack app for /poll',
      'Native mobile app',
      'Webhook + REST API',
      'Real-time live results (WebSockets)',
      'Comment threads on options',
      'Custom branding for orgs',
    ],
    weights: [0.25, 0.1, 0.3, 0.15, 0.1, 0.1],
  },
  {
    title: 'Best programming language for 2026',
    description: 'No flame wars — just preferences scaled by how strongly you feel.',
    creditsPerVoter: 100,
    voters: 58,
    options: ['TypeScript', 'Rust', 'Python', 'Go', 'Swift', 'Zig', 'Elixir', 'Kotlin'],
    weights: [0.28, 0.22, 0.16, 0.1, 0.06, 0.08, 0.06, 0.04],
  },
  {
    title: 'Where should we hold the next AI Safety Summit?',
    description:
      'A community-run signal on geography for the 2027 summit. Not an official vote.',
    creditsPerVoter: 100,
    voters: 41,
    options: ['Paris', 'San Francisco', 'Singapore', 'Tokyo', 'London', 'Lisbon', 'Toronto'],
    weights: [0.18, 0.16, 0.14, 0.15, 0.13, 0.11, 0.13],
  },
  {
    title: 'Pizza toppings — the definitive 2026 ranking',
    description: 'Yes, pineapple is on the list. Yes, you can vote against it (with credits).',
    creditsPerVoter: 50,
    voters: 72,
    options: [
      'Margherita',
      'Pepperoni',
      'Mushroom',
      'Quattro Formaggi',
      'Hawaiian (pineapple)',
      'Truffle',
      'Spicy salami (diavola)',
      'Vegetarian',
      'White / no sauce',
    ],
    weights: [0.18, 0.16, 0.1, 0.1, 0.04, 0.12, 0.14, 0.08, 0.08],
  },
  {
    title: 'Climate priorities for Lyon’s 2027 city budget',
    description:
      'A demo of using QV for participatory budgeting. Spread your credits across what matters most.',
    creditsPerVoter: 150,
    voters: 23,
    options: [
      'Tram line extension',
      'Cycling infrastructure',
      'Building energy retrofits',
      'Tree planting + urban cooling',
      'Public-transit subsidies for under-25s',
      'EV charging network',
      'Renewable energy for public buildings',
    ],
    weights: [0.18, 0.2, 0.16, 0.13, 0.11, 0.08, 0.14],
  },
  {
    title: 'Name our team mascot',
    description: 'Eight contenders. Most credits wins. Yes, it’s silly.',
    creditsPerVoter: 25,
    voters: 19,
    options: ['Bytey', 'Capybara Carl', 'Sir Crashes-a-Lot', 'Pixel', 'Q-bert', 'Glitch', 'Mango', 'Astra'],
    weights: [0.12, 0.18, 0.08, 0.14, 0.16, 0.08, 0.12, 0.12],
  },
  {
    title: 'Q1 product priorities (engineering)',
    description: 'Help engineering leadership decide where to bet the next quarter.',
    creditsPerVoter: 100,
    voters: 12,
    options: [
      'Migrate to OpenTelemetry',
      'Reduce CI from 22m to <10m',
      'Replace internal auth with Clerk',
      'Build a design system v2',
      'Pay down the type-error tech debt',
      'Production-ready feature flags',
    ],
    weights: [0.13, 0.25, 0.1, 0.1, 0.22, 0.2],
  },
  {
    title: 'Which open-source project deserves $10K?',
    description:
      'A quadratic-funding-style allocation game. Imagine 100 voters distributing pretend dollars.',
    creditsPerVoter: 200,
    voters: 47,
    options: [
      'Tailwind CSS',
      'tldraw',
      'Drizzle ORM',
      'Astro',
      'Linear (open-core libs)',
      'Bun',
      'Hono',
      'Million.js',
    ],
    weights: [0.16, 0.12, 0.14, 0.1, 0.04, 0.16, 0.16, 0.12],
  },
];

// Quadratic-cost-aware allocator: given a credit budget and per-option
// weights (higher = preferred), spread credits in a way that loosely
// resembles a real human's preference distribution.
function allocate(
  optionIds: string[],
  weights: number[],
  budget: number,
): { optionId: string; numVotes: number; creditsSpent: number }[] {
  // Add per-voter noise so distributions aren't identical.
  const noisy = weights.map((w) => Math.max(0, w + (Math.random() - 0.5) * 0.18));
  const sum = noisy.reduce((s, w) => s + w, 0) || 1;
  const desiredCredits = noisy.map((w) => (w / sum) * budget);

  // Convert desired credits → integer votes (cap at sqrt(budget) so the
  // ballot stays within budget after squaring; ratchet down if we exceed).
  const maxVotesPerOption = Math.floor(Math.sqrt(budget));
  const votes = desiredCredits.map((c) => {
    const v = Math.round(Math.sqrt(c));
    return Math.min(maxVotesPerOption, Math.max(0, v));
  });

  // Fit to budget: drop the lowest-weighted option's votes until we fit.
  let total = votes.reduce((s, v) => s + creditCost(v), 0);
  while (total > budget) {
    // Find the option with the smallest "weight per credit" — that's the
    // least efficient credit, decrement it.
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

  // ~15% of voters cast partial / abstention ballots — drop a random option.
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
  console.log('Seeding…');
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
