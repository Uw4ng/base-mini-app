import { v4 as uuidv4 } from 'uuid';

// Types
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

// In-memory store
const polls: Poll[] = [];
const votes: Vote[] = [];
const dailyQuestions: DailyQuestion[] = [];

// Seed data
function seedData() {
  if (polls.length > 0) return;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Seed daily question
  dailyQuestions.push({
    id: uuidv4(),
    question: "What's the most important feature for a crypto wallet?",
    options: [
      { id: 'opt1', text: 'Security' },
      { id: 'opt2', text: 'Ease of use' },
      { id: 'opt3', text: 'Multi-chain support' },
      { id: 'opt4', text: 'Low fees' },
    ],
    active_date: now.toISOString().split('T')[0],
    created_at: now.toISOString(),
  });

  // Seed polls
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
    expires_at: tomorrow.toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 3600000).toISOString(),
    total_votes: 142,
  });

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
    expires_at: in2Hours.toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 7200000).toISOString(),
    total_votes: 89,
  });

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
    expires_at: null,
    is_onchain: true,
    onchain_tx: '0xabc123',
    created_at: new Date(now.getTime() - 86400000).toISOString(),
    total_votes: 256,
  });

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
    expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    is_onchain: false,
    onchain_tx: null,
    created_at: new Date(now.getTime() - 1800000).toISOString(),
    total_votes: 67,
  });

  // Seed votes for poll1
  const voterNames = ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'];
  const options = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < 42; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll1Id,
      voter_fid: 2000 + i,
      voter_username: voterNames[i % voterNames.length] + (i > 5 ? i : ''),
      voter_avatar: null,
      option_id: i < 20 ? 'a' : options[i % options.length],
      prediction: null,
      reaction: i % 5 === 0 ? 'Great question! 🔥' : null,
      created_at: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
    });
  }
  
  // Seed votes for poll2
  for (let i = 0; i < 89; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll2Id,
      voter_fid: 3000 + i,
      voter_username: `voter${i}`,
      voter_avatar: null,
      option_id: i < 52 ? 'a' : 'b',
      prediction: null,
      reaction: null,
      created_at: new Date(now.getTime() - Math.random() * 7200000).toISOString(),
    });
  }

  // Seed votes for poll3
  for (let i = 0; i < 100; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: poll3Id,
      voter_fid: 4000 + i,
      voter_username: `builder${i}`,
      voter_avatar: null,
      option_id: i < 60 ? 'a' : options[i % options.length],
      prediction: null,
      reaction: i % 10 === 0 ? 'Mini Apps FTW! 🚀' : null,
      created_at: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
    });
  }
}

seedData();

// Database functions
export function getPolls(): Poll[] {
  return [...polls].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
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
  // Check if already voted
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

  // Update poll total
  const poll = polls.find(p => p.id === data.poll_id);
  if (poll) poll.total_votes += 1;

  return vote;
}

export function getDailyQuestion(): DailyQuestion | undefined {
  const today = new Date().toISOString().split('T')[0];
  return dailyQuestions.find(q => q.active_date === today);
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

export function getReactionsForPoll(pollId: string): { username: string; reaction: string; avatar: string | null }[] {
  return votes
    .filter(v => v.poll_id === pollId && v.reaction)
    .map(v => ({
      username: v.voter_username,
      reaction: v.reaction!,
      avatar: v.voter_avatar,
    }));
}
