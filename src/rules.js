class Board {
  constructor() {
    this.board = {};
    this.turn = 'white';
    // Pawns
    for (let i = 0; i < 8; i++) {
      this.board[String.fromCharCode(97 + i) + '2'] = 'P';
      this.board[String.fromCharCode(97 + i) + '7'] = 'p';
    }
    // Rooks
    this.board['a1'] = 'R'; this.board['h1'] = 'R';
    this.board['a8'] = 'r'; this.board['h8'] = 'r';
    // Knights
    this.board['b1'] = 'N'; this.board['g1'] = 'N';
    this.board['b8'] = 'n'; this.board['g8'] = 'n';
    // Bishops
    this.board['c1'] = 'B'; this.board['f1'] = 'B';
    this.board['c8'] = 'b'; this.board['f8'] = 'b';
    // Queens
    this.board['d1'] = 'Q'; this.board['d8'] = 'q';
    // Kings
    this.board['e1'] = 'K'; this.board['e8'] = 'k';
  }

  getPiece(square) {
    return this.board[square] || null;
  }

  isValidMove(from, to, ignoreCheck = false) {
    const piece = this.board[from];
    if (!piece) return false;

    const isWhite = piece === piece.toUpperCase();
    if ((isWhite && this.turn !== 'white') || (!isWhite && this.turn !== 'black')) {
      return false;
    }

    const targetPiece = this.board[to];
    if (targetPiece && (isWhite ? targetPiece === targetPiece.toUpperCase() : targetPiece === targetPiece.toLowerCase())) return false;

    const fromFile = from.charCodeAt(0);
    const fromRank = parseInt(from[1]);
    const toFile = to.charCodeAt(0);
    const toRank = parseInt(to[1]);

    const fileDiff = Math.abs(fromFile - toFile);
    const rankDiff = Math.abs(fromRank - toRank);

    if (piece.toUpperCase() === 'N') {
      return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);
    }

    if (piece.toUpperCase() === 'B') {
      if (fileDiff !== rankDiff || fileDiff === 0) return false;
      const fileStep = Math.sign(toFile - fromFile);
      const rankStep = Math.sign(toRank - fromRank);
      let currentFile = fromFile + fileStep;
      let currentRank = fromRank + rankStep;
      while (currentFile !== toFile || currentRank !== toRank) {
        if (this.board[String.fromCharCode(currentFile) + currentRank]) return false;
        currentFile += fileStep;
        currentRank += rankStep;
      }
      return true;
    }

    if (piece.toUpperCase() === 'R') {
      const fileStep = Math.sign(toFile - fromFile);
      const rankStep = Math.sign(toRank - fromRank);
      let currentFile = fromFile + fileStep;
      let currentRank = fromRank + rankStep;
      while (currentFile !== toFile || currentRank !== toRank) {
        if (this.board[String.fromCharCode(currentFile) + currentRank]) return false;
        currentFile += fileStep;
        currentRank += rankStep;
      }
      return (fileDiff === 0 && rankDiff > 0) || (fileDiff > 0 && rankDiff === 0);
    }

    if (piece.toUpperCase() === 'Q') {
      if (!(fileDiff === rankDiff && fileDiff > 0) && !(fileDiff === 0 && rankDiff > 0) && !(fileDiff > 0 && rankDiff === 0)) return false;
      const fileStep = Math.sign(toFile - fromFile);
      const rankStep = Math.sign(toRank - fromRank);
      let currentFile = fromFile + fileStep;
      let currentRank = fromRank + rankStep;
      while (currentFile !== toFile || currentRank !== toRank) {
        if (this.board[String.fromCharCode(currentFile) + currentRank]) return false;
        currentFile += fileStep;
        currentRank += rankStep;
      }
      return true;
    }

    if (piece.toUpperCase() === 'K') {
      // Castling
      if (fileDiff === 2 && rankDiff === 0 && fromRank === (isWhite ? 1 : 8)) {
        const rookFile = toFile > fromFile ? 'h' : 'a';
        const rookSquare = rookFile + fromRank;
        const rook = this.board[rookSquare];
        if (rook && rook.toUpperCase() === 'R') {
          return true;
        }
      }

      if ((fileDiff <= 1 && rankDiff <= 1) && (fileDiff > 0 || rankDiff > 0)) {
        if (!ignoreCheck) {
          const originalBoard = { ...this.board };
          this.board[to] = piece; this.board[from] = null;
          const attacked = this.isCheck(isWhite ? 'white' : 'black');
          this.board = originalBoard;
          return !attacked;
        }
        return true;
      }
      return false;
    }

    if (piece.toUpperCase() === 'P') {
      const direction = isWhite ? 1 : -1;
      const startRank = isWhite ? 2 : 7;
      if (fileDiff === 0 && (toRank - fromRank) === direction && !this.board[to]) return true;
      if (fileDiff === 0 && (toRank - fromRank) === 2 * direction && fromRank === startRank && !this.board[to] && !this.board[String.fromCharCode(fromFile) + (fromRank + direction)]) return true;
      if (fileDiff === 1 && (toRank - fromRank) === direction && this.board[to] && (isWhite ? this.board[to] === this.board[to].toLowerCase() : this.board[to] === this.board[to].toUpperCase())) return true;

      // En Passant
      if (fileDiff === 1 && (toRank - fromRank) === direction && this.lastMove && this.lastMove.to === (to[0] + from[1]) && this.board[to[0] + from[1]] && this.board[to[0] + from[1]].toUpperCase() === 'P' && Math.abs(parseInt(this.lastMove.from[1]) - parseInt(this.lastMove.to[1])) === 2) {
        return true;
      }
    }

    return false;
  }

  isCheck(color) {
    const kingSquare = Object.keys(this.board).find(
      (sq) => this.board[sq] === (color === 'white' ? 'K' : 'k')
    );
    if (!kingSquare) return false;

    const opponentPieces = Object.keys(this.board).filter((sq) => {
      const piece = this.board[sq];
      return piece && (color === 'white' ? piece === piece.toLowerCase() : piece === piece.toUpperCase());
    });

    for (const sq of opponentPieces) {
      // Temporarily set turn to opponent's color to allow isValidMove to check
      const originalTurn = this.turn;
      this.turn = color === 'white' ? 'black' : 'white';
      const canAttack = this.isValidMove(sq, kingSquare, true);
      this.turn = originalTurn;
      if (canAttack) return true;
    }
    return false;
  }

  isCheckmate(color) {
    if (!this.isCheck(color)) return false;

    // Check if any move can escape check
    const pieces = Object.keys(this.board).filter((sq) => {
      const piece = this.board[sq];
      return piece && (color === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase());
    });

    const originalTurn = this.turn;
    this.turn = color;

    for (const from of pieces) {
      for (let file = 97; file <= 104; file++) {
        for (let rank = 1; rank <= 8; rank++) {
          const to = String.fromCharCode(file) + rank;
          
          // Check if move is valid for the piece
          if (this.isValidMove(from, to, false)) {
            // Simulate move
            const originalBoard = { ...this.board };
            const pieceToMove = this.board[from];
            this.board[to] = pieceToMove;
            this.board[from] = null;
            
            // Check if still in check
            const stillInCheck = this.isCheck(color);
            this.board = originalBoard;
            
            if (!stillInCheck) {
              this.turn = originalTurn;
              return false;
            }
          }
        }
      }
    }
    this.turn = originalTurn;
    
    // If we reached here, no move can escape check.
    return true;
  }


  static fromFEN(fen) {
    const board = new Board();
    board.board = {};
    const [piecePlacement, turn] = fen.split(' ');
    const rows = piecePlacement.split('/');
    for (let i = 0; i < 8; i++) {
      let file = 0;
      for (const char of rows[i]) {
        if (isNaN(char)) {
          board.board[String.fromCharCode(97 + file) + (8 - i)] = char;
          file++;
        } else {
          file += parseInt(char);
        }
      }
    }
    board.turn = turn === 'w' ? 'white' : 'black';
    return board;
  }

  toFEN() {
    let fen = '';
    for (let rank = 8; rank >= 1; rank--) {
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const piece = this.board[square];
        if (piece) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (rank > 1) fen += '/';
    }
    fen += ` ${this.turn === 'white' ? 'w' : 'b'}`;
    return fen;
  }

  move(from, to) {
    const piece = this.board[from];
    if (!piece) return;
    if (piece.toUpperCase() === 'P' && from[0] !== to[0] && !this.board[to]) {
      this.board[to[0] + from[1]] = null; // En Passant
    }
    if (piece.toUpperCase() === 'K' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
      if (to[0] === 'g') { this.board['f' + from[1]] = this.board['h' + from[1]]; this.board['h' + from[1]] = null; }
      else if (to[0] === 'c') { this.board['d' + from[1]] = this.board['a' + from[1]]; this.board['a' + from[1]] = null; }
    }
    this.board[to] = piece;
    this.board[from] = null;
  }
}

export { Board };
