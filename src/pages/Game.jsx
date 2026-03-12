// React hooks import kar rahe hain
// useState -> component ke andar state (data) store karne ke liye
// useEffect -> component load hone ya state change hone par code run karne ke liye
import { useState, useEffect } from 'react';

// React Router ka hook navigation ke liye (page change karne ke liye)
import { useNavigate } from 'react-router-dom';

// Custom authentication hook (user info aur logout function deta hai)
import { useAuth } from '../context/AuthContext';

// GameCard ek component hai jo ek card render karta hai
import GameCard from '../components/GameCard';

// Game utilities
// generateCards -> shuffled cards create karta hai
// cardsMatch -> check karta hai ki 2 cards match hain ya nahi
import { generateCards, cardsMatch } from '../utils/gameUtils';

// Firebase Firestore me game stats save karne ke liye
import { saveGameStats } from '../services/firestoreService';

// Game ka CSS
import '../styles/Game.css';


// Main Game Component
export default function Game() {

  // Navigation function
  const navigate = useNavigate();

  // Auth context se user data aur logout function
  const { user, userProfile, logout } = useAuth();

  // Difficulty state (default easy)
  const [difficulty, setDifficulty] = useState('easy');

  // Cards array (game board ke cards)
  const [cards, setCards] = useState([]);

  // Abhi flip hue cards
  const [flipped, setFlipped] = useState([]);

  // Matched cards
  const [matched, setMatched] = useState([]);

  // Player moves count
  const [moves, setMoves] = useState(0);

  // Game timer (seconds)
  const [time, setTime] = useState(0);

  // Game start hua hai ya nahi
  const [gameStarted, setGameStarted] = useState(false);

  // Game jeet liya ya nahi
  const [gameWon, setGameWon] = useState(false);

  // Best time localStorage se load
  const [bestTime, setBestTime] = useState(localStorage.getItem('bestTime') || null);

  // Best moves localStorage se load
  const [bestMoves, setBestMoves] = useState(localStorage.getItem('bestMoves') || null);


  // =========================
  // GAME INITIALIZATION
  // =========================

  // Ye effect run hoga jab component load hoga ya difficulty change hogi
  useEffect(() => {

    // Difficulty ke according cards generate
    const newCards = generateCards(difficulty);

    // Cards state update
    setCards(newCards);

    // Game reset
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);

  }, [difficulty]); // dependency -> difficulty change hone par run


  // =========================
  // TIMER LOGIC
  // =========================

  useEffect(() => {

    let timer;

    // Timer tab chalega jab game start ho aur game jeeta na ho
    if (gameStarted && !gameWon) {

      // Har second me time +1
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }

    // Cleanup function (memory leak avoid karta hai)
    return () => clearInterval(timer);

  }, [gameStarted, gameWon]);


  // =========================
  // CHECK IF GAME WON
  // =========================

  useEffect(() => {

    // Agar sab cards match ho gaye
    if (cards.length > 0 && matched.length === cards.length) {

      setGameWon(true); // game jeet gaye
      setGameStarted(false); // timer stop

      // ===== BEST TIME UPDATE =====
      if (!bestTime || time < parseInt(bestTime)) {

        setBestTime(time);
        localStorage.setItem('bestTime', time);
      }

      // ===== BEST MOVES UPDATE =====
      if (!bestMoves || moves < parseInt(bestMoves)) {

        setBestMoves(moves);
        localStorage.setItem('bestMoves', moves);
      }

      // ===== SAVE STATS TO FIREBASE =====
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


  // =========================
  // RESET GAME
  // =========================

  const handleResetGame = () => {

    // New cards generate
    const newCards = generateCards(difficulty);

    setCards(newCards);

    // Game reset
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  };


  // =========================
  // CARD CLICK LOGIC
  // =========================

  const handleCardClick = (index) => {

    // Agar card already flipped hai ya match ho chuka hai ya game khatam hai
    if (flipped.includes(index) || matched.includes(index) || gameWon) {
      return;
    }

    // First click par game start
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Flipped cards update
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // Agar 2 cards flip ho gaye
    if (newFlipped.length === 2) {

      const [first, second] = newFlipped;

      // Match check
      if (cardsMatch(cards[first], cards[second])) {

        // Agar match hua to matched array update
        setMatched([...matched, first, second]);
      }

      // Moves increase
      setMoves(moves + 1);

      // 500ms baad cards wapas close
      setTimeout(() => setFlipped([]), 500);
    }
  };


  // =========================
  // GAME STATS
  // =========================

  // Total pairs
  const totalPairs = cards.length / 2;

  // Matched pairs
  const matchedPairs = matched.length / 2;

  // Accuracy calculate
  const accuracy = moves > 0 ? Math.round((totalPairs / moves) * 100) : 0;


  // =========================
  // TIME FORMAT FUNCTION
  // =========================

  const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    // mm:ss format
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // =========================
  // LOGOUT FUNCTION
  // =========================

  const handleLogout = async () => {

    try {

      await logout(); // Firebase logout
      navigate('/'); // home page

    } catch (err) {

      console.error('Logout error:', err);
    }
  };


  // =========================
  // UI RENDER
  // =========================

  return (

    <div className="game-container">

      {/* Header */}
      <header className="game-header">

        <h1>Memory Card Game</h1>

        <div className="game-header-right">

          {/* Username */}
          <span className="game-username">
            Playing as: {userProfile?.username || user?.email}
          </span>

          {/* Logout button */}
          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* Game Content */}
      <div className="game-content">

        {/* Game statistics */}
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


        {/* Difficulty selector (game start hone se pehle hi dikhega) */}
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


        {/* Win message */}
        {gameWon && (

          <div className="win-message">

            <h2>🎉 Congratulations! 🎉</h2>

            <p>
              You won in {moves} moves and {formatTime(time)}!
            </p>

          </div>
        )}


        {/* Game Board */}
        <div
          className="game-board"
          style={{
            gridTemplateColumns:
              difficulty === 'easy'
                ? 'repeat(4, 1fr)'
                : difficulty === 'medium'
                ? 'repeat(4, 1fr)'
                : 'repeat(5, 1fr)',
          }}
        >

          {/* Cards render */}
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


        {/* Action Buttons */}
        <div className="game-actions">

          <button
            className="btn btn-primary"
            onClick={handleResetGame}
          >
            Reset Game
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Main Menu
          </button>

        </div>

      </div>

    </div>
  );
}