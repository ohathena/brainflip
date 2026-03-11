const supabase = require('../config/supabase');

const getLeaderboard = async (gameType) => {
  let query = supabase
    .from('scores')
    .select('user_id, game_type, score, streak, created_at, users!inner(username)')
    .order('score', { ascending: false })
    .limit(10);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row, index) => ({
    rank: index + 1,
    username: row.users.username,
    game_type: row.game_type,
    score: row.score,
    streak: row.streak,
    created_at: row.created_at,
  }));
};

module.exports = { getLeaderboard };
