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
  await page.addInitScript(() => window.localStorage.setItem('qv_walkthrough_seen', '1'));

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

  await page.getByRole('button', { name: /add a vote to Pizza/i }).click();
  await page.getByRole('button', { name: /add a vote to Pizza/i }).click();
  await page.getByRole('button', { name: /add a vote to Sushi/i }).click();

  // Open the confirmation dialog, then confirm.
  await page.getByRole('button', { name: 'Submit vote' }).click();
  await expect(page.getByRole('heading', { name: /submit your vote/i })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit vote' }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText(/1 voter/i)).toBeVisible();
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
