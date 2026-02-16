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
  tagged_fids: number[];
  tagged_usernames: string[];
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  avatar: string | null;
  isMutual: boolean;
}

export interface UserStatsData {
  totalVotes: number;
  pollsCreated: number;
  majorityPercent: number;
  streak: number;
  mostActiveDay: string;
  topCategory: string;
  funLabel: string;
  votingHistory: { pollId: string; question: string; optionId: string; created_at: string }[];
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
  category: 'tech' | 'food' | 'lifestyle' | 'pop_culture' | 'philosophy' | 'funny';
  day_number: number;
  active_date: string;
  created_at: string;
}

export interface DailyStreak {
  fid: number;
  currentStreak: number;
  bestStreak: number;
  lastVoteDate: string;
}

// ============================
// IN-MEMORY STORE
// ============================

const polls: Poll[] = [];
const votes: Vote[] = [];
const dailyQuestions: DailyQuestion[] = [];
const dailyStreaks: Map<number, DailyStreak> = new Map();

// Launch date for day counter (set to 100 days ago for demo)
const LAUNCH_DATE = new Date(Date.now() - 126 * 24 * 60 * 60 * 1000);

// ============================
// QUESTION BANK (100+ questions)
// ============================

interface BankQuestion {
  question: string;
  options: string[];
  category: DailyQuestion['category'];
}

const questionBank: BankQuestion[] = [
  // ──── TECH (20) ────
  { question: 'Tabs or spaces?', options: ['Tabs', 'Spaces'], category: 'tech' },
  { question: 'Best programming language?', options: ['Python', 'JavaScript', 'Rust', 'Go'], category: 'tech' },
  { question: 'Dark mode or light mode?', options: ['Dark mode', 'Light mode', 'System auto'], category: 'tech' },
  { question: 'iOS or Android?', options: ['iOS', 'Android', 'Both'], category: 'tech' },
  { question: 'VS Code or JetBrains?', options: ['VS Code', 'JetBrains', 'Vim', 'Other'], category: 'tech' },
  { question: 'Frontend or backend?', options: ['Frontend', 'Backend', 'Fullstack'], category: 'tech' },
  { question: 'Mechanical keyboard?', options: ['Mechanical all the way', 'Laptop keyboard is fine', 'Whatever is available'], category: 'tech' },
  { question: 'How many browser tabs do you have open right now?', options: ['< 10', '10-30', '30-100', '100+ (help)'], category: 'tech' },
  { question: 'Best crypto wallet UX?', options: ['MetaMask', 'Coinbase Wallet', 'Rainbow', 'Rabby'], category: 'tech' },
  { question: 'Git merge or rebase?', options: ['Merge', 'Rebase', 'Depends', 'What is git?'], category: 'tech' },
  { question: 'AI will replace developers?', options: ['Never', 'Partially', 'Eventually', 'Already is'], category: 'tech' },
  { question: 'Best L2 chain?', options: ['Base', 'Arbitrum', 'Optimism', 'zkSync'], category: 'tech' },
  { question: 'Mac, Windows, or Linux?', options: ['Mac', 'Windows', 'Linux', 'ChromeOS'], category: 'tech' },
  { question: 'Prefer REST or GraphQL?', options: ['REST', 'GraphQL', 'tRPC', 'Whatever works'], category: 'tech' },
  { question: 'Monorepo or polyrepo?', options: ['Monorepo', 'Polyrepo', 'Depends on the project'], category: 'tech' },
  { question: 'TypeScript or JavaScript?', options: ['TypeScript', 'JavaScript', 'Both equally'], category: 'tech' },
  { question: 'Best way to learn coding?', options: ['YouTube', 'Docs', 'Build stuff', 'Courses'], category: 'tech' },
  { question: 'React, Vue, or Svelte?', options: ['React', 'Vue', 'Svelte', 'Angular'], category: 'tech' },
  { question: 'Cloud provider?', options: ['AWS', 'GCP', 'Azure', 'Vercel'], category: 'tech' },
  { question: 'Most underrated dev tool?', options: ['Terminal', 'Figma', 'Notion', 'Docker'], category: 'tech' },
  // ──── FOOD (18) ────
  { question: 'Pineapple on pizza?', options: ['Yes, always', 'Absolutely not', 'Sometimes', 'Never tried'], category: 'food' },
  { question: 'Coffee or tea?', options: ['Coffee ☕', 'Tea 🍵', 'Both', 'Neither'], category: 'food' },
  { question: 'Best breakfast?', options: ['Eggs & toast', 'Cereal', 'Pancakes', 'Skip it'], category: 'food' },
  { question: 'Spicy food?', options: ['Love it 🌶️', 'Mild only', 'Never', 'I eat raw chilis'], category: 'food' },
  { question: 'Best movie snack?', options: ['Popcorn', 'Nachos', 'Candy', 'Nothing'], category: 'food' },
  { question: 'Chocolate or vanilla?', options: ['Chocolate', 'Vanilla', 'Both', 'Strawberry'], category: 'food' },
  { question: 'Home-cooked or takeout?', options: ['Home-cooked', 'Takeout', 'Depends on mood'], category: 'food' },
  { question: 'Best cuisine?', options: ['Italian', 'Japanese', 'Mexican', 'Indian'], category: 'food' },
  { question: 'Crunchy or smooth peanut butter?', options: ['Crunchy', 'Smooth', "Don't like PB"], category: 'food' },
  { question: 'Breakfast for dinner?', options: ['Absolutely', 'Weird', 'Sometimes'], category: 'food' },
  { question: 'Best pizza topping?', options: ['Pepperoni', 'Mushrooms', 'Margherita', 'Everything'], category: 'food' },
  { question: 'Sushi: raw or cooked?', options: ['Raw all the way', 'Cooked only', 'Both', 'No sushi'], category: 'food' },
  { question: 'Ice cream in a cone or cup?', options: ['Cone', 'Cup', 'Either'], category: 'food' },
  { question: 'Water: sparkling or still?', options: ['Sparkling', 'Still', 'Depends'], category: 'food' },
  { question: 'Best fast food chain?', options: ["McDonald's", 'Chick-fil-A', 'In-N-Out', 'Taco Bell'], category: 'food' },
  { question: 'Energy drink of choice?', options: ['Red Bull', 'Monster', 'Coffee instead', 'None'], category: 'food' },
  { question: 'Sweet or savory breakfast?', options: ['Sweet', 'Savory', 'Both'], category: 'food' },
  { question: 'Avocado toast: overrated?', options: ['Overrated', 'Underrated', 'Perfectly rated'], category: 'food' },
  // ──── LIFESTYLE (18) ────
  { question: 'Morning person or night owl?', options: ['Morning ☀️', 'Night 🌙', "I don't sleep"], category: 'lifestyle' },
  { question: 'Remote or office?', options: ['Remote', 'Office', 'Hybrid'], category: 'lifestyle' },
  { question: 'Dogs or cats?', options: ['Dogs 🐕', 'Cats 🐈', 'Both', 'Neither'], category: 'lifestyle' },
  { question: 'Beach or mountains?', options: ['Beach 🏖️', 'Mountains ⛰️', 'Both', 'City'], category: 'lifestyle' },
  { question: 'How many hours of sleep?', options: ['< 6', '6-7', '8+', "What is sleep?"], category: 'lifestyle' },
  { question: 'Workout routine?', options: ['Gym', 'Running', 'Yoga', 'None'], category: 'lifestyle' },
  { question: 'Paper books or e-books?', options: ['Paper books', 'E-books', 'Audiobooks', 'All'], category: 'lifestyle' },
  { question: 'Urban or suburban?', options: ['Urban', 'Suburban', 'Rural', 'Nomad'], category: 'lifestyle' },
  { question: 'New Year resolution?', options: ['Always', 'Never', 'Sometimes', 'Already failed'], category: 'lifestyle' },
  { question: 'Clean desk or messy desk?', options: ['Clean', 'Organized chaos', 'Messy'], category: 'lifestyle' },
  { question: 'Cold weather or hot weather?', options: ['Cold ❄️', 'Hot ☀️', 'Mild 🌤️'], category: 'lifestyle' },
  { question: 'Early for meetings or just on time?', options: ['5 min early', 'Right on time', 'Fashionably late'], category: 'lifestyle' },
  { question: 'Phone notifications: on or off?', options: ['All on', 'Only important', 'All off', 'DND forever'], category: 'lifestyle' },
  { question: 'How many countries have you visited?', options: ['0-5', '5-15', '15-30', '30+'], category: 'lifestyle' },
  { question: 'Shower: morning or night?', options: ['Morning', 'Night', 'Both', 'Depends'], category: 'lifestyle' },
  { question: 'Reusable bags or plastic?', options: ['Reusable', 'Plastic (sorry)', 'I forget mine'], category: 'lifestyle' },
  { question: 'Commute: drive, transit, or walk?', options: ['Drive', 'Public transit', 'Walk/bike', 'WFH'], category: 'lifestyle' },
  { question: 'Minimalist or maximalist?', options: ['Minimalist', 'Maximalist', 'Somewhere in between'], category: 'lifestyle' },
  // ──── POP CULTURE (16) ────
  { question: 'Marvel or DC?', options: ['Marvel', 'DC', 'Both', 'Neither'], category: 'pop_culture' },
  { question: 'Star Wars or Star Trek?', options: ['Star Wars', 'Star Trek', 'Both', 'Neither'], category: 'pop_culture' },
  { question: 'Best social platform?', options: ['Farcaster', 'X/Twitter', 'Instagram', 'TikTok'], category: 'pop_culture' },
  { question: 'Streaming service?', options: ['Netflix', 'Disney+', 'HBO Max', 'YouTube'], category: 'pop_culture' },
  { question: 'Best decade for music?', options: ['80s', '90s', '2000s', '2010s+'], category: 'pop_culture' },
  { question: 'Console gaming?', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC only'], category: 'pop_culture' },
  { question: 'Best superhero?', options: ['Spider-Man', 'Batman', 'Iron Man', 'Superman'], category: 'pop_culture' },
  { question: 'Hogwarts house?', options: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'], category: 'pop_culture' },
  { question: 'Best animated movie?', options: ['Spirited Away', 'Toy Story', 'Spider-Verse', 'Up'], category: 'pop_culture' },
  { question: 'Podcast or music while working?', options: ['Podcast', 'Music', 'Silence', 'Lo-fi beats'], category: 'pop_culture' },
  { question: 'Best video game of all time?', options: ['Zelda: BOTW', 'Minecraft', 'GTA V', 'The Last of Us'], category: 'pop_culture' },
  { question: 'Reality TV: guilty pleasure?', options: ['Love it', 'Hate it', 'Secretly watch it'], category: 'pop_culture' },
  { question: 'Best meme format?', options: ['Drake', 'Distracted BF', 'This is fine 🔥', 'Wojak'], category: 'pop_culture' },
  { question: 'Binge-watch or one episode at a time?', options: ['Binge all day', 'One per day', 'Depends on the show'], category: 'pop_culture' },
  { question: 'Best music genre?', options: ['Hip-hop', 'Pop', 'Rock', 'Electronic'], category: 'pop_culture' },
  { question: 'Favorite emoji?', options: ['😂', '🔥', '💀', '❤️'], category: 'pop_culture' },
  // ──── PHILOSOPHY (14) ────
  { question: 'Would you live on Mars?', options: ['Yes', 'No', "Only if there's Wi-Fi"], category: 'philosophy' },
  { question: 'Free will or determinism?', options: ['Free will', 'Determinism', 'Both', 'I chose not to answer'], category: 'philosophy' },
  { question: 'Is a hot dog a sandwich?', options: ['Yes', 'No', 'It transcends categories'], category: 'philosophy' },
  { question: 'Would you want to know the future?', options: ['Yes', 'No', 'Only the good parts'], category: 'philosophy' },
  { question: 'Simulation theory: do you believe?', options: ['Yes', 'No', 'Maybe', 'Glitch confirmed'], category: 'philosophy' },
  { question: 'One superpower?', options: ['Fly', 'Invisibility', 'Time travel', 'Teleportation'], category: 'philosophy' },
  { question: 'Would you upload your brain?', options: ['Absolutely', 'Never', 'Maybe in 50 years'], category: 'philosophy' },
  { question: 'Is money the root of all evil?', options: ['Yes', 'No', 'Lack of money is'], category: 'philosophy' },
  { question: 'Would you take a one-way trip to another galaxy?', options: ['Yes', 'No', 'Only with friends'], category: 'philosophy' },
  { question: 'Nature vs nurture?', options: ['Nature', 'Nurture', 'Both equally'], category: 'philosophy' },
  { question: 'If you could relive one age, which?', options: ['Childhood', 'Teens', '20s', 'Right now'], category: 'philosophy' },
  { question: 'Is time travel possible?', options: ['Yes', 'No', 'Already happening'], category: 'philosophy' },
  { question: 'Would you want to be immortal?', options: ['Yes', 'No', 'Only with off switch'], category: 'philosophy' },
  { question: 'Is privacy dead?', options: ['Yes', 'No', 'We can fix it', 'Never had it'], category: 'philosophy' },
  // ──── FUNNY (16) ────
  { question: 'If your code worked first try, what would you do?', options: ['Screenshot it', 'Celebrate', 'Check for bugs', 'Wake up'], category: 'funny' },
  { question: 'Most relatable dev experience?', options: ['"Works on my machine"', 'Stack Overflow', 'Merge conflicts', 'Imposter syndrome'], category: 'funny' },
  { question: 'Git commit message style?', options: ['Descriptive', '"fix"', '"wip"', '"please work"'], category: 'funny' },
  { question: 'What is the correct pronunciation: GIF?', options: ['Hard G (gif)', 'Soft G (jif)', 'I avoid saying it'], category: 'funny' },
  { question: 'WiFi goes down — first reaction?', options: ['Panic', 'Go outside?', 'Mobile hotspot', 'Accept fate'], category: 'funny' },
  { question: 'How many unread emails?', options: ['0 (inbox zero 💪)', '1-50', '100-1000', '5000+ (and counting)'], category: 'funny' },
  { question: 'Your Slack status?', options: ['🟢 Available', '🔴 Do not disturb', '🏖️ On vacation', '👻 Ghost'], category: 'funny' },
  { question: 'Last Google search?', options: ['How to center a div', 'Is cereal soup?', 'Why is my code broken', 'Normal things'], category: 'funny' },
  { question: 'Monday mood?', options: ['Motivated 💪', 'Tired 😴', 'Already counting to Friday', 'What day is it?'], category: 'funny' },
  { question: 'What would your error code be?', options: ['404', '418 (I am a teapot)', '500', '200 (I am fine)'], category: 'funny' },
  { question: 'Spirit animal?', options: ['Cat 🐱 (sleep)', 'Dog 🐶 (chaos)', 'Sloth 🦥 (vibes)', 'Coffee ☕'], category: 'funny' },
  { question: 'Debugging strategy?', options: ['console.log everything', 'Rubber duck', 'Pray', 'Rewrite from scratch'], category: 'funny' },
  { question: 'Your browser history is now public. Reaction?', options: ['Totally fine', 'Mildly concerned', 'Witness protection', 'Already cleared'], category: 'funny' },
  { question: 'If code had a smell, yours would be?', options: ['Fresh coffee ☕', 'Old pizza 🍕', 'Flowers 🌸', 'Burning 🔥'], category: 'funny' },
  { question: 'How do you name variables?', options: ['camelCase', 'snake_case', 'x, y, z', 'temp, temp2, temp3'], category: 'funny' },
  { question: 'Your deploy strategy?', options: ['CI/CD pipeline', 'Friday afternoon YOLO', '"It works locally"', 'Let the intern do it'], category: 'funny' },
];

// Mock Farcaster friends/mutuals
const farcasterUsers: FarcasterUser[] = [
  { fid: 1001, username: 'alice', displayName: 'Alice ✨', avatar: null, isMutual: true },
  { fid: 1002, username: 'bob', displayName: 'Bob Builder', avatar: null, isMutual: true },
  { fid: 1003, username: 'charlie', displayName: 'Charlie', avatar: null, isMutual: true },
  { fid: 1004, username: 'diana', displayName: 'Diana 🎨', avatar: null, isMutual: true },
  { fid: 1005, username: 'eve', displayName: 'Eve dev', avatar: null, isMutual: true },
  { fid: 1006, username: 'frank', displayName: 'Frank', avatar: null, isMutual: true },
  { fid: 1007, username: 'grace', displayName: 'Grace 🚀', avatar: null, isMutual: true },
  { fid: 1008, username: 'hank', displayName: 'Hank', avatar: null, isMutual: false },
  { fid: 1009, username: 'iris', displayName: 'Iris', avatar: null, isMutual: true },
  { fid: 1010, username: 'jack', displayName: 'Jack Builder', avatar: null, isMutual: true },
  { fid: 2000, username: 'nft_lover', displayName: 'NFT Lover', avatar: null, isMutual: false },
  { fid: 2001, username: 'defi_queen', displayName: 'DeFi Queen', avatar: null, isMutual: false },
  { fid: 2002, username: 'based_dev', displayName: 'Based Dev', avatar: null, isMutual: false },
];

// ============================
// SEED DATA
// ============================

function seedData() {
  if (polls.length > 0) return;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  // Daily question — auto-select from bank based on day number
  const dayNumber = getDayNumber();
  const todayStr = now.toISOString().split('T')[0];
  const bankIndex = (dayNumber - 1) % questionBank.length;
  const bankQ = questionBank[bankIndex];
  const dqId = uuidv4();

  dailyQuestions.push({
    id: dqId,
    question: bankQ.question,
    options: bankQ.options.map((text, i) => ({ id: `dq-${i}`, text })),
    category: bankQ.category,
    day_number: dayNumber,
    active_date: todayStr,
    created_at: new Date(now.getTime() - 3600000 * 8).toISOString(),
  });

  // Add yesterday's question too (for "yesterday's result" feature)
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const yesterdayBankIndex = (dayNumber - 2) % questionBank.length;
  const yBankQ = questionBank[yesterdayBankIndex >= 0 ? yesterdayBankIndex : 0];
  const yDqId = uuidv4();

  dailyQuestions.push({
    id: yDqId,
    question: yBankQ.question,
    options: yBankQ.options.map((text, i) => ({ id: `ydq-${i}`, text })),
    category: yBankQ.category,
    day_number: dayNumber - 1,
    active_date: yesterdayStr,
    created_at: new Date(yesterdayDate.getTime() - 3600000 * 8).toISOString(),
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
    tagged_fids: [],
    tagged_usernames: [],
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
    tagged_fids: [],
    tagged_usernames: [],
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
    tagged_fids: [],
    tagged_usernames: [],
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
    tagged_fids: [1001, 1002],
    tagged_usernames: ['alice', 'bob'],
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
    tagged_fids: [],
    tagged_usernames: [],
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
    tagged_fids: [],
    tagged_usernames: [],
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

  // Daily question votes (today)
  const dqOptions = dailyQuestions[0].options;
  for (let i = 0; i < 340; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: dailyQuestions[0].id,
      voter_fid: 8000 + i,
      voter_username: `user${i}`,
      voter_avatar: null,
      option_id: dqOptions[i % dqOptions.length].id,
      prediction: null,
      reaction: null,
      created_at: new Date(now.getTime() - Math.random() * 3600000 * 8).toISOString(),
    });
  }

  // Yesterday's daily question votes (1,247 votes)
  const yDqOptions = dailyQuestions[1].options;
  for (let i = 0; i < 1247; i++) {
    votes.push({
      id: uuidv4(),
      poll_id: dailyQuestions[1].id,
      voter_fid: 9000 + i,
      voter_username: `voter${i}`,
      voter_avatar: null,
      option_id: i < 540 ? yDqOptions[0].id : yDqOptions[i % yDqOptions.length].id,
      prediction: null,
      reaction: null,
      created_at: new Date(yesterdayDate.getTime() - Math.random() * 3600000 * 16).toISOString(),
    });
  }

  // Seed demo streak for current user
  dailyStreaks.set(9999, {
    fid: 9999,
    currentStreak: 12,
    bestStreak: 23,
    lastVoteDate: todayStr,
  });
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
  tagged_fids?: number[];
  tagged_usernames?: string[];
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
    tagged_fids: data.tagged_fids || [],
    tagged_usernames: data.tagged_usernames || [],
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

/** Get the current day number since launch */
export function getDayNumber(): number {
  const now = new Date();
  const diff = now.getTime() - LAUNCH_DATE.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

/** Get yesterday's daily question result */
export function getYesterdayResult(): {
  question: string;
  winnerText: string;
  winnerPercent: number;
  totalVotes: number;
  dayNumber: number;
} | null {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yq = dailyQuestions.find(q => q.active_date === yesterday);
  if (!yq) return null;

  const vc = getVoteCountsByOption(yq.id);
  const total = Object.values(vc).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  let maxVotes = 0;
  let winnerId = '';
  for (const [id, count] of Object.entries(vc)) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = id;
    }
  }

  const winnerOption = yq.options.find(o => o.id === winnerId);
  return {
    question: yq.question,
    winnerText: winnerOption?.text || 'Unknown',
    winnerPercent: Math.round((maxVotes / total) * 100),
    totalVotes: total,
    dayNumber: yq.day_number,
  };
}

/** Get user's daily question streak */
export function getDailyStreak(fid: number): DailyStreak {
  return dailyStreaks.get(fid) || {
    fid,
    currentStreak: 0,
    bestStreak: 0,
    lastVoteDate: '',
  };
}

/** Record a daily question vote and update streak */
export function recordDailyVote(fid: number): DailyStreak {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const existing = dailyStreaks.get(fid);

  if (existing) {
    if (existing.lastVoteDate === today) return existing; // Already voted today
    if (existing.lastVoteDate === yesterday) {
      // Consecutive day — extend streak
      existing.currentStreak += 1;
      existing.bestStreak = Math.max(existing.bestStreak, existing.currentStreak);
      existing.lastVoteDate = today;
      return existing;
    } else {
      // Streak broken — reset to 1
      existing.currentStreak = 1;
      existing.lastVoteDate = today;
      return existing;
    }
  }

  // New user
  const streak: DailyStreak = {
    fid,
    currentStreak: 1,
    bestStreak: 1,
    lastVoteDate: today,
  };
  dailyStreaks.set(fid, streak);
  return streak;
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
  const reactions = getReactionsForPoll(poll.id);
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
    totalReactions: reactions.length,
    tagged_usernames: poll.tagged_usernames || [],
    tagged_fids: poll.tagged_fids || [],
  };
}

// ============================
// SOCIAL FUNCTIONS
// ============================

/** Get mutuals (people you follow who follow you back) */
export function getMutuals(fid: number): FarcasterUser[] {
  void fid; // In production, filter by actual social graph
  return farcasterUsers.filter(u => u.isMutual);
}

/** Search mutuals by username */
export function searchMutuals(fid: number, query: string): FarcasterUser[] {
  const mutuals = getMutuals(fid);
  if (!query.trim()) return mutuals;
  const q = query.toLowerCase();
  return mutuals.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.displayName.toLowerCase().includes(q)
  );
}

