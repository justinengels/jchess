class Evaluator {
  static evaluate(board) {
    let score = 0;
    const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100 };
    for (const square in board.board) {
      const piece = board.board[square];
      if (!piece) continue;
      const val = values[piece.toUpperCase()] || 0;
      score += (piece === piece.toUpperCase()) ? val : -val;
    }
    return score;
  }
}

export { Evaluator };
