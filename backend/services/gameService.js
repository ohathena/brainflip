const supabase = require('../config/supabase');

const saveGameResult = async ({ userId, gameType, score, result, streak }) => {
  // Insert into game_sessions
  const { error: sessionError } = await supabase
    .from('game_sessions')
    .insert({ user_id: userId, game_type: gameType, score, result });

  if (sessionError) throw sessionError;

  // Insert into scores
  const { error: scoreError } = await supabase
    .from('scores')
    .insert({ user_id: userId, game_type: gameType, score, streak: streak || 0 });

  if (scoreError) throw scoreError;

  return { success: true };
};

module.exports = { saveGameResult };
