import { v4 as uuidv4 } from 'uuid';

// ============================
// TYPES
// ============================

export interface PollOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface Poll {
  id: string;
  creator_fid: number;
  creator_username: string;
  creator_avatar: string | null;
  question: string;
  poll_type: 'standard' | 'image' | 'this_or_that' | 'rating';
  options: PollOption[];
  is_anonymous: boolean;
  is_prediction: boolean;
  expires_at: string | null;
  is_onchain: boolean;
  onchain_tx: string | null;
  created_at: string;
  total_votes: number;
}

export interface Vote {
  id: string;
  poll_id: string;
  voter_fid: number;
  voter_username: string;
  voter_avatar: string | null;
  option_id: string;
  prediction: string | null;
  reaction: string | null;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  options: PollOption[];
  active_date: string;
  created_at: string;
}

// ============================
// IN-MEMORY STORE
// ============================

const polls: Poll[] = [];
const votes: Vote[] = [];
const dailyQuestions: DailyQuestion[] = [];

// ============================
// SEED DATA
// ============================

function seedData() {
  if (polls.length > 0) return;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  // Daily question
  dailyQuestions.push({
    id: uuidv4(),
    question: "Pineapple on pizza?",
    options: [
      { id: 'dq-yes', text: 'Yes, always' },
      { id: 'dq-no', text: 'Absolutely not' },
      { id: 'dq-sometimes', text: 'Sometimes' },
      { id: 'dq-never-tried', text: 'Never tried' },
    ],
    active_date: now.toISOString().split('T')[0],
    created_at: new Date(now.getTime() - 3600000 * 8).toISOString(),
  });

  // Poll 1
  const poll1Id = uuidv4();
  polls.push({
    id: poll1Id,
    creator_fid: 1001,
    creator_username: 'vitalik.eth',
    creator_avatar: null,
    question: 'Best L2 for building consumer apps?',
    poll_type: 'standard',
    options: [
      { id: 'a', text: 'Base' },
      { id: 'b', text: 'Optimism' },
      { id: 'c', text: 'Arbitrum' },
      { id: 'd', text: 'zkSync' },
    ],
    is_anonymous: false,
    is_prediction: true,
    expires_at: tomorrow.toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 3600000).toISOString(),
    total_votes: 142,
  });

  // Poll 2 — This or That
  const poll2Id = uuidv4();
  polls.push({
    id: poll2Id,
    creator_fid: 1002,
    creator_username: 'jessepollak',
    creator_avatar: null,
    question: 'Tabs or Spaces?',
    poll_type: 'this_or_that',
    options: [
      { id: 'a', text: 'Tabs' },
      { id: 'b', text: 'Spaces' },
    ],
    is_anonymous: false,
    is_prediction: false,
    expires_at: in2Hours.toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 7200000).toISOString(),
    total_votes: 89,
  });

  // Poll 3 — On-chain, no expiry
  const poll3Id = uuidv4();
  polls.push({
    id: poll3Id,
    creator_fid: 1003,
    creator_username: 'dwr.eth',
    creator_avatar: null,
    question: 'Most anticipated feature for Farcaster in 2025?',
    poll_type: 'standard',
    options: [
      { id: 'a', text: 'Mini Apps' },
      { id: 'b', text: 'Channels 2.0' },
      { id: 'c', text: 'Direct Messages' },
      { id: 'd', text: 'Token gating' },
    ],
    is_anonymous: false,
    is_prediction: false,
    expires_at: null,
    is_onchain: true,
    onchain_tx: '0xabc123',
    created_at: new Date(now.getTime() - 86400000).toISOString(),
    total_votes: 256,
  });

  // Poll 4
  const poll4Id = uuidv4();
  polls.push({
    id: poll4Id,
    creator_fid: 1004,
    creator_username: 'ccarella',
    creator_avatar: null,
    question: 'What will you build on Base next?',
    poll_type: 'standard',
    options: [
      { id: 'a', text: 'DeFi protocol' },
      { id: 'b', text: 'Social app' },
      { id: 'c', text: 'NFT project' },
      { id: 'd', text: 'Gaming' },
    ],
    is_anonymous: false,
    is_prediction: false,
    expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 1800000).toISOString(),
    total_votes: 67,
  });

  // Poll 5 — Anonymous
  const poll5Id = uuidv4();
  polls.push({
    id: poll5Id,
    creator_fid: 1005,
    creator_username: 'anon.eth',
    creator_avatar: null,
    question: 'How much crypto do you hold?',
    poll_type: 'standard',
    options: [
      { id: 'a', text: 'Under $1K' },
      { id: 'b', text: '$1K - $10K' },
      { id: 'c', text: '$10K - $100K' },
      { id: 'd', text: 'Over $100K' },
    ],
    is_anonymous: true,
    is_prediction: false,
    expires_at: in6Hours.toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 900000).toISOString(),
    total_votes: 203,
  });

  // Poll 6 — Expired
  const poll6Id = uuidv4();
  polls.push({
    id: poll6Id,
    creator_fid: 1006,
    creator_username: 'coinbase',
    creator_avatar: null,
    question: 'Favorite Base ecosystem dApp?',
    poll_type: 'standard',
    options: [
      { id: 'a', text: 'Uniswap' },
      { id: 'b', text: 'Aave' },
      { id: 'c', text: 'friend.tech' },
      { id: 'd', text: 'Zora' },
    ],
    is_anonymous: false,
    is_prediction: false,
    expires_at: new Date(now.getTime() - 3600000).toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    total_votes: 412,
  });

  // Seed votes for all polls
  const voterPool = ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank', 'grace', 'henry', 'ivy', 'jack'];
  const optionKeys = ['a', 'b', 'c', 'd'];

  // Poll 1 votes (142)
  for (let i = 0; i < 142; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll1Id,
      voter_fid: 2000 + i,
      voter_username: voterPool[i % voterPool.length] + (i > 9 ? i : ''),
      voter_avatar: null,
      option_id: i < 70 ? 'a' : optionKeys[i % optionKeys.length],
      prediction: i < 20 ? 'a' : null,
      reaction: i % 12 === 0 ? 'Based! 🔵' : null,
      created_at: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
    });
  }

  // Poll 2 votes (89)
  for (let i = 0; i < 89; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll2Id,
      voter_fid: 3000 + i,
      voter_username: `voter${i}`,
      voter_avatar: null,
      option_id: i < 52 ? 'a' : 'b',
      prediction: null,
      reaction: i === 0 ? 'Tabs forever! ⌨️' : null,
      created_at: new Date(now.getTime() - Math.random() * 7200000).toISOString(),
    });
  }

  // Poll 3 votes (256)
  for (let i = 0; i < 256; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll3Id,
      voter_fid: 4000 + i,
      voter_username: `builder${i}`,
      voter_avatar: null,
      option_id: i < 140 ? 'a' : optionKeys[i % optionKeys.length],
      prediction: null,
      reaction: i % 15 === 0 ? 'Mini Apps FTW! 🚀' : null,
      created_at: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
    });
  }

  // Poll 4 votes (67)
  for (let i = 0; i < 67; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll4Id,
      voter_fid: 5000 + i,
      voter_username: `dev${i}`,
      voter_avatar: null,
      option_id: optionKeys[i % optionKeys.length],
      prediction: null,
      reaction: null,
      created_at: new Date(now.getTime() - Math.random() * 1800000).toISOString(),
    });
  }

  // Poll 5 votes (203) — anonymous
  for (let i = 0; i < 203; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll5Id,
      voter_fid: 6000 + i,
      voter_username: `user${i}`,
      voter_avatar: null,
      option_id: optionKeys[i % optionKeys.length],
      prediction: null,
      reaction: i % 20 === 0 ? 'Interesting results...' : null,
      created_at: new Date(now.getTime() - Math.random() * 900000).toISOString(),
    });
  }

  // Poll 6 votes (412) — expired
  for (let i = 0; i < 412; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll6Id,
      voter_fid: 7000 + i,
      voter_username: `fan${i}`,
      voter_avatar: null,
      option_id: i < 180 ? 'a' : optionKeys[i % optionKeys.length],
      prediction: null,
      reaction: null,
      created_at: new Date(now.getTime() - 86400000 - Math.random() * 86400000).toISOString(),
    });
  }

  // Daily question votes
  for (let i = 0; i < 340; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: dailyQuestions[0].id,
      voter_fid: 8000 + i,
      voter_username: `user${i}`,
      voter_avatar: null,
      option_id: ['dq-yes', 'dq-no', 'dq-sometimes', 'dq-never-tried'][i % 4],
      prediction: null,
      reaction: null,
      created_at: new Date(now.getTime() - Math.random() * 3600000 * 8).toISOString(),
    });
  }
}

