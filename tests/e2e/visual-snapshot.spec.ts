import { test } from '@playwright/test';

test('capture screenshots of the restyled app', async ({ page, request }) => {
  test.setTimeout(60_000);

  // Set up a poll so the vote/results pages have something to show.
  const created = await request.post('/api/polls', {
    data: {
      title: 'Election presidentielles',
      options: ['Macron', 'Le Pen', 'Melenchon', 'Poutou'],
      creditsPerVoter: 100,
    },
  });
  const { id, adminToken } = await created.json();

  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/01-landing.png', fullPage: true });

  await page.goto('/create');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/02-create.png', fullPage: true });

  // Voting page (mobile)
  await page.addInitScript(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/poll/${id}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/03-vote-mobile.png', fullPage: true });

  // Cast a realistic ballot (above the 30% low-usage warning threshold)
  // so the regular submit-vote dialog flow is exercised.
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: /add a vote to Macron/i }).click();
  }
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /add a vote to Le Pen/i }).click();
  }
  await page.screenshot({ path: 'screenshots/04-vote-mobile-with-votes.png', fullPage: true });

  // Submit
  await page.getByRole('button', { name: 'Submit vote' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit vote' }).click();
  await page.waitForURL(/results/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/05-results-mobile.png', fullPage: true });

  // Desktop results
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/poll/${id}/results`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/06-results-desktop.png', fullPage: true });

  // Admin
  await page.goto(`/poll/${id}/admin/${adminToken}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/07-admin-desktop.png', fullPage: true });

  // Voting page desktop with walkthrough
  await page.context().clearCookies();
  await page.evaluate(() => window.localStorage.clear());
  const fresh = await request.post('/api/polls', {
    data: { title: 'Walkthrough capture', options: ['A', 'B', 'C'], creditsPerVoter: 100 },
  });
  const { id: pid2 } = await fresh.json();
  await page.goto(`/poll/${pid2}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/08-walkthrough.png', fullPage: true });
});
