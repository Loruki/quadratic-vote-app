export const VOTER_COOKIE = 'qv_voter_id';
export const VOTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const CREDIT_OPTIONS = [25, 50, 100, 150, 200] as const;
export const DEFAULT_CREDITS = 100;

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 20;
export const MAX_OPTION_LABEL_LENGTH = 140;
export const MAX_TITLE_LENGTH = 140;
export const MAX_DESCRIPTION_LENGTH = 2000;

export const SMALL_GROUP_THRESHOLD = 10;

// Largest configurable budget is 200 credits → ⌊√200⌋ = 14. We allow a
// generous safety margin (50) so future budgets won't break, while still
// bounding inputs well below int32 / safe-integer overflow.
export const MAX_VOTES_PER_OPTION = 50;

export const MAX_VOTERS_TOKENIZED = 200;
export const MAX_VOTER_LABEL_LENGTH = 80;
