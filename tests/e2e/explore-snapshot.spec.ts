import { test } from '@playwright/test';

test('capture explore + tokenized flow screenshots', async ({ page, request }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/explore');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/09-explore.png', fullPage: true });

  // Tokenized poll: create + screenshot the post-create banner on the admin page.
  await page.goto('/create');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/poll title/i).fill('Pick the team lead for Q1');
  await page.getByRole('textbox', { name: 'Option 1' }).fill('Alice');
  await page.getByRole('textbox', { name: 'Option 2' }).fill('Bob');
  await page.getByRole('button', { name: /Specific people/i }).click();
  await page.locator('#voters').fill('Alice\nBob\nCharlie\nDan');
  await page.getByRole('button', { name: /review & create/i }).click();
  await page.getByRole('heading', { name: /ready to create this poll/i }).waitFor();
  await page.screenshot({ path: 'screenshots/10a-confirm-dialog.png', fullPage: false });
  await page.getByRole('button', { name: /yes, create poll/i }).click();
  // Capture the in-between progress overlay before the redirect.
  await page.getByText(/working on it/i).waitFor({ timeout: 2000 });
  await page.screenshot({ path: 'screenshots/10b-progress-overlay.png', fullPage: false });
  await page.waitForURL(/\/admin\/.+\?created=1/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/10c-post-create-banner.png', fullPage: true });

  // Visit a tokenized voter URL directly
  const created = await request.post('/api/polls', {
    data: {
      title: 'Token visit demo',
      options: ['A', 'B', 'C'],
      creditsPerVoter: 100,
      voterMode: 'tokenized',
      voters: ['Alice'],
    },
  });
  const { id, voterTokens } = await created.json();
  await page.context().clearCookies();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(voterTokens[0].url);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.localStorage.setItem('qv_voting_hint_seen', '1'));
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/11-tokenized-voter.png', fullPage: true });
  void id;
});
