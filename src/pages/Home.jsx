import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firestoreService';
import '../styles/Home.css';
import { useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout, isAuthenticated, setUserProfile } = useAuth();

  // Refresh user profile whenever we return to Home page
  useEffect(() => {
    const refreshStats = async () => {
      if (user && isAuthenticated) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (err) {
          console.warn('Could not refresh profile:', err);
        }
      }
    };

    // Refresh stats whenever we mount or when the location changes to home
    refreshStats();
  }, [location.pathname, user, setUserProfile]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="home-container">
      {isAuthenticated && (
        <div className="top-navbar">
          <div className="navbar-user">
            <span className="user-email">{userProfile?.username || user?.email}</span>
          </div>
          <button className="btn-logout-header" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <header className="home-header">
        <h1> Memory Card Game</h1>
        <p>Test your memory and have fun!</p>
      </header>

      <div className="home-content">
        <section className="hero-section">
          <p>This is a fun memory card game where you flip cards to find matching pairs.</p>
        </section>

        {isAuthenticated && (
          <section className="user-stats">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{userProfile?.totalGamesPlayed || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Games Won</span>
                <span className="stat-value">{userProfile?.totalGamesWon || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Time</span>
                <span className="stat-value">
                  {userProfile?.bestTime ? `${Math.floor(userProfile.bestTime / 60)}:${(userProfile.bestTime % 60).toString().padStart(2, '0')}` : '-'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Moves</span>
                <span className="stat-value">{userProfile?.bestMoves || '-'}</span>
              </div>
            </div>
          </section>
        )}

        {!isAuthenticated ? (
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/game')}
            >
              Play Now
            </button>
          </div>
        )}

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
