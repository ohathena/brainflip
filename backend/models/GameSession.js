const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game_type: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'draw'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);
module.exports = GameSession;
