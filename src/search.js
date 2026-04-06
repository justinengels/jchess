import Evaluator from './eval.js';

export class Search {
    constructor() {
        this.nodesEvaluated = 0;
        this.startTime = 0;
        this.timeLimit = 1000;
        this.maxNodes = Infinity;
        this.isAborted = false;
        this.opsCount = 0;
    }

    getBestMove(board, depth = 3, timeLimit = 1000, maxNodes = Infinity) {
        this.nodesEvaluated = 0;
        this.startTime = Date.now();
        this.timeLimit = timeLimit;
        this.maxNodes = maxNodes;
        this.isAborted = false;
        this.opsCount = 0;

        let bestMove = null;
        let completedDepth = 0;

        for (let d = 1; d <= depth; d++) {
            const result = this.minimax(board, d, -Infinity, Infinity, board.turn === 'white');
            if (this.isAborted) break;
            if (result.move) {
                bestMove = result.move;
                completedDepth = d;
            }
        }

        const timeTaken = Date.now() - this.startTime;
        console.log(`[ENGINE] Turn: ${board.turn} | Depth Reached: ${completedDepth}/${depth} | Nodes: ${this.nodesEvaluated}/${this.maxNodes} | Time: ${timeTaken}ms/${this.timeLimit}ms | Aborted: ${this.isAborted} | Best Move:`, bestMove);
        
        return { move: bestMove, nodeCount: this.nodesEvaluated };
    }

    checkAbort() {
        if (this.isAborted) return true;
        if (this.nodesEvaluated >= this.maxNodes) {
            this.isAborted = true;
            return true;
        }
        
        this.opsCount++;
        if (this.opsCount % 100 === 0 && Date.now() - this.startTime >= this.timeLimit) {
            this.isAborted = true;
            return true;
        }
        return false;
    }

    generateMoves(board, isWhite) {
        const moves = [];
        const files = 'abcdefgh';
        for (let r = 1; r <= 8; r++) {
            for (const f of files) {
                const from = f + r;
                const p = board.board[from];
                if (p && (isWhite ? p === p.toUpperCase() : p === p.toLowerCase())) {
                    for (let r2 = 1; r2 <= 8; r2++) {
                        for (const f2 of files) {
                            if (this.checkAbort()) return moves;
                            const to = f2 + r2;
                            if (board.isValidMove(from, to)) {
                                moves.push({ from, to });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    minimax(board, depth, alpha, beta, isMaximizingPlayer) {
        this.nodesEvaluated++;
        if (this.checkAbort()) return { score: 0 };

        if (depth === 0) {
            return { score: Evaluator.evaluate(board) };
        }

        const moves = this.generateMoves(board, isMaximizingPlayer);
        if (this.isAborted) return { score: 0 };

        if (moves.length === 0) {
            if (board.isCheck(isMaximizingPlayer ? 'white' : 'black')) {
                return { score: isMaximizingPlayer ? -10000 : 10000 };
            }
            return { score: 0 }; // Stalemate
        }

        let bestMove = moves[0];
        let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

        for (const move of moves) {
            if (this.checkAbort()) break;

            const clonedBoard = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
            clonedBoard.board = { ...board.board };
            clonedBoard.move(move.from, move.to);

            const result = this.minimax(clonedBoard, depth - 1, alpha, beta, !isMaximizingPlayer);
            if (this.isAborted) break;

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

            if (beta <= alpha) break; // Alpha-beta pruning
        }

        return { score: bestScore, move: bestMove };
    }
}