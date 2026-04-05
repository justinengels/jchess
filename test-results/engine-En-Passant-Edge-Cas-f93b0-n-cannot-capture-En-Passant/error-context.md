# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: engine.spec.js >> En Passant Edge Cases >> En Passant: A pinned pawn cannot capture En Passant
- Location: tests/engine.spec.js:79:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const { Board } = require('../src/rules');
  3  | 
  4  | test.describe('Piece Movement Edge Cases', () => {
  5  |   test('Absolute Pins: A piece cannot move if it exposes its own King to check', async () => {
  6  |     // White King at e1, White Bishop at e2, Black Rook at e8
  7  |     const board = Board.fromFEN('4k3/8/8/8/8/4B3/4K3/8 w');
  8  |     // Bishop at e2 is pinned by Rook at e8
  9  |     expect(board.isValidMove('e2', 'f3')).toBe(false);
  10 |   });
  11 | });
  12 | 
  13 | test.describe('Pins & Discovered Attacks', () => {
  14 |   test('Discovered/Double Checks: Moving a piece correctly triggers check from a piece behind it', async () => {
  15 |     // White King at e1, White Knight at e2, White Rook at e3, Black King at e8
  16 |     // Moving Knight at e2 discovers check from Rook at e3
  17 |     const board = Board.fromFEN('4k3/8/8/8/8/4R3/4N3/4K3 w');
  18 |     expect(board.isValidMove('e2', 'f4')).toBe(true);
  19 |     // After move, it should be check
  20 |     board.move('e2', 'f4');
  21 |     expect(board.isCheck('black')).toBe(true);
  22 |   });
  23 | });
  24 | 
  25 | test.describe('Advanced Castling', () => {
  26 |   test('King cannot castle OUT of check', async () => {
  27 |     const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
  28 |     board.board['d1'] = 'q'; // Black Queen puts King in check
  29 |     expect(board.isValidMove('e1', 'g1')).toBe(false);
  30 |   });
  31 | 
  32 |   test('King cannot castle THROUGH an attacked square', async () => {
  33 |     const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
  34 |     board.board['f1'] = 'b'; // Black Bishop attacks f1
  35 |     expect(board.isValidMove('e1', 'g1')).toBe(false);
  36 |   });
  37 | 
  38 |   test('King cannot castle INTO check', async () => {
  39 |     const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
  40 |     board.board['g1'] = 'n'; // Black Knight attacks g1
  41 |     expect(board.isValidMove('e1', 'g1')).toBe(false);
  42 |   });
  43 | });
  44 | 
  45 | test.describe('Terminal States (Mate/Stalemate)', () => {
  46 |   test('Smothered Mate: isCheckmate() returns true when the King is surrounded by its own pieces and attacked by a Knight', async () => {
  47 |     const board = Board.fromFEN('ppp1kppp/ppp1p1pp/ppp1p1pp/6N1/8/8/8 b');
  48 |     expect(board.isCheckmate('black')).toBe(true);
  49 |   });
  50 | 
  51 |   test('Back-Rank Mate: isCheckmate() returns true when the King is trapped behind pawns and attacked by a Rook', async () => {
  52 |     const board = Board.fromFEN('5rk1/ppp2ppp/8/8/8/8/PPP2PPP/5RK1 b');
  53 |     expect(board.isCheckmate('black')).toBe(true);
  54 |   });
  55 | 
  56 |   test('Stalemate Detection: The King is NOT in check, but has no legal moves', async () => {
  57 |     const board = Board.fromFEN('7k/5K2/8/8/8/8/8/8 w');
  58 |     expect(board.isCheckmate('black')).toBe(false);
  59 |     // King has no moves
  60 |     // generateMoves would return 0
  61 |   });
  62 | });
  63 | 
  64 | test.describe('En Passant Edge Cases', () => {
  65 |   test('En Passant: Ensure it expires after one turn', async () => {
  66 |     const board = Board.fromFEN('4k3/8/8/4Pp2/8/8/8/4K3 w');
  67 |     board.lastMove = { from: 'f7', to: 'f5' };
  68 |     expect(board.isValidMove('e5', 'f6')).toBe(true);
  69 |     
  70 |     // Simulate a move that is not the en passant capture
  71 |     board.turn = 'black';
  72 |     board.move('e8', 'd8');
  73 |     
  74 |     board.turn = 'white';
  75 |     // En passant should have expired
  76 |     expect(board.isValidMove('e5', 'f6')).toBe(false);
  77 |   });
  78 | 
  79 |   test('En Passant: A pinned pawn cannot capture En Passant', async () => {
  80 |     const board = Board.fromFEN('4k3/8/8/4Pp2/4R3/8/8/4K3 w');
  81 |     board.lastMove = { from: 'f7', to: 'f5' };
  82 |     // Pawn at e5 is pinned by Rook at e4
> 83 |     expect(board.isValidMove('e5', 'f6')).toBe(false);
     |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  84 |   });
  85 | });
  86 | 
```