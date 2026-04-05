# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gameplay.spec.js >> full game auto-play
- Location: tests/gameplay.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#heartbeat[style*="background-color: green"]') to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - paragraph [ref=e3]: "Status: Computer is thinking..."
    - paragraph [ref=e4]: "Nodes evaluated: 0"
    - generic [ref=e6]:
      - text: "Search Depth:"
      - spinbutton "Search Depth:" [ref=e7]: "2"
    - generic [ref=e8]:
      - text: "Time Limit (ms):"
      - spinbutton "Time Limit (ms):" [ref=e9]: "1000"
    - button "Auto-play" [active] [ref=e10]
  - generic [ref=e11]:
    - generic [ref=e13] [cursor=pointer]: ♜
    - generic [ref=e14] [cursor=pointer]: ♝
    - generic [ref=e15] [cursor=pointer]: ♛
    - generic [ref=e16] [cursor=pointer]: ♚
    - generic [ref=e17] [cursor=pointer]: ♝
    - generic [ref=e18] [cursor=pointer]: ♞
    - generic [ref=e19] [cursor=pointer]: ♜
    - generic [ref=e20] [cursor=pointer]: ♟
    - generic [ref=e21] [cursor=pointer]: ♟
    - generic [ref=e22] [cursor=pointer]: ♟
    - generic [ref=e23] [cursor=pointer]: ♟
    - generic [ref=e24] [cursor=pointer]: ♟
    - generic [ref=e25] [cursor=pointer]: ♟
    - generic [ref=e26] [cursor=pointer]: ♟
    - generic [ref=e27] [cursor=pointer]: ♟
    - generic [ref=e28] [cursor=pointer]: ♞
    - generic [ref=e46] [cursor=pointer]: ♙
    - generic [ref=e50] [cursor=pointer]: ♙
    - generic [ref=e59] [cursor=pointer]: ♘
    - generic [ref=e60] [cursor=pointer]: ♙
    - generic [ref=e61] [cursor=pointer]: ♙
    - generic [ref=e63] [cursor=pointer]: ♙
    - generic [ref=e64] [cursor=pointer]: ♙
    - generic [ref=e65] [cursor=pointer]: ♙
    - generic [ref=e67] [cursor=pointer]: ♙
    - generic [ref=e68] [cursor=pointer]: ♖
    - generic [ref=e69] [cursor=pointer]: ♘
    - generic [ref=e70] [cursor=pointer]: ♗
    - generic [ref=e71] [cursor=pointer]: ♕
    - generic [ref=e72] [cursor=pointer]: ♔
    - generic [ref=e73] [cursor=pointer]: ♗
    - generic [ref=e75] [cursor=pointer]: ♖
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('full game auto-play', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   
  6  |   // Wait for board to render
  7  |   await page.waitForSelector('#board');
  8  |   
  9  |   // Click auto-play button multiple times to simulate a game
  10 |   const autoPlayButton = page.locator('#auto-play');
  11 |   
  12 |   for (let i = 0; i < 100; i++) {
  13 |     await autoPlayButton.click();
  14 |     // Wait for engine to finish thinking (heartbeat turns green)
> 15 |     await page.waitForSelector('#heartbeat[style*="background-color: green"]', { timeout: 60000 });
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  16 |     
  17 |     // Check if game is over
  18 |     const statusText = await page.textContent('#status-text');
  19 |     if (statusText.includes('Checkmate') || statusText.includes('Stalemate')) break;
  20 |   }
  21 |   
  22 |   // Verify game is still active
  23 |   const statusText = await page.textContent('#status-text');
  24 |   expect(statusText).not.toContain('Engine error');
  25 | });
  26 | 
```