const leaderboardService = require('../services/leaderboardService');

const getLeaderboard = async (req, res, next) => {
  try {
    const { gameType } = req.query;
    const data = await leaderboardService.getLeaderboard(gameType || null);
    res.json({ leaderboard: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };
