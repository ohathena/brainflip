const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
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
  streak: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Score = mongoose.model('Score', scoreSchema);
module.exports = Score;
