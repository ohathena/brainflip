const Score = require('../models/Score');

const getLeaderboard = async (gameType) => {
  const query = gameType ? { game_type: gameType } : {};
  
  const data = await Score.find(query)
    .sort({ score: -1 })
    .limit(10)
    .populate('user_id', 'username')
    .exec();

  return data.map((row, index) => ({
    rank: index + 1,
    username: row.user_id ? row.user_id.username : 'Unknown',
    game_type: row.game_type,
    score: row.score,
    streak: row.streak,
    created_at: row.created_at,
  }));
};

module.exports = { getLeaderboard };
