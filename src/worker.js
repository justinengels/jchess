import { Board } from './rules.js';
import { Search } from './search.js';
import { Evaluator } from './eval.js';

self.onmessage = (e) => {
  try {
    const { fen, depth, timeLimit } = e.data;
    const board = Board.fromFEN(fen);
    const result = Search.getBestMove(board, depth, timeLimit);
    
    self.postMessage({ 
      move: result.move, 
      nodeCount: result.nodesEvaluated 
    });
  } catch (err) {
    self.postMessage({ error: err.toString() });
  }
};
