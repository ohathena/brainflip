const supabase = require('../config/supabase');

const submitFeedback = async ({ email, category, game, message, rating }) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ email, category, game, message, rating })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = { submitFeedback };
