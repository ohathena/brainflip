import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

// Create or update user profile
export const saveUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Save game score/stats
export const saveGameStats = async (userId, gameData) => {
  try {
    const timestamp = new Date();
    const gameRef = doc(collection(db, 'users', userId, 'gameSessions'));
    
    await setDoc(gameRef, {
      difficulty: gameData.difficulty,
      moves: gameData.moves,
      time: gameData.time,
      matchedPairs: gameData.matchedPairs,
      totalPairs: gameData.totalPairs,
      won: gameData.won,
      completedAt: timestamp,
    });

    // Update user stats
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        totalGamesPlayed: (userData.totalGamesPlayed || 0) + 1,
        totalGamesWon: gameData.won ? (userData.totalGamesWon || 0) + 1 : userData.totalGamesWon || 0,
        bestTime: !userData.bestTime || gameData.time < userData.bestTime ? gameData.time : userData.bestTime,
        bestMoves: !userData.bestMoves || gameData.moves < userData.bestMoves ? gameData.moves : userData.bestMoves,
        updatedAt: timestamp,
      });
    }

    return true;
  } catch (error) {
    console.error('Error saving game stats:', error);
    throw error;
  }
};

// Get user game sessions
export const getUserGameSessions = async (userId) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'gameSessions');
    const q = query(sessionsRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting game sessions:', error);
    throw error;
  }
};

// Get leaderboard (top 10 players by wins)
export const getLeaderboard = async (limit_count = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('totalGamesWon', 'desc'),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};