seedData();

// ============================
// QUERY FUNCTIONS
// ============================

/** Get paginated polls by cursor (timestamp string). Returns polls created before cursor. */
export function getPolls(options?: {
  cursor?: string;
  limit?: number;
  fid?: number;
}): { polls: Poll[]; nextCursor: string | null } {
  const limit = options?.limit || 10;
  const cursorDate = options?.cursor ? new Date(options.cursor).getTime() : Infinity;

  const sorted = [...polls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter(p => new Date(p.created_at).getTime() < cursorDate);

  const page = sorted.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].created_at : null;

  return { polls: page, nextCursor };
}

export function getPollById(id: string): Poll | undefined {
  return polls.find(p => p.id === id);
}

export function createPoll(data: {
  creator_fid: number;
  creator_username: string;
  creator_avatar?: string | null;
  question: string;
  poll_type?: string;
  options: PollOption[];
  is_anonymous?: boolean;
  is_prediction?: boolean;
  expires_at?: string | null;
  is_onchain?: boolean;
}): Poll {
  const poll: Poll = {
    id: uuidv4(),
    creator_fid: data.creator_fid,
    creator_username: data.creator_username,
    creator_avatar: data.creator_avatar || null,
    question: data.question,
    poll_type: (data.poll_type as Poll['poll_type']) || 'standard',
    options: data.options,
    is_anonymous: data.is_anonymous || false,
    is_prediction: data.is_prediction || false,
    expires_at: data.expires_at || null,
    is_onchain: data.is_onchain || false,
    onchain_tx: null,
    created_at: new Date().toISOString(),
    total_votes: 0,
  };
  polls.unshift(poll);
  return poll;
}

