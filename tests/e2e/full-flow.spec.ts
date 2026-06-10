import { expect, test } from '@playwright/test';

test('full flow: landing → create → vote → results', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /vote with/i })).toBeVisible();
  await page.getByRole('link', { name: /create a poll/i }).first().click();

  await expect(page).toHaveURL(/\/create$/);
  await page.getByLabel(/poll title/i).fill('Pick a team lunch');
  await page.getByRole('textbox', { name: 'Option 1' }).fill('Pizza');
  await page.getByRole('textbox', { name: 'Option 2' }).fill('Sushi');
  await page.getByRole('button', { name: /add option/i }).click();
  await page.getByRole('textbox', { name: 'Option 3' }).fill('Tacos');

  // Skip the first-visit walkthrough on the voter page by pre-seeding the flag.
  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));

  // New flow: button opens the confirm dialog first, then "Yes, create".
  await page.getByRole('button', { name: /review & create/i }).click();
  await expect(page.getByRole('heading', { name: /ready to create this poll/i })).toBeVisible();
  await page.getByRole('button', { name: /yes, create poll/i }).click();

  // The progress overlay shows during the deliberate 1.5s minimum, then the
  // page navigates to /poll/[id]/admin/[token]?created=1.
  await expect(page).toHaveURL(/\/admin\/.+\?created=1/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /save your admin link/i })).toBeVisible();

  await page.getByRole('link', { name: /open voter page/i }).click();
  await expect(page).toHaveURL(/\/poll\/[^/]+$/);

  // Cast a realistic ballot: 6 votes on Pizza (36 credits) + 3 on Sushi
  // (9 credits) = 45/100 credits, above the 30% low-usage warning
  // threshold. The submit dialog should show the normal "Submit vote"
  // primary button, not "Submit anyway".
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: /add a vote to Pizza/i }).click();
  }
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /add a vote to Sushi/i }).click();
  }

  // Open the confirmation dialog, then confirm.
  await page.getByRole('button', { name: 'Submit vote' }).click();
  await expect(page.getByRole('heading', { name: /submit your vote/i })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit vote' }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText(/1 voter/i)).toBeVisible();
});

test('one-click submitters are blocked below 30% of budget', async ({ page, request }) => {
  // Create an open poll directly via API to skip the create-form ceremony.
  const created = await request.post('/api/polls', {
    data: {
      title: 'Low-usage block test',
      options: ['A', 'B', 'C'],
      creditsPerVoter: 100,
    },
  });
  expect(created.ok()).toBe(true);
  const { id } = await created.json();

  // Pre-seed the hint flag so the banner doesn't get in the way — we
  // explicitly want to test the SUBMIT-side gate.
  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));

  await page.goto(`/poll/${id}`);
  // Cast a single vote (1 credit / 100 = 1% — well under the 30% threshold).
  await page.getByRole('button', { name: /add a vote to A/i }).click();
  await page.getByRole('button', { name: 'Submit vote' }).click();

  // The dialog hard-blocks: it shows the "use more of your budget" copy and
  // the ONLY action is "Keep voting" — no escape hatch to submit.
  await expect(page.getByText(/use more of your budget/i)).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /keep voting/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /submit anyway/i }),
  ).toHaveCount(0);
});

test('rapid taps never desync votes from budget', async ({ page, request }) => {
  const created = await request.post('/api/polls', {
    data: { title: 'Rapid tap test', options: ['A', 'B'], creditsPerVoter: 100 },
  });
  expect(created.ok()).toBe(true);
  const { id } = await created.json();

  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));
  await page.goto(`/poll/${id}`);

  // Hammer + 10 times as fast as Playwright can, then assert immediately —
  // no waits. State must be exactly 10 votes / 100 credits regardless of
  // in-flight animations (gnomon cells springing in, pill remounts).
  const addA = page.getByRole('button', { name: /add a vote to A/i });
  for (let i = 0; i < 10; i++) {
    await addA.click();
  }
  await expect(page.getByText('10 votes', { exact: true })).toBeVisible();
  await expect(page.getByText('100 / 100 credits').first()).toBeVisible();

  // Budget is fully spent: both options' + buttons must be disabled.
  await expect(addA).toBeDisabled();
  await expect(page.getByRole('button', { name: /add a vote to B/i })).toBeDisabled();
});

test('budget exceeded API rejects oversized allocations', async ({ request }) => {
  const created = await request.post('/api/polls', {
    data: { title: 'budget test', options: ['A', 'B'], creditsPerVoter: 25 },
  });
  expect(created.ok()).toBe(true);
  const { id, voterUrl } = await created.json();
  expect(voterUrl).toBe(`/poll/${id}`);

  const overshoot = await request.post(`/api/polls/${id}/vote`, {
    data: { allocations: [{ optionId: 'unknown', numVotes: 1 }] },
  });
  expect(overshoot.status()).toBe(400);
});
