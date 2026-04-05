import { Board } from './rules.js';
import { Search } from './search.js';
import { Evaluator } from './eval.js';

// Expose classes to global scope for the worker
self.Board = Board;
self.Search = Search;
self.Evaluator = Evaluator;

self.onmessage = (e) => {
  const { boardData, maxDepth, timeLimit } = e.data;
  
  // Reconstruct board
  const board = new Board();
  board.board = boardData.board;
  board.turn = boardData.turn;
  
  const result = Search.getBestMove(board, maxDepth, timeLimit);
  self.postMessage(result);
};
