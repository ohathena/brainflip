const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  game: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
