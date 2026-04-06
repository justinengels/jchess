import Board from './rules.js';
import { Search } from './search.js';
import Evaluator from './eval.js';

const search = new Search();

self.onmessage = (e) => {
  try {
    const { fen, depth, timeLimit } = e.data;
    const board = Board.fromFEN(fen);
    console.log("Starting search for FEN:", fen);
    const result = search.getBestMove(board, depth, timeLimit);
    console.log("Search finished. Best move:", result.move, "Nodes:", result.nodeCount);
    
    self.postMessage({ 
      type: 'result',
      move: result.move, 
      nodeCount: result.nodeCount,
      depth: result.depth
    });
  } catch (err) {
    self.postMessage({ error: err.message, stack: err.stack });
  }
};
