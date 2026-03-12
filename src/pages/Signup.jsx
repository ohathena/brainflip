// React ka hook state manage karne ke liye
import { useState } from 'react';

// React Router ka hook page navigation ke liye
import { useNavigate } from 'react-router-dom';

// Authentication context (signup function yaha se milega)
import { useAuth } from '../context/AuthContext';

// Signup/Login pages ka CSS
import '../styles/Auth.css';


// Signup component
export default function Signup() {

  // Form data ek object me store kar rahe hain
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Error message show karne ke liye state
  const [error, setError] = useState('');

  // Loading state (signup process chal raha hai ya nahi)
  const [loading, setLoading] = useState(false);

  // Navigation function (page change karne ke liye)
  const navigate = useNavigate();

  // Auth context se signup function
  const { signup } = useAuth();



  // =========================
  // INPUT CHANGE HANDLER
  // =========================

  const handleChange = (e) => {

    // Input field ka name aur value
    const { name, value } = e.target;

    // Form data update kar rahe hain
    setFormData(prev => ({

      ...prev, // previous values copy

      [name]: value // jis input ka name hai uski value update

    }));
  };



  // =========================
  // FORM SUBMIT FUNCTION
  // =========================

  const handleSubmit = async (e) => {

    // Form reload prevent
    e.preventDefault();

    // Error reset
    setError('');

    // Loading start
    setLoading(true);

    try {

      // =========================
      // INPUT VALIDATION
      // =========================

      // Agar koi field empty hai
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {

        throw new Error('Please fill in all fields');
      }

      // Username length check
      if (formData.username.length < 3) {

        throw new Error('Username must be at least 3 characters');
      }

      // Email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {

        throw new Error('Please enter a valid email');
      }

      // Password length check
      if (formData.password.length < 6) {

        throw new Error('Password must be at least 6 characters');
      }

      // Password match check
      if (formData.password !== formData.confirmPassword) {

        throw new Error('Passwords do not match');
      }


      // =========================
      // FIREBASE SIGNUP
      // =========================

      // Firebase me new user create karna
      await signup(
        formData.username,
        formData.email,
        formData.password
      );


      // Auth state update hone ke liye thoda delay
      setTimeout(() => {

        // Signup ke baad game page par redirect
        navigate('/game');

      }, 300);

    } catch (err) {

      // =========================
      // FIREBASE ERROR HANDLING
      // =========================

      // Firebase configuration problem
      if (err.code === 'auth/configuration-not-found') {

        setError('Firebase is not properly configured. Please enable Email/Password authentication in Firebase Console.');

      }

      // Email already exist
      else if (err.code === 'auth/email-already-in-use') {

        setError('Email already registered. Please login instead.');

      }

      // Weak password
      else if (err.code === 'auth/weak-password') {

        setError('Password is too weak. Please use a stronger password.');

      }

      // Invalid email
      else if (err.code === 'auth/invalid-email') {

        setError('Invalid email address.');

      }

      // Firebase authentication disabled
      else if (err.code === 'auth/operation-not-allowed') {

        setError('Email/Password authentication is not enabled. Please contact support.');

      }

      // Generic error
      else {

        setError(err.message || 'Sign up failed. Please try again.');
      }

    } finally {

      // Loading stop
      setLoading(false);
    }
  };



  // =========================
  // UI RENDER
  // =========================

  return (

    <div className="auth-container">

      {/* Signup card */}
      <div className="auth-card">

        <h1>🧠 Memory Card Game</h1>

        <h2>Sign Up</h2>


        {/* Error message show */}
        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* Signup form */}
        <form onSubmit={handleSubmit}>

          {/* Username input */}
          <div className="form-group">

            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              disabled={loading}
            />

          </div>


          {/* Email input */}
          <div className="form-group">

            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />

          </div>


          {/* Password input */}
          <div className="form-group">

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              disabled={loading}
            />

          </div>


          {/* Confirm password input */}
          <div className="form-group">

            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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

            {/* Loading text change */}
            {loading ? 'Creating account...' : 'Sign Up'}

          </button>

        </form>


        {/* Login link */}
        <p className="auth-link">

          Already have an account?{' '}

          <a href="/login">Login here</a>

        </p>

      </div>

    </div>
  );
}