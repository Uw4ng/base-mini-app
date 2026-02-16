'use client';

import { useState, useEffect, useCallback } from 'react';
import DailyQuestion from './components/feed/DailyQuestion';
import TrendingPolls from './components/feed/TrendingPolls';
import PollFeed from './components/feed/PollFeed';
import CreatePoll from './components/poll/CreatePoll';
import BottomSheet from './components/ui/BottomSheet';
import UserStats from './components/profile/UserStats';
import PollHistory from './components/profile/PollHistory';
import type { Poll, DailyQuestion as DQType } from '@/lib/db';

type TabType = 'feed' | 'profile';

export default function Home() {
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [polls, setPolls] = useState<(Poll & { voteCounts?: Record<string, number> })[]>([]);
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([]);
  const [dailyQuestion, setDailyQuestion] = useState<DQType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [pollsRes, trendingRes] = await Promise.all([
        fetch('/api/polls'),
        fetch('/api/polls?trending=true'),
      ]);
      const pollsData = await pollsRes.json();
      const trendingData = await trendingRes.json();

      setPolls(pollsData.polls || []);
      setTrendingPolls(trendingData.polls || []);

      // mock daily question from first poll data or seed
      if (pollsData.polls?.length > 0) {
        setDailyQuestion({
          id: 'dq-1',
          question: "What's the most important feature for a crypto wallet?",
          options: [
            { id: 'opt1', text: 'Security' },
            { id: 'opt2', text: 'Ease of use' },
            { id: 'opt3', text: 'Multi-chain support' },
            { id: 'opt4', text: 'Low fees' },
          ],
          active_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePoll = async (pollData: {
    question: string;
    options: { id: string; text: string }[];
    poll_type: string;
    is_anonymous: boolean;
    expires_at: string | null;
    is_onchain: boolean;
  }) => {
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pollData,
          creator_fid: 9999,
          creator_username: 'quickpoll.dev',
        }),
      });
      const data = await res.json();
      if (data.poll) {
        setPolls(prev => [{ ...data.poll, voteCounts: {} }, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create poll:', error);
    }

    setShowCreate(false);
  };

  return (
    <main className="min-h-screen max-w-lg mx-auto pb-24 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--accent-gradient)' }}
            >
              📊
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Quick Poll</h1>
              <p className="text-[10px] text-muted leading-none">Ask anything. Decide together.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex bg-foreground/5 rounded-lg p-0.5">
              <button
                onClick={() => { setActiveTab('feed'); setShowProfile(false); }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'feed' ? 'bg-accent text-white' : 'text-muted'
                  }`}
              >
                Feed
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setShowProfile(true); }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'profile' ? 'bg-accent text-white' : 'text-muted'
                  }`}
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4">
        {activeTab === 'feed' ? (
          <div className="space-y-4">
            {/* Daily Question */}
            {dailyQuestion && (
              <DailyQuestion question={dailyQuestion} />
            )}

            {/* Trending */}
            <TrendingPolls polls={trendingPolls} />

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted font-medium">Recent Polls</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-foreground/10" />
                      <div className="h-4 bg-foreground/10 rounded w-24" />
                    </div>
                    <div className="h-5 bg-foreground/10 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-10 bg-foreground/10 rounded-xl" />
                      <div className="h-10 bg-foreground/10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PollFeed initialPolls={polls} />
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <UserStats
              pollsCreated={polls.filter(p => p.creator_fid === 9999).length}
              votesGiven={12}
              streak={5}
              username="quickpoll.dev"
            />
            <PollHistory
              polls={polls.filter(p => p.creator_fid === 9999)}
            />
          </div>
        )}
      </div>

      {/* FAB - Create Poll */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg shadow-accent/30 flex items-center justify-center text-white text-xl font-bold z-30 transition-transform hover:scale-110 active:scale-95 animate-pulse-glow"
        style={{ background: 'var(--accent-gradient)' }}
      >
        +
      </button>

      {/* Create Poll Bottom Sheet */}
      <BottomSheet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Poll"
      >
        <CreatePoll
          onSubmit={handleCreatePoll}
          onClose={() => setShowCreate(false)}
        />
      </BottomSheet>

      {/* Profile Bottom Sheet (mobile alternative) */}
      <BottomSheet
        isOpen={showProfile && activeTab !== 'profile'}
        onClose={() => setShowProfile(false)}
        title="Your Profile"
      >
        <UserStats
          pollsCreated={polls.filter(p => p.creator_fid === 9999).length}
          votesGiven={12}
          streak={5}
          username="quickpoll.dev"
        />
      </BottomSheet>
    </main>
  );
}