/** Get all voters for a poll with option details and friend status */
export function getVoterDetails(pollId: string, userFid?: number): {
  fid: number;
  username: string;
  avatar: string | null;
  optionId: string;
  optionText: string;
  isFollowing: boolean;
}[] {
  const poll = getPollById(pollId);
  if (!poll) return [];
  const mutualFids = userFid ? new Set(getMutuals(userFid).map(m => m.fid)) : new Set<number>();

  return votes
    .filter(v => v.poll_id === pollId)
    .map(v => {
      const option = poll.options.find(o => o.id === v.option_id);
      return {
        fid: v.voter_fid,
        username: v.voter_username,
        avatar: v.voter_avatar,
        optionId: v.option_id,
        optionText: option?.text || 'Unknown',
        isFollowing: mutualFids.has(v.voter_fid),
      };
    })
    .sort((a, b) => (a.isFollowing === b.isFollowing ? 0 : a.isFollowing ? -1 : 1));
}

/** Get network demographic breakdown for a poll */
export function getNetworkBreakdown(pollId: string, userFid: number): {
  hasEnoughData: boolean;
  network: Record<string, { optionText: string; percent: number }>;
  everyone: Record<string, { optionText: string; percent: number }>;
} | null {
  const poll = getPollById(pollId);
  if (!poll) return null;

  const allVotes = votes.filter(v => v.poll_id === pollId);
  if (allVotes.length < 10) return { hasEnoughData: false, network: {}, everyone: {} };

  const mutualFids = new Set(getMutuals(userFid).map(m => m.fid));
  const networkVotes = allVotes.filter(v => mutualFids.has(v.voter_fid));
  const otherVotes = allVotes.filter(v => !mutualFids.has(v.voter_fid));

  const calcBreakdown = (voteSubset: Vote[]) => {
    const total = voteSubset.length;
    if (total === 0) return {};
    const counts: Record<string, number> = {};
    for (const v of voteSubset) counts[v.option_id] = (counts[v.option_id] || 0) + 1;
    const result: Record<string, { optionText: string; percent: number }> = {};
    for (const [optId, count] of Object.entries(counts)) {
      const opt = poll.options.find(o => o.id === optId);
      result[optId] = { optionText: opt?.text || 'Unknown', percent: Math.round((count / total) * 100) };
    }
    return result;
  };

  return {
    hasEnoughData: true,
    network: calcBreakdown(networkVotes),
    everyone: calcBreakdown(otherVotes),
  };
}

