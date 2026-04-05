const boardElement = document.getElementById('board');
const pieces = {
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟'
};

import Board from './rules.js';
const game = new Board();
window.game = game;
let isSearching = false;
const engineWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

engineWorker.onerror = (e) => {
    console.error("Worker Error:", e.message, e.filename, e.lineno);
    document.getElementById('status-text').textContent = 'Status: Engine error';
    document.getElementById('heartbeat').style.backgroundColor = 'red';
    isSearching = false;
};

engineWorker.onmessage = (e) => {
    const { move, nodeCount, error } = e.data;
    if (error) {
        console.error("ENGINE CRASH:", error, e.data.stack);
        document.getElementById('status-text').textContent = 'Status: Engine error';
        document.getElementById('heartbeat').style.backgroundColor = 'red';
        isSearching = false;
        return;
    }
    if (move) {
        document.getElementById('nodes-text').textContent = `Nodes evaluated: ${nodeCount}`;
        game.move(move.from, move.to);
        renderBoard();
        document.getElementById('status-text').textContent = `Status: ${game.turn.charAt(0).toUpperCase() + game.turn.slice(1)} to move`;
        
        // Unlock board
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => sq.draggable = true);
    }
    document.getElementById('status-text').textContent = `Status: ${game.turn.charAt(0).toUpperCase() + game.turn.slice(1)} to move`;
    document.getElementById('heartbeat').style.backgroundColor = 'green';
    isSearching = false;
};

function makeEngineMove() {
    if (isSearching || game.turn !== 'black') return;
    isSearching = true;
    document.getElementById('heartbeat').style.backgroundColor = 'red';
    
    document.getElementById('status-text').textContent = 'Status: Computer is thinking...';
    document.getElementById('nodes-text').textContent = 'Nodes evaluated: 0';

  const depthInput = document.getElementById('depth');
  const depth = depthInput ? parseInt(depthInput.value) || 2 : 2;
  const timeInput = document.getElementById('time-limit');
  const timeLimit = timeInput ? parseInt(timeInput.value) || 1000 : 1000;
  
  engineWorker.postMessage({ fen: game.toFEN(), depth, timeLimit });
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let rank = 8; rank >= 1; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = String.fromCharCode(97 + file) + rank;
            const squareElement = document.createElement('div');
            squareElement.className = `square ${(file + rank) % 2 === 0 ? 'black' : 'white'}`;
            squareElement.dataset.square = square;
            const piece = game.getPiece(square);
            if (piece) {
                squareElement.textContent = pieces[piece];
            }
            squareElement.draggable = true;
            squareElement.addEventListener('dragstart', (e) => {
                const piece = game.getPiece(square);
                if (piece && (game.turn === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
                    e.dataTransfer.setData('text/plain', square);
                } else {
                    e.preventDefault();
                }
            });
            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData('text/plain');
                handleMove(from, square);
            });
            boardElement.appendChild(squareElement);
        }
    }
}

function handleMove(from, to) {
    if (game.isValidMove(from, to)) {
        game.move(from, to);
        renderBoard();
        
        // Lock board
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => sq.draggable = false);
        
        setTimeout(makeEngineMove, 100);
    }
}

document.getElementById('auto-play').addEventListener('click', () => {
    if (game.turn === 'white') {
        // Simple auto-play: make a random move for white
        const moves = game.generateMoves();
        if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            game.move(move.from, move.to);
            renderBoard();
            setTimeout(makeEngineMove, 100);
        }
    } else {
        makeEngineMove();
    }
});

renderBoard();
