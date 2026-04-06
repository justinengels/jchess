import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('Engine should safely abort on problematic FEN without freezing', () => {
  const script = `
    import Board from './src/rules.js';
    import { Search } from './src/search.js';
    try {
        const board = Board.fromFEN('r1bk1bnN/pp1pp1pp/2p5/3n4/3P1B2/P1q1P3/2P1KPPP/1R1Q1B1R b');
        const search = new Search();
        const start = Date.now();
        // Request massive depth, but strictly limit to 1000ms
        const result = search.getBestMove(board, 10, 1000);
        console.log(JSON.stringify({ move: !!result.move, elapsed: Date.now() - start }));
    } catch (e) {
        console.log(JSON.stringify({ error: e.message }));
    }
  `;
  
  let output;
  try {
      // The OS will forcefully kill the child process if the engine ignores the 1000ms internal limit
      output = execSync('node --input-type=module', { 
        input: script,
        timeout: 3000,
        killSignal: 'SIGKILL'
      });
  } catch (e) {
      throw new Error('Engine completely froze and was killed by OS limit. Output: ' + (e.stdout ? e.stdout.toString() : ''));
  }
  
  const parsed = JSON.parse(output.toString());
  expect(parsed.error).toBeUndefined();
  expect(parsed.move).toBe(true);
  
  // Verify it stopped around the 1000ms mark (giving 500ms buffer for Node.js boot time)
  expect(parsed.elapsed).toBeLessThan(1500); 
});