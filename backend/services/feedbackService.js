const Feedback = require('../models/Feedback');

const submitFeedback = async ({ email, category, game, message, rating }) => {
  const feedback = await Feedback.create({ email, category, game, message, rating });
  return feedback;
};

module.exports = { submitFeedback };
