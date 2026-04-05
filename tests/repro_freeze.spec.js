import { test, expect } from '@playwright/test';
import Board from '../src/rules.js';
import Search from '../src/search.js';

test('Engine should not freeze on problematic FEN', async () => {
  const fen = 'r1bk1bnN/pp1pp1pp/2p5/3n4/3P1B2/P1q1P3/2P1KPPP/1R1Q1B1R b';
  const board = Board.fromFEN(fen);
  
  // Set a timeout for the search to detect a freeze
  const searchPromise = new Promise((resolve) => {
    const result = Search.getBestMove(board, 3, 5000); // 5 seconds limit
    resolve(result);
  });

  const result = await Promise.race([
    searchPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Search timed out')), 6000))
  ]);

  expect(result.move).toBeDefined();
});
