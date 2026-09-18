import { CREDIT_OPTIONS } from '@/lib/constants';

/**
 * Starting points for the create form. People don't search for "quadratic
 * voting" — they search for a way to run a retro, rank a roadmap, split a
 * budget. Templates meet them at the job (docs/pm/research/demand-and-distribution.md).
 */
export interface PollTemplate {
  id: string;
  /** Short chip label. */
  name: string;
  /** One line shown under the chip on the landing page. */
  blurb: string;
  title: string;
  description: string;
  options: string[];
}

export const POLL_TEMPLATES: readonly PollTemplate[] = [
  {
    id: 'retro',
    name: 'Team retro',
    blurb: 'Pick what to fix first — not just what’s loudest.',
    title: 'Retro: what should we fix first?',
    description:
      'Spend your credits on the problems that hurt most. Piling everything on one issue gets expensive, so spread out if several matter.',
    options: [
      'Flaky CI / slow builds',
      'Too many meetings',
      'Unclear priorities',
      'On-call load',
      'Handoffs between teams',
    ],
  },
  {
    id: 'roadmap',
    name: 'Roadmap',
    blurb: 'Rank features by how much the team actually cares.',
    title: 'Which features should we build next quarter?',
    description:
      'We can’t build everything. Put your credits where you’d get the most value — the ranking reflects breadth and intensity of support.',
    options: [
      'Mobile app',
      'SSO / SAML',
      'Public API',
      'Dark mode',
      'Reporting dashboard',
      'Integrations marketplace',
    ],
  },
  {
    id: 'offsite',
    name: 'Offsite agenda',
    blurb: 'Choose the sessions worth the whole team’s time.',
    title: 'What should the offsite focus on?',
    description: 'We have time for three or four sessions. Vote for the ones you most want.',
    options: [
      'Strategy for next year',
      'Team health & ways of working',
      'Customer deep-dive',
      'Hack day',
      'Career growth',
    ],
  },
  {
    id: 'budget',
    name: 'Budget split',
    blurb: 'Decide where shared money goes.',
    title: 'How should we spend this year’s budget?',
    description:
      'Everyone gets the same credits. Credits aren’t money — they measure how much each line matters to you.',
    options: ['Training & conferences', 'New equipment', 'Team events', 'Tools & software', 'Charity'],
  },
  {
    id: 'trip',
    name: 'Group trip',
    blurb: 'Friends or family — find the place most people love.',
    title: 'Where should we go this summer?',
    description: 'Spread your credits across the places you’d be happy with. More credits = more excited.',
    options: ['Lisbon', 'The mountains', 'A lake house', 'Barcelona', 'Stay home, big BBQ'],
  },
];

export function getTemplate(id: string | undefined | null): PollTemplate | undefined {
  if (!id) return undefined;
  return POLL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Credits we suggest for a given number of options. More options need more
 * budget, otherwise voters either can't express nuance or end up with
 * credits they can't spend (whole votes cost 1, 4, 9, …). The Economist's
 * well-received demo used 100 credits for 10 issues; we stay a bit more
 * generous than that.
 */
export function recommendedCredits(optionCount: number): (typeof CREDIT_OPTIONS)[number] {
  if (optionCount <= 6) return 100;
  if (optionCount <= 12) return 150;
  return 200;
}
