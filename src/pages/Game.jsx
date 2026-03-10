import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import { generateCards, cardsMatch } from '../utils/gameUtils';
import { saveGameStats } from '../services/firestoreService';
import '../styles/Game.css';

export default function Game() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestTime, setBestTime] = useState(localStorage.getItem('bestTime') || null);
  const [bestMoves, setBestMoves] = useState(localStorage.getItem('bestMoves') || null);

  // Initialize game on mount and difficulty change
  // Batch multiple state updates together for resetting entire game state
  useEffect(() => {
    const newCards = generateCards(difficulty);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !gameWon) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameWon]);

  // Check if game is won and save stats
  // Batch state updates when game is won
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setGameWon(true);
      setGameStarted(false);
      
      // Update best time if current time is better
      if (!bestTime || time < parseInt(bestTime)) {
        setBestTime(time);
        localStorage.setItem('bestTime', time);
      }
      
      // Update best moves if current moves is better
      if (!bestMoves || moves < parseInt(bestMoves)) {
        setBestMoves(moves);
        localStorage.setItem('bestMoves', moves);
      }
      
      // Save game stats to Firestore
      if (user) {
        saveGameStats(user.uid, {
          difficulty,
          moves,
          time,
          matchedPairs: matched.length / 2,
          totalPairs: cards.length / 2,
          won: true,
        }).catch(err => console.error('Error saving game stats:', err));
      }
    }
  }, [matched, cards, difficulty, moves, time, user, bestTime, bestMoves]);

  const handleResetGame = () => {
    const newCards = generateCards(difficulty);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  };

  const handleCardClick = (index) => {
    // Don't allow clicks if card is already flipped/matched or game is won
    if (flipped.includes(index) || matched.includes(index) || gameWon) {
      return;
    }

    // Start game on first click
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Add card to flipped array
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      
      if (cardsMatch(cards[first], cards[second])) {
        // Cards match
        setMatched([...matched, first, second]);
      }
      
      // Increment moves
      setMoves(moves + 1);

      // Reset flipped after 500ms
      setTimeout(() => setFlipped([]), 500);
    }
  };

  const totalPairs = cards.length / 2;
  const matchedPairs = matched.length / 2;
  const accuracy = moves > 0 ? Math.round((totalPairs / moves) * 100) : 0;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Memory Card Game</h1>
        <div className="game-header-right">
          <span className="game-username">Playing as: {userProfile?.username || user?.email}</span>
          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="game-content">
        <div className="game-info">
          <div className="info-box">
            <h3>⏱️ Time</h3>
            <p className="info-value">{formatTime(time)}</p>
            {bestTime && <p className="info-best">Best: {formatTime(bestTime)}</p>}
          </div>
          <div className="info-box">
            <h3>🎯 Moves</h3>
            <p className="info-value">{moves}</p>
            {bestMoves && <p className="info-best">Best: {bestMoves}</p>}
          </div>
          <div className="info-box">
            <h3>✨ Accuracy</h3>
            <p className="info-value">{accuracy}%</p>
            <p className="info-label">({matchedPairs}/{totalPairs} pairs)</p>
          </div>
          <div className="info-box">
            <h3>🎁 Matched</h3>
            <p className="info-value">{matchedPairs}/{totalPairs}</p>
          </div>
        </div>

        {!gameStarted && !gameWon && (
          <div className="difficulty-selector">
            <h3>Select Difficulty:</h3>
            <div className="difficulty-buttons">
              <button 
                className={`btn-difficulty ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                Easy (4x3)
              </button>
              <button 
                className={`btn-difficulty ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                Medium (4x4)
              </button>
              <button 
                className={`btn-difficulty ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                Hard (5x4)
              </button>
            </div>
            <p className="difficulty-hint">Click a card to start playing!</p>
          </div>
        )}

        {gameWon && (
          <div className="win-message">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You won in {moves} moves and {formatTime(time)}!</p>
          </div>
        )}

        <div 
          className="game-board"
          style={{
            gridTemplateColumns: difficulty === 'easy' ? 'repeat(4, 1fr)' : 
                                difficulty === 'medium' ? 'repeat(4, 1fr)' :
                                'repeat(5, 1fr)'
          }}
        >
          {cards.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              isFlipped={flipped.includes(index)}
              isMatched={matched.includes(index)}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>

        <div className="game-actions">
          <button className="btn btn-primary" onClick={handleResetGame}>
            Reset Game
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