/** Get user statistics */
export function getUserStats(fid: number): UserStatsData {
  const userVotes = votes.filter(v => v.voter_fid === fid);
  const userPolls = polls.filter(p => p.creator_fid === fid);

  // Calculate majority %
  let majorityCount = 0;
  for (const v of userVotes) {
    const maj = getMajorityOptionId(v.poll_id);
    if (maj && v.option_id === maj) majorityCount++;
  }
  const majorityPercent = userVotes.length > 0
    ? Math.round((majorityCount / userVotes.length) * 100)
    : 0;

  // Fun label based on majority %
  let funLabel = 'Newcomer 🌱';
  if (userVotes.length >= 5) {
    if (majorityPercent >= 70) funLabel = 'Crowd Follower 🐑';
    else if (majorityPercent >= 50) funLabel = 'Balanced Voter ⚖️';
    else if (majorityPercent >= 40) funLabel = 'Free Thinker 🧠';
    else funLabel = 'Independent Thinker 🎯';
  }

  // Most active day
  const dayCounts: Record<string, number> = {};
  for (const v of userVotes) {
    const day = new Date(v.created_at).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }
  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Voting history
  const votingHistory = userVotes.map(v => {
    const poll = getPollById(v.poll_id);
    return {
      pollId: v.poll_id,
      question: poll?.question || 'Unknown poll',
      optionId: v.option_id,
      created_at: v.created_at,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    totalVotes: userVotes.length,
    pollsCreated: userPolls.length,
    majorityPercent,
    streak: getDailyStreak(fid).currentStreak,
    mostActiveDay,
    topCategory: 'Tech 💻', // Mock category
    funLabel,
    votingHistory,
  };
}

/** Update poll's on-chain transaction hash after saving to Base */
export function updatePollOnchainTx(pollId: string, txHash: string): boolean {
  const poll = polls.find(p => p.id === pollId);
  if (!poll) return false;
  poll.onchain_tx = txHash;
  return true;
}
