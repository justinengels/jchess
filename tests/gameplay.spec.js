import { test, expect } from '@playwright/test';

test('forensic game auto-play', async ({ page }) => {
  test.setTimeout(120000);
  page.on('console', msg => console.log(msg.type(), msg.text()));
  await page.goto('/');
  
  await page.waitForSelector('#board');
  
  const autoPlayButton = page.locator('#auto-play');
  
  for (let i = 0; i < 5; i++) {
    // Log FEN before engine starts
    const fen = await page.evaluate(() => {
      return window.game ? window.game.toFEN() : "unknown";
    });
    console.log("Evaluating FEN:", fen);
    
    await autoPlayButton.click();
    
    // Wait for engine to finish thinking or error
    await page.waitForFunction(
      () => {
        const heartbeat = document.getElementById('heartbeat');
        const status = document.getElementById('status-text').textContent;
        return heartbeat.style.backgroundColor === 'green' || 
               status === 'Status: Engine error';
      },
      { timeout: 120000 }
    );
    
    const statusText = await page.textContent('#status-text');
    if (statusText.includes('Engine error')) {
      throw new Error(`Engine crashed at FEN: ${fen}`);
    }
    if (statusText.includes('Checkmate') || statusText.includes('Stalemate')) break;
  }
});
