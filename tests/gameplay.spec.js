const { test, expect } = require('@playwright/test');

test('full game auto-play', async ({ page }) => {
  await page.goto('/');
  
  // Wait for board to render
  await page.waitForSelector('#board');
  
  // Click auto-play button multiple times to simulate a game
  const autoPlayButton = page.locator('#auto-play');
  
  for (let i = 0; i < 100; i++) {
    await autoPlayButton.click();
    // Wait for engine to finish thinking (heartbeat turns green)
    await page.waitForSelector('#heartbeat[style*="background-color: green"]', { timeout: 60000 });
    
    // Check if game is over
    const statusText = await page.textContent('#status-text');
    if (statusText.includes('Checkmate') || statusText.includes('Stalemate')) break;
  }
  
  // Verify game is still active
  const statusText = await page.textContent('#status-text');
  expect(statusText).not.toContain('Engine error');
});
