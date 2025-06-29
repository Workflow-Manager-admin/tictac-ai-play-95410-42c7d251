import React, { useState, useEffect } from 'react';
import './App.css';

// Color variables as defined by request
const COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#ff9800',
};

// Utility to generate an empty game board
function getInitialBoard() {
  return Array(9).fill(null);
}

// Simple AI: Pick a random available cell
function aiMove(board) {
  const available = board
    .map((v, i) => (v === null ? i : null))
    .filter((i) => i !== null);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// Check win/draw; returns {winner, combo} or null
function calculateWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return {winner: board[a], combo: [a,b,c]};
  }
  if (board.every((cell) => cell !== null)) return {winner: 'draw', combo: []};
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // UI State
  const [theme, setTheme] = useState('auto');
  const [mode, setMode] = useState(null); // 'pvp' | 'ai' | null
  const [board, setBoard] = useState(getInitialBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('');
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Theme switching effect (light/dark/auto)
  useEffect(() => {
    let appTheme = theme;
    if (theme === 'auto') {
      appTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [theme]);
  
  // Watch for win/draw after every move
  useEffect(() => {
    const result = calculateWinner(board);
    setWinnerInfo(result);
    if (result) {
      if (result.winner === 'draw') setStatus('Draw! Nobody wins.');
      else setStatus(`Winner: ${result.winner === 'X' ? 'Player 1' : (mode === 'pvp' ? 'Player 2' : 'AI')}`);
    } else {
      if (!mode) setStatus('');
      else if (mode === 'pvp') setStatus(`Your turn: ${xIsNext ? 'Player 1 (X)' : 'Player 2 (O)'}`);
      else setStatus(`Your turn: ${xIsNext ? 'You (X)' : 'AI (O)'}`);
    }
  }, [board, xIsNext, mode]);

  // AI makes a move if needed
  useEffect(() => {
    if (
      mode === 'ai' &&
      !winnerInfo &&
      !xIsNext &&
      !aiThinking
    ) {
      setAiThinking(true);
      setTimeout(() => {
        const idx = aiMove(board);
        if (idx !== null) {
          const nextBoard = [...board];
          nextBoard[idx] = 'O';
          setBoard(nextBoard);
          setXIsNext(true);
        }
        setAiThinking(false);
      }, 450); // quick but visible delay
    }
    // eslint-disable-next-line
  }, [board, mode, xIsNext, winnerInfo]);

  // PUBLIC_INTERFACE
  const handleCellClick = (idx) => {
    if (!mode || board[idx] !== null || winnerInfo || (mode === 'ai' && !xIsNext)) return;
    const nextBoard = [...board];
    nextBoard[idx] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setBoard(getInitialBoard());
    setXIsNext(true);
    setWinnerInfo(null);
    setStatus(mode
      ? (mode === 'pvp'
          ? 'Your turn: Player 1 (X)'
          : 'Your turn: You (X)')
      : ''
    );
    setAiThinking(false);
  };

  // PUBLIC_INTERFACE
  const handleChooseMode = (selectedMode) => {
    setMode(selectedMode);
    setBoard(getInitialBoard());
    setXIsNext(true);
    setWinnerInfo(null);
    setStatus(selectedMode === 'pvp'
      ? 'Your turn: Player 1 (X)'
      : 'Your turn: You (X)'
    );
    setAiThinking(false);
  };

  // PUBLIC_INTERFACE
  const handleThemeToggle = () => {
    setTheme((prev) =>
      prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto'
    );
  };

  // UI Components:

  // PUBLIC_INTERFACE
  function Navbar() {
    return (
      <nav className="navbar">
        <span className="navbar-title" style={{color: COLORS.primary}}>Tic Tac Toe</span>
        <button
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-label="Switch theme"
          style={{ borderColor: COLORS.accent }}
        >
          {theme === 'auto' ? '🌓 Auto' : theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </nav>
    );
  }

  // PUBLIC_INTERFACE
  function GameBoard() {
    // Highlight winning combo if any
    let highlight = Array(9).fill(false);
    if (winnerInfo && winnerInfo.combo) {
      for (const i of winnerInfo.combo) highlight[i] = true;
    }
    return (
      <div className="board-wrapper">
        <div className="game-board">
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={
                "board-cell" +
                (highlight[idx] ? " cell-win" : "") +
                (board[idx] == null && !winnerInfo ? " cell-hover" : "")
              }
              style={{
                color: cell === 'X' ? COLORS.primary : cell === 'O' ? COLORS.accent : '',
                cursor: (board[idx] === null && (!winnerInfo && (mode !== 'ai' || xIsNext))) ? 'pointer' : 'default'
              }}
              onClick={() => handleCellClick(idx)}
              disabled={board[idx] !== null || !!winnerInfo || (mode === 'ai' && !xIsNext)}
              aria-label={`cell ${idx + 1}${cell ? ' ' + cell : ''}`}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function ModeSelect() {
    return (
      <div className="mode-select card">
        <h2>Start New Game</h2>
        <button className="btn primary" onClick={() => handleChooseMode('pvp')}>
          Player vs Player
        </button>
        <button className="btn accent" onClick={() => handleChooseMode('ai')}>
          Player vs AI
        </button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function StatusMessage() {
    if (!mode) return null;
    return (
      <div className="status-message" data-testid="status-message">
        {status}
        {aiThinking && <span className="ai-thinking">AI is thinking…</span>}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function RestartButton() {
    return mode ? (
      <button className="btn secondary restart-btn" onClick={handleReset}>
        Restart Game
      </button>
    ) : null;
  }

  // PUBLIC_INTERFACE
  function Notification() {
    // Win/Loss/Draw notification below the board
    if (winnerInfo) {
      let msg;
      if (winnerInfo.winner === 'draw') msg = "It's a draw! Play again?";
      else if (winnerInfo.winner === 'X')
        msg = mode === 'ai' ? 'You win! 🎉' : 'Player 1 wins! 🎉';
      else
        msg = mode === 'ai' ? 'AI wins! 🤖' : 'Player 2 wins! 🎉';
      return (
        <div className="notification">
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  }

  // PUBLIC_INTERFACE
  function Layout() {
    return (
      <div className="app-container">
        <Navbar />
        <main>
          {!mode ? <ModeSelect /> : (
            <div className="game-section">
              <StatusMessage />
              <GameBoard />
              <Notification />
              <RestartButton />
            </div>
          )}
        </main>
        <footer className="footer">
          <span style={{ color: COLORS.secondary, fontSize: 13 }}>
            Modern React Tic Tac Toe &mdash; Minimal UI
          </span>
        </footer>
      </div>
    );
  }

  return <Layout />;
}

export default App;
