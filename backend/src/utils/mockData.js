const demoContests = [
  {
    id: 'demo-contest-1',
    name: 'Campus GK Sprint',
    status: 'live',
    entry_points_cost: 0,
    max_participants: 120,
    current_participants: 42,
    reward_structure: [{ rank: 1, badge: 'Gold Scholar', points: 200 }],
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    sequence_number: 101,
    quiz_title: 'Campus GK Sprint',
    duration_minutes: 15,
  },
  {
    id: 'demo-contest-2',
    name: 'Tech Trivia Rush',
    status: 'upcoming',
    entry_points_cost: 0,
    max_participants: 80,
    current_participants: 16,
    reward_structure: [{ rank: 1, badge: 'Code Champ', points: 150 }],
    starts_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    sequence_number: 102,
    quiz_title: 'Tech Trivia Rush',
    duration_minutes: 20,
  },
  {
    id: 'demo-contest-3',
    name: 'History Heroes',
    status: 'upcoming',
    entry_points_cost: 0,
    max_participants: 90,
    current_participants: 27,
    reward_structure: [{ rank: 1, badge: 'History Hero', points: 180 }],
    starts_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    sequence_number: 103,
    quiz_title: 'History Heroes',
    duration_minutes: 18,
  },
];

const demoLeaderboard = [
  { user_id: 'demo-user-1', full_name: 'Aarav Rao', username: 'aarav', college: 'IIT Delhi', total_points: 2500, contests_won: 4, total_contests: 12, global_rank: 1 },
  { user_id: 'demo-user-2', full_name: 'Maya Singh', username: 'maya', college: 'DU', total_points: 2250, contests_won: 3, total_contests: 10, global_rank: 2 },
  { user_id: 'demo-user-3', full_name: 'Rohan Das', username: 'rohan', college: 'BITS Pilani', total_points: 1980, contests_won: 2, total_contests: 9, global_rank: 3 },
];

const demoProfile = {
  id: 'demo-user-id',
  username: 'demo_user',
  email: 'demo@example.com',
  role: 'student',
  status: 'active',
  full_name: 'Demo User',
  college: 'DreamNexa College',
  university: 'DreamNexa University',
  state: 'Karnataka',
  city: 'Bengaluru',
  avatar_url: null,
  referral_code: 'DEMO1234',
  total_points: 1250,
  total_contests: 8,
  total_quizzes_played: 14,
  contests_won: 2,
};

const demoPointsHistory = [
  { id: 'demo-point-1', amount: 50, type: 'signup_bonus', description: 'Welcome bonus for creating an account', created_at: new Date().toISOString() },
  { id: 'demo-point-2', amount: 10, type: 'daily_login', description: 'Daily login reward', created_at: new Date().toISOString() },
  { id: 'demo-point-3', amount: 200, type: 'rank_bonus', description: 'First place contest reward', created_at: new Date().toISOString() },
];

const demoBadges = [
  { code: 'gold_scholar', name: 'Gold Scholar', description: 'Finished 1st in a contest', icon: 'trophy-gold', awarded_at: new Date().toISOString() },
  { code: 'first_contest', name: 'First Steps', description: 'Joined your first contest', icon: 'flag', awarded_at: new Date().toISOString() },
];

function isMockDataEnabled() {
  return process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;
}

function shouldUseMockData(err) {
  if (isMockDataEnabled()) return true;
  if (!err) return false;
  const message = (err.message || '').toLowerCase();
  return ['econnrefused', 'password authentication failed', 'relation', 'does not exist', 'connect', 'timeout', 'column'].some((token) => message.includes(token));
}

function getDemoContestById(id) {
  const contest = demoContests.find((item) => item.id === id) || demoContests[0];
  return {
    ...contest,
    quiz_id: 'demo-quiz-1',
    description: 'A fun-filled quiz contest for campus students.',
    instructions: 'Answer quickly and stay accurate to climb the leaderboard.',
    negative_marking: 0.25,
    participants: [
      { username: 'aarav', full_name: 'Aarav Rao', joined_at: new Date().toISOString(), rank: 1, score: 92 },
      { username: 'maya', full_name: 'Maya Singh', joined_at: new Date().toISOString(), rank: 2, score: 88 },
    ],
  };
}

function getDemoUser(emailOrUsername) {
  const normalized = (emailOrUsername || '').toLowerCase();
  return {
    ...demoProfile,
    username: normalized.includes('@') ? demoProfile.username : normalized || demoProfile.username,
    email: normalized.includes('@') ? normalized : demoProfile.email,
  };
}

function getDemoTokens(user) {
  return {
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`,
  };
}

function getDemoProfile(emailOrUsername) {
  return getDemoUser(emailOrUsername);
}

function getDemoContests() {
  return demoContests;
}

function getDemoPointsHistory() {
  return demoPointsHistory;
}

function getDemoBadges() {
  return demoBadges;
}

module.exports = {
  demoContests,
  demoLeaderboard,
  getDemoContestById,
  getDemoUser,
  getDemoTokens,
  getDemoProfile,
  getDemoContests,
  getDemoPointsHistory,
  getDemoBadges,
  isMockDataEnabled,
  shouldUseMockData,
};