export function getVotesForPoll(pollId: string): Vote[] {
  return votes.filter(v => v.poll_id === pollId);
}

export function getVoteCountsByOption(pollId: string): Record<string, number> {
  const pollVotes = votes.filter(v => v.poll_id === pollId);
  const counts: Record<string, number> = {};
  for (const v of pollVotes) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }
  return counts;
}

export function hasUserVoted(pollId: string, voterFid: number): Vote | undefined {
  return votes.find(v => v.poll_id === pollId && v.voter_fid === voterFid);
}

export function createVote(data: {
  poll_id: string;
  voter_fid: number;
  voter_username: string;
  voter_avatar?: string | null;
  option_id: string;
  prediction?: string | null;
  reaction?: string | null;
}): Vote | null {
  if (hasUserVoted(data.poll_id, data.voter_fid)) return null;

  const vote: Vote = {
    id: uuidv4(),
    poll_id: data.poll_id,
    voter_fid: data.voter_fid,
    voter_username: data.voter_username,
    voter_avatar: data.voter_avatar || null,
    option_id: data.option_id,
    prediction: data.prediction || null,
    reaction: data.reaction || null,
    created_at: new Date().toISOString(),
  };
  votes.push(vote);

  const poll = polls.find(p => p.id === data.poll_id);
  if (poll) poll.total_votes += 1;

  return vote;
}

/** Add a reaction to an existing vote */
export function addReaction(pollId: string, voterFid: number, reaction: string): boolean {
  const vote = votes.find(v => v.poll_id === pollId && v.voter_fid === voterFid);
  if (!vote) return false;
  vote.reaction = reaction;
  return true;
}

export function getDailyQuestion(): DailyQuestion | undefined {
  const today = new Date().toISOString().split('T')[0];
  return dailyQuestions.find(q => q.active_date === today);
}

export function getDailyQuestionWithVotes(): {
  question: DailyQuestion;
  voteCounts: Record<string, number>;
  totalVotes: number;
} | null {
  const dq = getDailyQuestion();
  if (!dq) return null;
  const vc = getVoteCountsByOption(dq.id);
  const total = Object.values(vc).reduce((a, b) => a + b, 0);
  return { question: dq, voteCounts: vc, totalVotes: total };
}

export function getTrendingPolls(limit = 5): Poll[] {
  return [...polls]
    .sort((a, b) => b.total_votes - a.total_votes)
    .slice(0, limit);
}

export function getPollsByUser(fid: number): Poll[] {
  return polls.filter(p => p.creator_fid === fid);
}

export function getVotesByUser(fid: number): Vote[] {
  return votes.filter(v => v.voter_fid === fid);
}

export function getReactionsForPoll(pollId: string): { fid: number; username: string; reaction: string; avatar: string | null }[] {
  return votes
    .filter(v => v.poll_id === pollId && v.reaction)
    .map(v => ({
      fid: v.voter_fid,
      username: v.voter_username,
      reaction: v.reaction!,
      avatar: v.voter_avatar,
    }));
}

export function getRecentVoters(pollId: string, limit = 5): { fid: number; username: string; avatar: string | null }[] {
  return votes
    .filter(v => v.poll_id === pollId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map(v => ({ fid: v.voter_fid, username: v.voter_username, avatar: v.voter_avatar }));
}

/** Get majority option ID for prediction checking */
export function getMajorityOptionId(pollId: string): string | null {
  const counts = getVoteCountsByOption(pollId);
  let maxCount = 0;
  let majorityId: string | null = null;
  for (const [id, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      majorityId = id;
    }
  }
  return majorityId;
}

/** Build enriched poll data for API responses */
export function enrichPoll(poll: Poll, userFid?: number) {
  const voteCounts = getVoteCountsByOption(poll.id);
  const userVote = userFid ? hasUserVoted(poll.id, userFid) : undefined;
  const recentVoters = poll.is_anonymous ? [] : getRecentVoters(poll.id, 5);
  const reactions = getReactionsForPoll(poll.id).slice(0, 5);
  const majorityOptionId = getMajorityOptionId(poll.id);

  return {
    ...poll,
    voteCounts,
    userVotedOptionId: userVote?.option_id || null,
    userPrediction: userVote?.prediction || null,
    userReaction: userVote?.reaction || null,
    predictionCorrect: userVote?.prediction ? userVote.prediction === majorityOptionId : null,
    majorityOptionId,
    recentVoters,
    reactions,
  };
}
