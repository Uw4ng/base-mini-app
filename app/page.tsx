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
    <main className="min-h-screen max-w-lg mx-auto relative" style={{ paddingBottom: '96px' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--space-3) var(--space-4)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <div
              className="flex items-center justify-center text-[14px] font-bold"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-blue)',
              }}
            >
              📊
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-tight">Quick Poll</h1>
              <p className="text-[11px] leading-none" style={{ color: 'var(--text-tertiary)' }}>
                Ask anything. Decide together.
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div
            className="flex"
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setActiveTab('feed')}
              className="text-[13px] font-medium transition-all touch-target"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: activeTab === 'feed' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'feed' ? 'white' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[13px] font-medium transition-all touch-target"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: activeTab === 'profile' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'profile' ? 'white' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {activeTab === 'feed' ? (
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {/* Daily Question */}
            {dailyQuestion && <DailyQuestion question={dailyQuestion} />}

            {/* Trending */}
            <TrendingPolls polls={trendingPolls} />

            {/* Divider */}
            <div className="flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Recent Polls</span>
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Feed */}
            {loading ? (
              <div className="flex flex-col" style={{ gap: 'var(--space-6)' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="poll-card">
                    <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <div className="skeleton" style={{ width: '96px', height: '14px' }} />
                    </div>
                    <div className="skeleton" style={{ width: '75%', height: '18px', marginBottom: 'var(--space-3)' }} />
                    <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                      <div className="skeleton" style={{ height: '48px' }} />
                      <div className="skeleton" style={{ height: '48px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PollFeed initialPolls={polls} />
            )}
          </div>
        ) : (
          <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-4)' }}>
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

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fab animate-pulse-glow"
        aria-label="Create new poll"
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
    </main>
  );
}
