const feedbackService = require('../services/feedbackService');

const submitFeedback = async (req, res, next) => {
  try {
    const { email, category, game, message, rating } = req.body;

    if (!category || !message) {
      return res.status(400).json({ error: 'category and message are required' });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const data = await feedbackService.submitFeedback({ email, category, game, message, rating });
    res.status(201).json({ message: 'Feedback submitted successfully', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback };
