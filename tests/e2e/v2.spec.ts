import { expect, test, type APIRequestContext } from '@playwright/test';

// V2 features driven by docs/pm/research/demand-and-distribution.md:
// templates, budget recommendation, verifiable results, named ballots,
// the voter → creator loop, and the dot-voting comparison page.

async function createPoll(request: APIRequestContext, data: Record<string, unknown>) {
  const res = await request.post('/api/polls', { data });
  expect(res.ok()).toBe(true);
  return res.json();
}

async function optionIds(request: APIRequestContext, pollId: string): Promise<string[]> {
  const res = await request.get(`/api/polls/${pollId}`);
  const body = await res.json();
  return body.options.map((o: { id: string }) => o.id);
}

test('a template pre-fills the create form', async ({ page }) => {
  await page.goto('/create?template=retro&from=landing');
  await expect(page.getByLabel(/poll title/i)).toHaveValue('Retro: what should we fix first?');
  await expect(page.getByRole('textbox', { name: 'Option 5' })).toHaveValue('Handoffs between teams');
  await expect(page.getByRole('button', { name: /^100\s*Best fit$/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('recommended budget follows the option count until picked by hand', async ({ page }) => {
  await page.goto('/create');
  const add = page.getByRole('button', { name: /add option/i });
  for (let i = 0; i < 5; i++) await add.click(); // 2 → 7 options
  await expect(page.getByRole('button', { name: /^150/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /^200/ }).click();
  await add.click(); // 8 options — the manual pick must stick
  await expect(page.getByRole('button', { name: /^200/ })).toHaveAttribute('aria-pressed', 'true');
});

test('results show supporters and a breakdown that adds up', async ({ page, request }) => {
  const { id } = await createPoll(request, {
    title: 'Breakdown test',
    options: ['A', 'B'],
    creditsPerVoter: 100,
  });
  const [a] = await optionIds(request, id);
  const vote = await request.post(`/api/polls/${id}/vote`, {
    data: { allocations: [{ optionId: a, numVotes: 3 }] },
  });
  expect(vote.ok()).toBe(true);

  await page.goto(`/poll/${id}/results`);
  await expect(page.getByText(/backed by 1 of 1 voter · 9 credits/i)).toBeVisible();
  await page.getByText(/backed by 1 of 1 voter · 9 credits/i).click();
  await expect(page.getByText('How it adds up')).toBeVisible();
  await expect(page.getByText('1 voter × 3 votes')).toBeVisible();
  await expect(page.getByText(/backed by 0 of 1 voter/i)).toBeVisible();
});

test('named ballots: voters are warned, results list who voted what', async ({ page, request }) => {
  const created = await createPoll(request, {
    title: 'Named ballots test',
    options: ['Lisbon', 'Rome'],
    creditsPerVoter: 100,
    voterMode: 'tokenized',
    voters: ['Alice', 'Bob'],
    ballotVisibility: 'named',
  });
  const [alice, bob] = created.voterTokens as { url: string }[];
  const [lisbon] = await optionIds(request, created.id);

  const aliceToken = alice.url.split('/v/')[1];
  const vote = await request.post(`/api/polls/${created.id}/vote`, {
    data: { voterToken: aliceToken, allocations: [{ optionId: lisbon, numVotes: 2 }] },
  });
  expect(vote.ok()).toBe(true);

  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));
  await page.goto(bob.url);
  await expect(page.getByText(/your ballot will be public/i)).toBeVisible();

  await page.goto(`/poll/${created.id}/results`);
  await expect(page.getByText('1 of 2 invited voted')).toBeVisible();
  const ballots = page.getByRole('region', { name: /who voted for what/i });
  await expect(ballots.getByText('Alice')).toBeVisible();
  await expect(ballots.getByText(/Lisbon\s*\+2/)).toBeVisible();
  await expect(ballots.getByText('Bob')).toHaveCount(0);
});

test('named ballots are rejected on open polls', async ({ request }) => {
  const res = await request.post('/api/polls', {
    data: { title: 'x', options: ['a', 'b'], creditsPerVoter: 100, ballotVisibility: 'named' },
  });
  expect(res.status()).toBe(400);
});

test('anonymous tokenized polls show turnout but no ballots', async ({ page, request }) => {
  const created = await createPoll(request, {
    title: 'Anonymous turnout test',
    options: ['A', 'B'],
    creditsPerVoter: 100,
    voterMode: 'tokenized',
    voters: ['Alice', 'Bob', 'Cara'],
  });
  await page.goto(`/poll/${created.id}/results`);
  await expect(page.getByText('0 of 3 invited voted')).toBeVisible();
  await expect(page.getByText(/who voted for what/i)).toHaveCount(0);
});

test('voters are invited to create their own poll', async ({ page, request }) => {
  const { id } = await createPoll(request, {
    title: 'Loop test',
    options: ['A', 'B'],
    creditsPerVoter: 100,
  });
  await page.goto(`/poll/${id}/results`);
  await expect(page.getByRole('heading', { name: /got a decision of your own/i })).toBeVisible();
  await page.getByRole('link', { name: 'Team retro' }).click();
  await expect(page).toHaveURL(/\/create\?template=retro&from=results$/);
  await expect(page.getByLabel(/poll title/i)).toHaveValue('Retro: what should we fix first?');
});

test('dot-voting comparison page and sitemap', async ({ page, request }) => {
  await page.goto('/vs/dot-voting');
  await expect(page.getByRole('heading', { level: 1, name: /dot voting vs quadratic voting/i })).toBeVisible();

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/vs/dot-voting');

  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /api/');
});
