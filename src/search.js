import Evaluator from './eval.js';

export class Search {
    constructor() {
        this.nodesEvaluated = 0;
        this.startTime = 0;
        this.timeLimit = 1000;
        this.maxNodes = Infinity;
        this.isAborted = false;
    }

    log(msg) {
        const elapsed = Date.now() - this.startTime;
        console.log(`[${elapsed}ms] ${msg}`);
    }

    getBestMove(board, depth = 3, timeLimit = 1000, maxNodes = Infinity) {
        this.nodesEvaluated = 0;
        this.startTime = Date.now();
        this.timeLimit = timeLimit;
        this.maxNodes = maxNodes;
        this.isAborted = false;

        this.log(`=== SEARCH STARTED ===`);
        let bestMove = null;

        for (let d = 1; d <= depth; d++) {
            const result = this.minimax(board, d, -Infinity, Infinity, board.turn === 'white');
            
            // If the search was aborted, discard this incomplete depth's result
            if (this.isAborted) {
                this.log(`Search aborted at depth ${d} due to time/node limit.`);
                break; 
            }
            
            if (result.move) {
                bestMove = result.move;
            }
        }

        this.log(`=== SEARCH FINISHED ===`);
        return { move: bestMove, nodeCount: this.nodesEvaluated };
    }

    checkAbort() {
        this.log(`[BREADCRUMB] checkabort ${this.isAborted} on node ${this.nodesEvaluated}`);
        if (this.isAborted) return true;
        
        // Optimisation: Only check the clock periodically to avoid massive performance drops
       // if (this.nodesEvaluated % 1024 === 0) {
            if (Date.now() - this.startTime >= this.timeLimit) {
                this.isAborted = true;
                return true;
            }
        //}

        if (this.nodesEvaluated >= this.maxNodes) {
            this.isAborted = true;
            return true;
        }
        
        return false;
    }

    generateMoves(board, isWhite) {
        const moves = [];
        const files = 'abcdefgh';
        for (let r = 1; r <= 8; r++) {

            if (this.checkAbort()) return;
            for (const f of files) {

            if (this.checkAbort()) return;
                const from = f + r;
                const p = board.board[from];
                if (p && (isWhite ? p === p.toUpperCase() : p === p.toLowerCase())) {
                    for (let r2 = 1; r2 <= 8; r2++) {
                        for (const f2 of files) {

            if (this.checkAbort()) return;
                            // Removed checkAbort from this ultra-hot inner loop
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
        
        // Check for abort at the node level
        if (this.checkAbort()) return { score: 0 };

        if (depth === 0) {
            // Commented out to prevent console I/O from bottlenecking the search
             this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: ENTERING Evaluator.evaluate()`);
            const score = Evaluator.evaluate(board);
             this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: EXITED Evaluator.evaluate()`);
            return { score };
        }

         this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: ENTERING generateMoves()`);
        const moves = this.generateMoves(board, isMaximizingPlayer);
         this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: EXITED generateMoves()`);

        if (this.isAborted) return { score: 0 };

        if (moves.length === 0) {
            return { score: board.isCheck(isMaximizingPlayer ? 'white' : 'black') ? (isMaximizingPlayer ? -10000 : 10000) : 0 };
        }

        let bestMove = moves[0];
        let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

        for (const move of moves) {
            // Check before processing each child branch
            if (this.checkAbort()) break;

            const clonedBoard = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
            clonedBoard.board = { ...board.board };
            
             this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: ENTERING board.move(${move.from}->${move.to})`);
            clonedBoard.move(move.from, move.to);
             this.log(`[BREADCRUMB] Node ${this.nodesEvaluated}: EXITED board.move()`);

            const result = this.minimax(clonedBoard, depth - 1, alpha, beta, !isMaximizingPlayer);
            
            // Bubble up the abort immediately
            if (this.isAborted) return { score: 0 };

            if (isMaximizingPlayer) {
                if (result.score > bestScore) { bestScore = result.score; bestMove = move; }
                alpha = Math.max(alpha, bestScore);
            } else {
                if (result.score < bestScore) { bestScore = result.score; bestMove = move; }
                beta = Math.min(beta, bestScore);
            }
            if (beta <= alpha) break; 
        }

        return { score: bestScore, move: bestMove };
    }
}