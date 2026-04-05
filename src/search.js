import Board from './rules.js';
import { Evaluator } from './eval.js';

class Search {
  static minimax(board, depth, alpha, beta, isMaximizingPlayer, stats, startTime, timeLimit, currentDepth = 0) {
    if (this.isAborted) return 0;
    stats.nodesEvaluated++;
    if (stats.nodesEvaluated % 1000 === 0) {
      console.log(`Depth: ${currentDepth}, Nodes: ${stats.nodesEvaluated}, Time: ${Date.now() - startTime}ms`);
    }
    if (Date.now() - startTime >= timeLimit) {
        this.isAborted = true;
        console.log("Search aborted due to time limit");
    }
    if (this.isAborted) return 0;
    
    if (depth === 0) {
      return Evaluator.evaluate(board);
    }

    const moves = this.generateMoves(board, isMaximizingPlayer);
    if (moves.length === 0) return Evaluator.evaluate(board);

    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        if (this.isAborted) break;
        const moveInfo = this.makeMove(board, move);
        const evaluation = this.minimax(board, depth - 1, alpha, beta, false, stats, startTime, timeLimit, currentDepth + 1);
        this.unmakeMove(board, move, moveInfo);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        if (this.isAborted) break;
        const moveInfo = this.makeMove(board, move);
        const evaluation = this.minimax(board, depth - 1, alpha, beta, true, stats, startTime, timeLimit, currentDepth + 1);
        this.unmakeMove(board, move, moveInfo);
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
    return board.move(move.from, move.to);
  }

  static unmakeMove(board, move, moveInfo) {
    board.unmakeMove(move.from, move.to, moveInfo.captured, moveInfo.prevLastMove);
  }

  static getBestMove(board, maxDepth, timeLimit) {
    const isMaximizingPlayer = board.turn === 'white';
    const startTime = Date.now();
    this.isAborted = false;
    let bestMove = null;
    let totalNodes = 0;

    for (let d = 1; d <= maxDepth; d++) {
      const stats = { nodesEvaluated: 0 };
      const currentBestMove = this.iterativeDeepening(board, d, isMaximizingPlayer, startTime, timeLimit, stats);
      totalNodes += stats.nodesEvaluated;
      
      if (this.isAborted) break;
      
      if (currentBestMove) {
        bestMove = currentBestMove;
      } else {
        break;
      }
    }
    return { move: bestMove, nodesEvaluated: totalNodes };
  }

  static iterativeDeepening(board, depth, isMaximizingPlayer, startTime, timeLimit, stats) {
    const moves = this.generateMoves(board, isMaximizingPlayer);
    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of moves) {
      if (this.isAborted) break;
      const moveInfo = this.makeMove(board, move);
      const boardValue = this.minimax(board, depth - 1, -Infinity, Infinity, !isMaximizingPlayer, stats, startTime, timeLimit);
      this.unmakeMove(board, move, moveInfo);
      
      if (this.isAborted) break;

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

export default Search;
