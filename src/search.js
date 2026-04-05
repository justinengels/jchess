import Board from './rules.js';
import { Evaluator } from './eval.js';

class Search {
  static minimax(board, depth, alpha, beta, isMaximizingPlayer, stats, startTime, timeLimit, currentDepth = 0) {
    this.nodesEvaluated++;
    if (this.isAborted || this.nodesEvaluated >= this.maxNodes || (this.nodesEvaluated % 20 === 0 && Date.now() - startTime >= timeLimit)) {
        this.isAborted = true;
        return { score: 0 };
    }
    
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

    let ops = 0;
    for (const from of pieces) {
      for (let file = 97; file <= 104; file++) {
        for (let rank = 1; rank <= 8; rank++) {
          if (++ops % 100 === 0 && Date.now() - this.startTime >= this.timeLimit) {
            this.isAborted = true;
            return moves;
          }
          if (this.isAborted) return moves;
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

  static getBestMove(board, maxDepth, timeLimit, maxNodes) {
    const isMaximizingPlayer = board.turn === 'white';
    this.startTime = Date.now();
    this.timeLimit = timeLimit;
    this.maxNodes = maxNodes || Infinity;
    this.isAborted = false;
    let bestMove = null;
    let completedDepth = 0;
    this.nodesEvaluated = 0;

    for (let d = 1; d <= maxDepth; d++) {
      const stats = { nodesEvaluated: 0 };
      const currentBestMove = this.iterativeDeepening(board, d, isMaximizingPlayer, this.startTime, timeLimit, stats);
      this.nodesEvaluated += stats.nodesEvaluated;
      
      if (this.isAborted) break;
      
      if (currentBestMove) {
        bestMove = currentBestMove;
        completedDepth = d;
      } else {
        break;
      }
    }
    const timeTaken = Date.now() - this.startTime;
    console.log(`[ENGINE] Turn: ${board.turn} | Depth Reached: ${completedDepth}/${maxDepth} | Nodes: ${this.nodesEvaluated}/${this.maxNodes} | Time: ${timeTaken}ms/${timeLimit}ms | Aborted: ${this.isAborted} | Best Move:`, bestMove);
    return { move: bestMove, nodeCount: this.nodesEvaluated };
  }

  static iterativeDeepening(board, depth, isMaximizingPlayer, startTime, timeLimit, stats) {
    const moves = this.generateMoves(board, isMaximizingPlayer);
    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of moves) {
      if (this.isAborted) break;
      const moveInfo = this.makeMove(board, move);
      const result = this.minimax(board, depth - 1, -Infinity, Infinity, !isMaximizingPlayer, stats, startTime, timeLimit);
      const boardValue = result.score;
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

export { Search };
