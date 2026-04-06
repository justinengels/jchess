import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('Engine should safely abort on problematic FEN without freezing', () => {
  const script = `
    import Board from './src/rules.js';
    import { Search } from './src/search.js';
    const board = Board.fromFEN('r1bk1bnN/pp1pp1pp/2p5/3n4/3P1B2/P1q1P3/2P1KPPP/1R1Q1B1R b');
    const search = new Search();
    const start = Date.now();
    const result = search.getBestMove(board, 10, 1000);
    console.log(JSON.stringify({ move: !!result.move, elapsed: Date.now() - start }));
  `;
  
  // The OS will forcefully kill the child process if it exceeds 2000ms
  const output = execSync('node --input-type=module', { 
    input: script,
    timeout: 2000,
    killSignal: 'SIGKILL'
  });
  
  const parsed = JSON.parse(output.toString());
  expect(parsed.move).toBe(true);
  expect(parsed.elapsed).toBeLessThan(1200);
});