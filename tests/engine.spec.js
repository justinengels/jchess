const { test, expect } = require('@playwright/test');
const { Board } = require('../src/rules');

test('Knight can move in L-shape', async () => {
  const board = new Board();
  // Clear board for testing
  board.board = {};
  board.board['e4'] = 'N';
  
  // Valid moves for knight at e4: c3, c5, d2, d6, f2, f6, g3, g5
  expect(board.isValidMove('e4', 'c3')).toBe(true);
  expect(board.isValidMove('e4', 'c5')).toBe(true);
  expect(board.isValidMove('e4', 'd2')).toBe(true);
  expect(board.isValidMove('e4', 'd6')).toBe(true);
  expect(board.isValidMove('e4', 'f2')).toBe(true);
  expect(board.isValidMove('e4', 'f6')).toBe(true);
  expect(board.isValidMove('e4', 'g3')).toBe(true);
  expect(board.isValidMove('e4', 'g5')).toBe(true);
  
  // Invalid move
  expect(board.isValidMove('e4', 'e5')).toBe(false);
});

test('Bishop can move diagonally', async () => {
  const board = new Board();
  board.board = {};
  board.board['e4'] = 'B';
  
  // Valid moves for bishop at e4: f5, g6, h7, d5, c6, b7, a8, f3, g2, h1, d3, c2, b1
  expect(board.isValidMove('e4', 'f5')).toBe(true);
  expect(board.isValidMove('e4', 'h7')).toBe(true);
  expect(board.isValidMove('e4', 'd3')).toBe(true);
  expect(board.isValidMove('e4', 'b1')).toBe(true);
  
  // Invalid move
  expect(board.isValidMove('e4', 'e5')).toBe(false);
});

test('Rook can move horizontally and vertically', async () => {
  const board = new Board();
  board.board = {};
  board.board['e4'] = 'R';
  
  // Valid moves for rook at e4: e5, e6, e7, e8, e3, e2, e1, a4, b4, c4, d4, f4, g4, h4
  expect(board.isValidMove('e4', 'e8')).toBe(true);
  expect(board.isValidMove('e4', 'e1')).toBe(true);
  expect(board.isValidMove('e4', 'a4')).toBe(true);
  expect(board.isValidMove('e4', 'h4')).toBe(true);
  
  // Invalid move
  expect(board.isValidMove('e4', 'f5')).toBe(false);
});

test('Queen can move diagonally, horizontally and vertically', async () => {
  const board = new Board();
  board.board = {};
  board.board['e4'] = 'Q';
  
  // Valid moves for queen at e4: e5, e6, e7, e8, e3, e2, e1, a4, b4, c4, d4, f4, g4, h4, f5, g6, h7, d5, c6, b7, a8, f3, g2, h1, d3, c2, b1
  expect(board.isValidMove('e4', 'e8')).toBe(true);
  expect(board.isValidMove('e4', 'a4')).toBe(true);
  expect(board.isValidMove('e4', 'h7')).toBe(true);
  expect(board.isValidMove('e4', 'b1')).toBe(true);
  
  // Invalid move
  expect(board.isValidMove('e4', 'f6')).toBe(false);
});

test('King can move one square in any direction', async () => {
  const board = new Board();
  board.board = {};
  board.board['e4'] = 'K';
  
  // Valid moves for king at e4: e5, e3, d4, f4, d5, f5, d3, f3
  expect(board.isValidMove('e4', 'e5')).toBe(true);
  expect(board.isValidMove('e4', 'e3')).toBe(true);
  expect(board.isValidMove('e4', 'd4')).toBe(true);
  expect(board.isValidMove('e4', 'f4')).toBe(true);
  expect(board.isValidMove('e4', 'd5')).toBe(true);
  expect(board.isValidMove('e4', 'f5')).toBe(true);
  expect(board.isValidMove('e4', 'd3')).toBe(true);
  expect(board.isValidMove('e4', 'f3')).toBe(true);
  
  // Invalid move
  expect(board.isValidMove('e4', 'e6')).toBe(false);
});

test('Check: King is in check', async () => {
  const board = new Board();
  board.board = {};
  board.board['e1'] = 'K';
  board.board['e8'] = 'r';
  board.turn = 'white';
  
  expect(board.isCheck('white')).toBe(true);
});

test('Turn-based movement: White moves first', async () => {
  const board = new Board();
  board.board = {};
  board.board['e2'] = 'P';
  board.turn = 'white';
  
  expect(board.isValidMove('e2', 'e3')).toBe(true);
  
  board.turn = 'black';
  expect(board.isValidMove('e2', 'e3')).toBe(false);
});

test('Piece collision: Rook cannot jump over pieces', async () => {
  const board = new Board();
  board.board = {};
  board.board['e1'] = 'R';
  board.board['e2'] = 'P'; // Blocking piece
  
  expect(board.isValidMove('e1', 'e3')).toBe(false);
});

test('Piece collision: Bishop cannot jump over pieces', async () => {
  const board = new Board();
  board.board = {};
  board.board['a1'] = 'B';
  board.board['b2'] = 'P'; // Blocking piece
  
  expect(board.isValidMove('a1', 'c3')).toBe(false);
});

test('Piece collision: Queen cannot jump over pieces', async () => {
  const board = new Board();
  board.board = {};
  board.board['a1'] = 'Q';
  board.board['b2'] = 'P'; // Blocking piece
  
  expect(board.isValidMove('a1', 'c3')).toBe(false);
});

test('Checkmate: King is in checkmate', async () => {
  const board = new Board();
  board.board = {};
  // Simple back-rank mate
  board.board['h8'] = 'k';
  board.board['g7'] = 'p';
  board.board['h7'] = 'p';
  board.board['a8'] = 'R';
  board.turn = 'black';
  
  // Ensure it is actually in check
  expect(board.isCheck('black')).toBe(true);
  
  expect(board.isCheckmate('black')).toBe(true);
});

test('Castling: King can castle kingside', async () => {
  const board = new Board();
  board.board = {};
  board.board['e1'] = 'K';
  board.board['h1'] = 'R';
  board.turn = 'white';
  
  // Castling move: King moves from e1 to g1
  expect(board.isValidMove('e1', 'g1')).toBe(true);
});

test('En Passant: Pawn can capture en passant', async () => {
  const board = new Board();
  board.board = {};
  board.board['e5'] = 'P';
  board.board['f5'] = 'p';
  board.turn = 'white';
  
  // En passant move: White pawn at e5 captures black pawn at f5
  // This requires the black pawn to have just moved f7 to f5
  // We need to simulate the last move for en passant
  board.lastMove = { from: 'f7', to: 'f5' };
  
  expect(board.isValidMove('e5', 'f6')).toBe(true);
});

test('Pawn: Can move two squares forward on first move', async () => {
  const board = new Board();
  board.board = {};
  board.board['e2'] = 'P';
  board.turn = 'white';
  
  expect(board.isValidMove('e2', 'e4')).toBe(true);
});

test('Pawn: Cannot move two squares forward if blocked', async () => {
  const board = new Board();
  board.board = {};
  board.board['e2'] = 'P';
  board.board['e3'] = 'p'; // Blocking piece
  board.turn = 'white';
  
  expect(board.isValidMove('e2', 'e4')).toBe(false);
});
