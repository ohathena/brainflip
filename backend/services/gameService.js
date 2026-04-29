const GameSession = require('../models/GameSession');
const Score = require('../models/Score');

const saveGameResult = async ({ userId, gameType, score, result, streak }) => {
  // Insert into game_sessions
  await GameSession.create({ user_id: userId, game_type: gameType, score, result });

  // Insert into scores
  await Score.create({ user_id: userId, game_type: gameType, score, streak: streak || 0 });

  return { success: true };
};

module.exports = { saveGameResult };
