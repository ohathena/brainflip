// React Router ke hooks import kar rahe hain
// useNavigate -> page change karne ke liye
// useLocation -> current route/path detect karne ke liye
import { useNavigate, useLocation } from 'react-router-dom';

// Authentication context hook (user data aur auth functions deta hai)
import { useAuth } from '../context/AuthContext';

// Firestore se user profile fetch karne ka function
import { getUserProfile } from '../services/firestoreService';

// Home page ka CSS
import '../styles/Home.css';

// React ka hook (side effects run karne ke liye)
import { useEffect } from 'react';


// Home component
export default function Home() {

  // Navigation function (page change karne ke liye)
  const navigate = useNavigate();

  // Current location (route/path)
  const location = useLocation();

  // Auth context se data le rahe hain
  const { user, userProfile, logout, isAuthenticated, setUserProfile } = useAuth();



  // =========================
  // USER PROFILE REFRESH
  // =========================

  // Ye effect tab run hoga jab component mount ho ya route change ho
  useEffect(() => {

    // Async function jo Firestore se latest profile fetch karega
    const refreshStats = async () => {

      // Agar user logged in hai
      if (user && isAuthenticated) {

        try {

          // Firestore se user profile fetch
          const profile = await getUserProfile(user.uid);

          // Agar profile mila to context update karo
          if (profile) {
            setUserProfile(profile);
          }

        } catch (err) {

          // Agar error aaye to console me warning
          console.warn('Could not refresh profile:', err);
        }
      }
    };

    // Component mount hone ya path change hone par stats refresh karo
    refreshStats();

  }, [location.pathname, user, setUserProfile]); 
  // Dependencies -> path change, user change ya setUserProfile change



  // =========================
  // LOGOUT FUNCTION
  // =========================

  const handleLogout = async () => {

    try {

      // Firebase logout
      await logout();

    } catch (err) {

      // Error log
      console.error('Logout error:', err);
    }
  };



  // =========================
  // UI RENDER
  // =========================

  return (

    // Main container
    <div className="home-container">

      {/* Top navbar sirf tab dikhega jab user login ho */}
      {isAuthenticated && (

        <div className="top-navbar">

          {/* User email / username */}
          <div className="navbar-user">
            <span className="user-email">
              {userProfile?.username || user?.email}
            </span>
          </div>

          {/* Logout button */}
          <button
            className="btn-logout-header"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      )}



      {/* Page header */}
      <header className="home-header">

        <h1> Memory Card Game</h1>

        <p>Test your memory and have fun!</p>

      </header>



      {/* Main content */}
      <div className="home-content">

        {/* Hero section (game description) */}
        <section className="hero-section">

          <p>
            This is a fun memory card game where you flip cards to find matching pairs.
          </p>

        </section>



        {/* =========================
           USER STATS SECTION
           ========================= */}

        {/* Ye section sirf logged in user ko dikhega */}
        {isAuthenticated && (

          <section className="user-stats">

            <h3>Your Stats</h3>

            <div className="stats-grid">

              {/* Total games played */}
              <div className="stat-item">

                <span className="stat-label">Games Played</span>

                <span className="stat-value">
                  {userProfile?.totalGamesPlayed || 0}
                </span>

              </div>



              {/* Total games won */}
              <div className="stat-item">

                <span className="stat-label">Games Won</span>

                <span className="stat-value">
                  {userProfile?.totalGamesWon || 0}
                </span>

              </div>



              {/* Best time */}
              <div className="stat-item">

                <span className="stat-label">Best Time</span>

                <span className="stat-value">

                  {/* Agar bestTime hai to usko mm:ss format me convert */}
                  {userProfile?.bestTime
                    ? `${Math.floor(userProfile.bestTime / 60)}:${(userProfile.bestTime % 60).toString().padStart(2, '0')}`
                    : '-'}

                </span>

              </div>



              {/* Best moves */}
              <div className="stat-item">

                <span className="stat-label">Best Moves</span>

                <span className="stat-value">
                  {userProfile?.bestMoves || '-'}
                </span>

              </div>

            </div>

          </section>

        )}



        {/* =========================
           AUTH BUTTONS
           ========================= */}

        {/* Agar user login nahi hai */}
        {!isAuthenticated ? (

          <div className="button-group">

            {/* Login button */}
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            {/* Signup button */}
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>

          </div>

        ) : (

          // Agar user login hai
          <div className="button-group">

            {/* Game start button */}
            <button
              className="btn btn-primary"
              onClick={() => navigate('/game')}
            >
              Play Now
            </button>

          </div>

        )}



        {/* =========================
           HOW TO PLAY SECTION
           ========================= */}

        <section className="how-to-play">

          <h3>How to Play:</h3>

          <ul>

            <li>Click on cards to reveal their images</li>

            <li>Find matching pairs of cards</li>

            <li>Match all pairs to win the game</li>

            <li>Your time and moves are tracked</li>

          </ul>

        </section>

      </div>

    </div>
  );
}