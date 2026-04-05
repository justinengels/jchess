# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.js >> Engine responds to human move
- Location: tests/ui.spec.js:3:1

# Error details

```
Error: expect(locator).not.toHaveText(expected) failed

Locator:  locator('#nodes-text')
Expected: not "Nodes evaluated: 0"
Received: "Nodes evaluated: 0"
Timeout:  20000ms

Call log:
  - Expect "not toHaveText" with timeout 20000ms
  - waiting for locator('#nodes-text')
    24 × locator resolved to <p id="nodes-text">Nodes evaluated: 0</p>
       - unexpected value "Nodes evaluated: 0"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - paragraph [ref=e3]: "Status: Waiting for move..."
    - paragraph [ref=e4]: "Nodes evaluated: 0"
    - generic [ref=e6]:
      - text: "Search Depth:"
      - spinbutton "Search Depth:" [ref=e7]: "2"
    - generic [ref=e8]:
      - text: "Time Limit (ms):"
      - spinbutton "Time Limit (ms):" [ref=e9]: "1000"
  - generic [ref=e10]:
    - generic [ref=e11] [cursor=pointer]: ♜
    - generic [ref=e12] [cursor=pointer]: ♞
    - generic [ref=e13] [cursor=pointer]: ♝
    - generic [ref=e14] [cursor=pointer]: ♛
    - generic [ref=e15] [cursor=pointer]: ♚
    - generic [ref=e16] [cursor=pointer]: ♝
    - generic [ref=e17] [cursor=pointer]: ♞
    - generic [ref=e18] [cursor=pointer]: ♜
    - generic [ref=e19] [cursor=pointer]: ♟
    - generic [ref=e20] [cursor=pointer]: ♟
    - generic [ref=e21] [cursor=pointer]: ♟
    - generic [ref=e22] [cursor=pointer]: ♟
    - generic [ref=e23] [cursor=pointer]: ♟
    - generic [ref=e24] [cursor=pointer]: ♟
    - generic [ref=e25] [cursor=pointer]: ♟
    - generic [ref=e26] [cursor=pointer]: ♟
    - generic [ref=e59] [cursor=pointer]: ♙
    - generic [ref=e60] [cursor=pointer]: ♙
    - generic [ref=e61] [cursor=pointer]: ♙
    - generic [ref=e62] [cursor=pointer]: ♙
    - generic [ref=e63] [cursor=pointer]: ♙
    - generic [ref=e64] [cursor=pointer]: ♙
    - generic [ref=e65] [cursor=pointer]: ♙
    - generic [ref=e66] [cursor=pointer]: ♙
    - generic [ref=e67] [cursor=pointer]: ♖
    - generic [ref=e68] [cursor=pointer]: ♘
    - generic [ref=e69] [cursor=pointer]: ♗
    - generic [ref=e70] [cursor=pointer]: ♕
    - generic [ref=e71] [cursor=pointer]: ♔
    - generic [ref=e72] [cursor=pointer]: ♗
    - generic [ref=e73] [cursor=pointer]: ♘
    - generic [ref=e74] [cursor=pointer]: ♖
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('Engine responds to human move', async ({ page }) => {
  4  |   page.on('console', msg => console.log(msg.text()));
  5  |   page.on('pageerror', exception => console.log(`Uncaught exception: "${exception}"`));
  6  |   await page.goto('/');
  7  | 
  8  |   // Move White Pawn from e2 to e4
  9  |   await page.waitForSelector('[data-square="e2"]');
  10 |   await page.locator('[data-square="e2"]').click();
  11 |   await page.locator('[data-square="e4"]').click();
  12 | 
  13 |   // Wait for the move to complete and the Heartbeat to turn Green.
  14 |   await expect(page.locator('#heartbeat')).toHaveCSS('background-color', 'rgb(0, 128, 0)', { timeout: 15000 });
  15 |   
  16 |   // Verify nodes evaluated is greater than 0
> 17 |   await expect(page.locator('#nodes-text')).not.toHaveText('Nodes evaluated: 0', { timeout: 20000 });
     |                                                 ^ Error: expect(locator).not.toHaveText(expected) failed
  18 |   const nodesText = await page.locator('#nodes-text').textContent();
  19 |   const nodesCount = parseInt(nodesText.replace('Nodes evaluated: ', ''));
  20 |   expect(nodesCount).toBeGreaterThan(0);
  21 |   
  22 |   // Verify it is now Black's turn
  23 |   await expect(page.locator('#status-text')).toHaveText('Status: Black to move');
  24 | });
  25 | 
```