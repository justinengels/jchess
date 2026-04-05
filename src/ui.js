const boardElement = document.getElementById('board');
const pieces = {
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟'
};

const game = new Board();
let isSearching = false;
const engineWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

engineWorker.onmessage = (e) => {
    const { move, nodesEvaluated } = e.data;
    if (move) {
        game.move(move.from, move.to);
        game.turn = game.turn === 'white' ? 'black' : 'white';
        renderBoard();
        document.getElementById('status-text').textContent = 'Status: White to move';
        document.getElementById('nodes-text').textContent = `Nodes evaluated: ${nodesEvaluated}`;
    } else {
        console.error('Engine failed to find a move');
        document.getElementById('status-text').textContent = 'Status: Engine error';
    }
    isSearching = false;
    document.getElementById('heartbeat').style.backgroundColor = 'green';
};

function makeEngineMove() {
    if (isSearching || game.turn !== 'black') return;
    isSearching = true;
    document.getElementById('heartbeat').style.backgroundColor = 'red';
    
    document.getElementById('status-text').textContent = 'Status: Computer is thinking...';
    document.getElementById('nodes-text').textContent = 'Nodes evaluated: 0';

    const depth = parseInt(document.getElementById('depth').value);
    const timeLimit = parseInt(document.getElementById('time-limit').value);
    
    engineWorker.postMessage({
        boardData: { board: game.board, turn: game.turn },
        maxDepth: depth,
        timeLimit: timeLimit
    });
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
        game.turn = game.turn === 'white' ? 'black' : 'white';
        renderBoard();
        
        // Lock board
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => sq.draggable = false);
        
        makeEngineMove();
    }
}

renderBoard();
