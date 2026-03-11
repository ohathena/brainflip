const userService = require('../services/userService');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await userService.getUserStats(userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
