import Board from './rules.js';
import { Search } from './search.js';
import { Evaluator } from './eval.js';

self.onmessage = (e) => {
  try {
    const { fen, depth, timeLimit } = e.data;
    const board = Board.fromFEN(fen);
    console.log("Starting search for FEN:", fen);
    const result = Search.getBestMove(board, depth, timeLimit);
    console.log("Search finished. Best move:", result.move, "Nodes:", result.nodeCount);
    
    self.postMessage({ 
      move: result.move, 
      nodeCount: result.nodeCount 
    });
  } catch (err) {
    self.postMessage({ error: err.message, stack: err.stack });
  }
};
