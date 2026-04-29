const GameSession = require('../models/GameSession');
const Score = require('../models/Score');

const getUserStats = async (userId) => {
  // Total sessions
  const sessions = await GameSession.find({ user_id: userId }).sort({ created_at: -1 });

  const totalGames = sessions.length;
  const wins = sessions.filter((s) => s.result === 'win').length;
  const losses = sessions.filter((s) => s.result === 'lose').length;
  const draws = sessions.filter((s) => s.result === 'draw').length;

  // Best streak from scores table
  const streakData = await Score.find({ user_id: userId }).sort({ streak: -1 }).limit(1);

  const bestStreak = streakData.length > 0 ? streakData[0].streak : 0;

  // Recent activity (last 10 games)
  const recentActivity = sessions.slice(0, 10).map((s) => ({
    game_type: s.game_type,
    result: s.result,
    score: s.score,
    created_at: s.created_at,
  }));

  return { totalGames, wins, losses, draws, bestStreak, recentActivity };
};

module.exports = { getUserStats };
