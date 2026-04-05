import Board from './rules.js';
import { Evaluator } from './eval.js';

class Search {
  static minimax(board, depth, alpha, beta, isMaximizingPlayer, stats, startTime, timeLimit) {
    if (performance.now() - startTime > timeLimit) throw new Error('TimeoutException');
    
    if (depth === 0) {
      stats.nodesEvaluated++;
      return Evaluator.evaluate(board);
    }
    stats.nodesEvaluated++;

    const moves = this.generateMoves(board, isMaximizingPlayer);
    if (moves.length === 0) return Evaluator.evaluate(board);

    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const boardCopy = this.makeMove(board, move);
        const evaluation = this.minimax(boardCopy, depth - 1, alpha, beta, false, stats, startTime, timeLimit);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const boardCopy = this.makeMove(board, move);
        const evaluation = this.minimax(boardCopy, depth - 1, alpha, beta, true, stats, startTime, timeLimit);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  static generateMoves(board, isMaximizingPlayer) {
    const moves = [];
    const color = isMaximizingPlayer ? 'white' : 'black';
    const pieces = Object.keys(board.board).filter((sq) => {
      const piece = board.board[sq];
      return piece && (color === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase());
    });

    for (const from of pieces) {
      for (let file = 97; file <= 104; file++) {
        for (let rank = 1; rank <= 8; rank++) {
          const to = String.fromCharCode(file) + rank;
          if (board.isValidMove(from, to)) {
            moves.push({ from, to });
          }
        }
      }
    }
    return moves;
  }

  static makeMove(board, move) {
    const newBoard = new Board();
    newBoard.board = { ...board.board };
    newBoard.turn = board.turn;
    newBoard.lastMove = board.lastMove;
    newBoard.move(move.from, move.to);
    return newBoard;
  }

  static getBestMove(board, maxDepth, timeLimit) {
    const isMaximizingPlayer = board.turn === 'white';
    const startTime = performance.now();
    let bestMove = null;
    let totalNodes = 0;
    let depth = 1;

    while (depth <= maxDepth && performance.now() - startTime < timeLimit) {
      const stats = { nodesEvaluated: 0 };
      const currentBestMove = this.iterativeDeepening(board, depth, isMaximizingPlayer, startTime, timeLimit, stats);
      totalNodes += stats.nodesEvaluated;
      if (currentBestMove) {
        bestMove = currentBestMove;
      }
      depth++;
    }
    return { move: bestMove, nodesEvaluated: totalNodes };
  }

  static iterativeDeepening(board, depth, isMaximizingPlayer, startTime, timeLimit, stats) {
    const moves = this.generateMoves(board, isMaximizingPlayer);
    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of moves) {
      const boardCopy = this.makeMove(board, move);
      let boardValue;
      try {
        boardValue = this.minimax(boardCopy, depth - 1, -Infinity, Infinity, !isMaximizingPlayer, stats, startTime, timeLimit);
      } catch (e) {
        if (e.message === 'TimeoutException') return null;
        throw e;
      }
      
      if (isMaximizingPlayer) {
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      } else {
        if (boardValue < bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      }
    }
    return bestMove;
  }
}

export { Search };
