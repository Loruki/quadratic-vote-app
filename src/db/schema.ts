import { createId } from '@paralleldrive/cuid2';
import { boolean, integer, pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const polls = pgTable(
  'polls',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    description: text('description'),
    creditsPerVoter: integer('credits_per_voter').notNull().default(100),
    adminToken: text('admin_token')
      .notNull()
      .$defaultFn(() => createId()),
    isClosed: boolean('is_closed').notNull().default(false),
    // 'public' = listed on /explore, 'unlisted' = link-only.
    visibility: text('visibility').notNull().default('unlisted'),
    // 'open' = anyone with the link votes (cookie identity).
    // 'tokenized' = pre-issued per-voter links; token IS the identity.
    voterMode: text('voter_mode').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    closesAt: timestamp('closes_at', { withTimezone: true }),
  },
  (table) => [index('polls_visibility_idx').on(table.visibility, table.createdAt)],
);

export const options = pgTable(
  'options',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    position: integer('position').notNull(),
  },
  (table) => [uniqueIndex('options_poll_position_idx').on(table.pollId, table.position)],
);

// Pre-issued per-voter tokens. Created in bulk when a poll is created with
// voterMode='tokenized'. The token IS the voter's identity — possession of
// the URL is sufficient to cast that ballot. consumed_at + ballot_id form
// the audit trail.
export const voterTokens = pgTable(
  'voter_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    token: text('token')
      .notNull()
      .unique()
      .$defaultFn(() => createId()),
    label: text('label'),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    ballotId: text('ballot_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('voter_tokens_poll_idx').on(table.pollId)],
);

// One row per ballot submission. Unique constraint on (pollId, voterId) is
// the atomic gate. For open polls, voterId is the cookie. For tokenized
// polls, voterId is the token's id.
export const ballots = pgTable(
  'ballots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    voterId: text('voter_id').notNull(),
    creditsSpent: integer('credits_spent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('ballots_poll_voter_idx').on(table.pollId, table.voterId)],
);

export const votes = pgTable(
  'votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    ballotId: text('ballot_id')
      .notNull()
      .references(() => ballots.id, { onDelete: 'cascade' }),
    voterId: text('voter_id').notNull(),
    optionId: text('option_id')
      .notNull()
      .references(() => options.id, { onDelete: 'cascade' }),
    numVotes: integer('num_votes').notNull(),
    creditsSpent: integer('credits_spent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('votes_ballot_option_idx').on(table.ballotId, table.optionId)],
);

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
export type VoterToken = typeof voterTokens.$inferSelect;
export type NewVoterToken = typeof voterTokens.$inferInsert;
export type Ballot = typeof ballots.$inferSelect;
export type NewBallot = typeof ballots.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
