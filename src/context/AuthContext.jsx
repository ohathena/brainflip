import { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { saveUserProfile, getUserProfile } from '../services/firestoreService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch user profile from Firestore with timeout
          try {
            const profile = await Promise.race([
              getUserProfile(firebaseUser.uid),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]);
            setUserProfile(profile || {});
          } catch (profileError) {
            console.warn('Could not load user profile:', profileError);
            setUserProfile({}); // Set empty profile instead of failing
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error in auth state listener:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (username, email, password) => {
    try {
      setError(null);
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user profile to Firestore asynchronously (non-blocking)
      saveUserProfile(result.user.uid, {
        username,
        email,
        uid: result.user.uid,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
      }).catch((firestoreError) => {
        console.warn('Could not save profile to Firestore:', firestoreError);
        // Silent fail - auth was successful, profile will be created on next login attempt
      });

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    setUserProfile,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
