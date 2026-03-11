const supabase = require('../config/supabase');

const getUserStats = async (userId) => {
  // Total sessions
  const { data: sessions, error: sessErr } = await supabase
    .from('game_sessions')
    .select('result, game_type, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessErr) throw sessErr;

  const totalGames = sessions.length;
  const wins = sessions.filter((s) => s.result === 'win').length;
  const losses = sessions.filter((s) => s.result === 'lose').length;
  const draws = sessions.filter((s) => s.result === 'draw').length;

  // Best streak from scores table
  const { data: streakData, error: streakErr } = await supabase
    .from('scores')
    .select('streak')
    .eq('user_id', userId)
    .order('streak', { ascending: false })
    .limit(1);

  if (streakErr) throw streakErr;

  const bestStreak = streakData.length > 0 ? streakData[0].streak : 0;

  // Recent activity (last 10 games)
  const recentActivity = sessions.slice(0, 10).map((s) => ({
    game_type: s.game_type,
    result: s.result,
    score: s.score,
    created_at: s.created_at,
  }));

  return { totalGames, wins, losses, draws, bestStreak, recentActivity };
};

module.exports = { getUserStats };
