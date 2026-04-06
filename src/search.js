// src/search.js
import Evaluator from './eval.js';

export class Search {
    constructor() {
        this.nodesEvaluated = 0;
        this.startTime = 0;
        this.timeLimit = 1000;
        this.maxNodes = Infinity;
        this.isAborted = false;
    }

    getBestMove(board, depth = 3, timeLimit = 1000, maxNodes = Infinity) {
        this.nodesEvaluated = 0;
        this.startTime = Date.now();
        this.timeLimit = timeLimit;
        this.maxNodes = maxNodes;
        this.isAborted = false;

        let bestMove = null;
        let completedDepth = 0;

        // Iterative Deepening
        for (let d = 1; d <= depth; d++) {
            // CRITICAL: We check the result of minimax. If it's null, we stop entirely.
            const result = this.minimax(board, d, -Infinity, Infinity, board.turn === 'white');
            
            if (result === null || this.isAborted) break;

            if (result.move) {
                bestMove = result.move;
                completedDepth = d;
            }
        }

        // Fallback: If we aborted before even depth 1 finished, get any legal move
        if (!bestMove) {
            const moves = board.generateMoves();
            bestMove = moves[0] || null;
        }

        const timeTaken = Date.now() - this.startTime;
        console.log(`[ENGINE] Depth Reached: ${completedDepth} | Nodes: ${this.nodesEvaluated} | Time: ${timeTaken}ms | Aborted: ${this.isAborted}`);
        
        return { move: bestMove, nodeCount: this.nodesEvaluated, depth: completedDepth };
    }

    checkAbort() {
        if (this.isAborted) return true;
        
        // Performance optimization: checking Date.now() is expensive. 
        // We check it every 128 nodes (bitwise AND is faster than modulo).
        if ((this.nodesEvaluated & 127) === 0) {
            if (this.nodesEvaluated >= this.maxNodes || (Date.now() - this.startTime >= this.timeLimit)) {
                this.isAborted = true;
            }
        }
        return this.isAborted;
    }

    minimax(board, depth, alpha, beta, isMaximizingPlayer) {
        this.nodesEvaluated++;
        
        // 1. Check abort at the start of every node
        if (this.checkAbort()) return null; 

        if (depth === 0) {
            return { score: Evaluator.evaluate(board) };
        }

        const moves = board.generateMoves();
        
        if (moves.length === 0) {
            if (board.isCheck(isMaximizingPlayer ? 'white' : 'black')) {
                return { score: isMaximizingPlayer ? -10000 : 10000 };
            }
            return { score: 0 }; 
        }

        let bestMove = moves[0];
        let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

        for (const move of moves) {
            // 2. Check abort before diving into a new branch
            if (this.isAborted) return null;

            // Use make/unmake instead of cloning to save massive amounts of time
            const { captured, prevLastMove } = board.move(move.from, move.to);
            const result = this.minimax(board, depth - 1, alpha, beta, !isMaximizingPlayer);
            board.unmakeMove(move.from, move.to, captured, prevLastMove);

            // 3. PROPAGATION: If the child returned null, this level must also return null immediately
            if (result === null) return null;

            if (isMaximizingPlayer) {
                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestScore);
            } else {
                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }
                beta = Math.min(beta, bestScore);
            }

            if (beta <= alpha) break; 
        }

        return { score: bestScore, move: bestMove };
    }
}