const gameService = require('../services/gameService');

const saveResult = async (req, res, next) => {
  try {
    const { gameType, score, result, streak } = req.body;
    const userId = req.user.id;

    if (!gameType || !result) {
      return res.status(400).json({ error: 'gameType and result are required' });
    }
    if (!['rps', 'memory'].includes(gameType)) {
      return res.status(400).json({ error: 'gameType must be rps or memory' });
    }
    if (!['win', 'lose', 'draw'].includes(result)) {
      return res.status(400).json({ error: 'result must be win, lose, or draw' });
    }

    const data = await gameService.saveGameResult({ userId, gameType, score: score || 0, result, streak });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { saveResult };
