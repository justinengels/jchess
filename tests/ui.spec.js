const { test, expect } = require('@playwright/test');

test('Engine responds to human move', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', exception => console.log(`Uncaught exception: "${exception}"`));
  await page.goto('/');

  // Move White Pawn from e2 to e4
  await page.waitForSelector('[data-square="e2"]');
  await page.dragAndDrop('[data-square="e2"]', '[data-square="e4"]');

  // Wait for the move to complete and the Heartbeat to turn Green.
  await expect(page.locator('#heartbeat')).toHaveCSS('background-color', 'rgb(0, 128, 0)', { timeout: 15000 });
  
  // Verify nodes evaluated is greater than 0
  await expect(page.locator('#nodes-text')).not.toHaveText('Nodes evaluated: 0', { timeout: 20000 });
  const nodesText = await page.locator('#nodes-text').textContent();
  const nodesCount = parseInt(nodesText.replace('Nodes evaluated: ', ''));
  expect(nodesCount).toBeGreaterThan(0);
  
  // Verify it is now White's turn (after engine move)
  await expect(page.locator('#status-text')).toHaveText('Status: White to move');
});
