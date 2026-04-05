const { test, expect } = require('@playwright/test');
const { Board } = require('../src/rules');

test.describe('Piece Movement Edge Cases', () => {
  test('Absolute Pins: A piece cannot move if it exposes its own King to check', async () => {
    const board = Board.fromFEN('4r3/8/8/8/4N3/8/8/4K3 w');
    // Knight at e4 is pinned to King at e1 by Rook at e8
    expect(board.isValidMove('e4', 'd6')).toBe(false);
  });
});

test.describe('Pins & Discovered Attacks', () => {
  test('Discovered/Double Checks: Moving a piece correctly triggers check from a piece behind it', async () => {
    // White King at e1, White Knight at e2, White Rook at e3, Black King at e8
    // Moving Knight at e2 discovers check from Rook at e3
    const board = Board.fromFEN('4k3/8/8/8/8/4R3/4N3/4K3 w');
    expect(board.isValidMove('e2', 'f4')).toBe(true);
    // After move, it should be check
    board.move('e2', 'f4');
    expect(board.isCheck('black')).toBe(true);
  });
});

test.describe('Advanced Castling', () => {
  test('King cannot castle OUT of check', async () => {
    const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
    board.board['d1'] = 'q'; // Black Queen puts King in check
    expect(board.isValidMove('e1', 'g1')).toBe(false);
  });

  test('King cannot castle THROUGH an attacked square', async () => {
    const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
    board.board['f1'] = 'b'; // Black Bishop attacks f1
    expect(board.isValidMove('e1', 'g1')).toBe(false);
  });

  test('King cannot castle INTO check', async () => {
    const board = Board.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w');
    board.board['g1'] = 'n'; // Black Knight attacks g1
    expect(board.isValidMove('e1', 'g1')).toBe(false);
  });
});

test.describe('Terminal States (Mate/Stalemate)', () => {
  test('Smothered Mate: isCheckmate() returns true when the King is surrounded by its own pieces and attacked by a Knight', async () => {
    const board = Board.fromFEN('6rk/5Npp/8/8/8/8/8/8 b');
    expect(board.isCheckmate('black')).toBe(true);
  });

  test('Back-Rank Mate: isCheckmate() returns true when the King is trapped behind pawns and attacked by a Rook', async () => {
    const board = Board.fromFEN('4R1k1/5ppp/8/8/8/8/8/8 b');
    expect(board.isCheckmate('black')).toBe(true);
  });

  test('Stalemate Detection: The King is NOT in check, but has no legal moves', async () => {
    const board = Board.fromFEN('7k/5K2/8/8/8/8/8/8 w');
    expect(board.isCheckmate('black')).toBe(false);
    // King has no moves
    // generateMoves would return 0
  });
});

test.describe('En Passant Edge Cases', () => {
  test('En Passant: Ensure it expires after one turn', async () => {
    const board = Board.fromFEN('4k3/8/8/4Pp2/8/8/8/4K3 w');
    board.lastMove = { from: 'f7', to: 'f5' };
    expect(board.isValidMove('e5', 'f6')).toBe(true);
    
    // Simulate a move that is not the en passant capture
    board.turn = 'black';
    board.move('e8', 'd8');
    
    board.turn = 'white';
    // En passant should have expired
    expect(board.isValidMove('e5', 'f6')).toBe(false);
  });

  test('En Passant: A pinned pawn cannot capture En Passant', async () => {
    const board = Board.fromFEN('4r3/8/8/4pP2/8/8/8/4K3 w');
    board.lastMove = { from: 'f7', to: 'f5' };
    // Capturing f6 removes the e5 pawn, exposing the e1 King to the e8 Rook
    expect(board.isValidMove('e5', 'f6')).toBe(false);
  });
});
