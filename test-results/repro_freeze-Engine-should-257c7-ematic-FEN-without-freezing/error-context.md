# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: repro_freeze.spec.js >> Engine should safely abort on problematic FEN without freezing
- Location: tests/repro_freeze.spec.js:4:1

# Error details

```
Error: spawnSync /bin/sh ETIMEDOUT
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { execSync } from 'child_process';
  3  | 
  4  | test('Engine should safely abort on problematic FEN without freezing', () => {
  5  |   const script = `
  6  |     import Board from './src/rules.js';
  7  |     import { Search } from './src/search.js';
  8  |     const board = Board.fromFEN('r1bk1bnN/pp1pp1pp/2p5/3n4/3P1B2/P1q1P3/2P1KPPP/1R1Q1B1R b');
  9  |     const search = new Search();
  10 |     const start = Date.now();
  11 |     const result = search.getBestMove(board, 10, 1000);
  12 |     console.log(JSON.stringify({ move: !!result.move, elapsed: Date.now() - start }));
  13 |   `;
  14 |   
  15 |   // The OS will forcefully kill the child process if it exceeds 2000ms
> 16 |   const output = execSync('node --input-type=module', { 
     |                  ^ Error: spawnSync /bin/sh ETIMEDOUT
  17 |     input: script,
  18 |     timeout: 2000,
  19 |     killSignal: 'SIGKILL'
  20 |   });
  21 |   
  22 |   const parsed = JSON.parse(output.toString());
  23 |   expect(parsed.move).toBe(true);
  24 |   expect(parsed.elapsed).toBeLessThan(1200);
  25 | });
```