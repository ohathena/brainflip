// React ka hook import (state manage karne ke liye)
import { useState } from 'react';

// React Router ka hook navigation ke liye (page change karne ke liye)
import { useNavigate } from 'react-router-dom';

// Authentication context hook (login function yaha se milega)
import { useAuth } from '../context/AuthContext';

// Login page ka CSS
import '../styles/Auth.css';


// Login component
export default function Login() {

  // Email input ka state
  const [email, setEmail] = useState('');

  // Password input ka state
  const [password, setPassword] = useState('');

  // Error message show karne ke liye state
  const [error, setError] = useState('');

  // Loading state (login process chal raha hai ya nahi)
  const [loading, setLoading] = useState(false);

  // Page navigation function
  const navigate = useNavigate();

  // Auth context se login function
  const { login } = useAuth();



  // =========================
  // FORM SUBMIT FUNCTION
  // =========================

  const handleSubmit = async (e) => {

    // Form default reload behaviour prevent
    e.preventDefault();

    // Error reset
    setError('');

    // Loading true (button disable + loading text)
    setLoading(true);

    try {

      // =========================
      // INPUT VALIDATION
      // =========================

      // Agar email ya password empty hai
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // Email format validation (regex use karke)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email');
      }

      // =========================
      // FIREBASE LOGIN
      // =========================

      // Firebase authentication attempt
      await login(email, password);

      
      // Auth state update hone ke liye thoda delay
      setTimeout(() => {

        // Login ke baad game page par redirect
        navigate('/game');

      }, 300);

    } catch (err) {

      // =========================
      // FIREBASE ERROR HANDLING
      // =========================

      // Firebase configuration issue
      if (err.code === 'auth/configuration-not-found') {

        setError('Firebase is not properly configured. Please enable Email/Password authentication in Firebase Console.');

      }

      // User exist nahi karta
      else if (err.code === 'auth/user-not-found') {

        setError('Email not found. Please sign up first.');

      }

      // Password galat
      else if (err.code === 'auth/wrong-password') {

        setError('Invalid password. Please try again.');

      }

      // Invalid email format
      else if (err.code === 'auth/invalid-email') {

        setError('Invalid email address.');

      }

      // Bahut zyada login attempts
      else if (err.code === 'auth/too-many-requests') {

        setError('Too many failed login attempts. Please try again later.');

      }

      // Generic error
      else {

        setError(err.message || 'Login failed. Please try again.');
      }

    } finally {

      // Loading state false (button normal ho jayega)
      setLoading(false);
    }
  };



  // =========================
  // UI RENDER
  // =========================

  return (

    <div className="auth-container">

      {/* Login card */}
      <div className="auth-card">

        <h1>🧠 Memory Card Game</h1>

        <h2>Login</h2>

        
        {/* Agar error hai to show karo */}
        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* Login form */}
        <form onSubmit={handleSubmit}>

          {/* Email input */}
          <div className="form-group">

            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email} // state se value bind
              onChange={(e) => setEmail(e.target.value)} // typing par state update
              placeholder="Enter your email"
              required
              disabled={loading} // loading me disable
            />

          </div>


          {/* Password input */}
          <div className="form-group">

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

          </div>


          {/* Submit button */}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >

            {/* Agar loading hai to text change */}
            {loading ? 'Logging in...' : 'Login'}

          </button>

        </form>


        {/* Signup link */}
        <p className="auth-link">

          Don't have an account?{' '}

          <a href="/signup">Sign up here</a>

        </p>

      </div>

    </div>
  );
}