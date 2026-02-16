'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DailyQuestion from './components/feed/DailyQuestion';
import TrendingPolls from './components/feed/TrendingPolls';
import PollCard from './components/poll/PollCard';
import CreatePoll from './components/poll/CreatePoll';
import BottomSheet from './components/ui/BottomSheet';
import UserStats from './components/profile/UserStats';
import PollHistory from './components/profile/PollHistory';
import type { Poll } from '@/lib/db';

type TabType = 'feed' | 'profile';

interface EnrichedPoll extends Poll {
  voteCounts?: Record<string, number>;
  userVotedOptionId?: string | null;
  userPrediction?: string | null;
  predictionCorrect?: boolean | null;
  majorityOptionId?: string | null;
  recentVoters?: { fid: number; username: string; avatar: string | null }[];
  reactions?: { fid: number; username: string; reaction: string; avatar: string | null }[];
}

interface DailyQuestionData {
  question: {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    category: string;
    day_number: number;
    active_date: string;
  };
  voteCounts: Record<string, number>;
  totalVotes: number;
  dayNumber: number;
  yesterdayResult: {
    question: string;
    winnerText: string;
    winnerPercent: number;
    totalVotes: number;
    dayNumber: number;
  } | null;
  streak: {
    fid: number;
    currentStreak: number;
    bestStreak: number;
    lastVoteDate: string;
  } | null;
  userVotedOptionId: string | null;
}

const USER_FID = 9999;

export default function Home() {
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [polls, setPolls] = useState<EnrichedPoll[]>([]);
  const [trendingPolls, setTrendingPolls] = useState<EnrichedPoll[]>([]);
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Post-creation UX
  const [toast, setToast] = useState<string | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [lastCreatedPoll, setLastCreatedPoll] = useState<{ id: string; question: string } | null>(null);
  const [highlightedPollId, setHighlightedPollId] = useState<string | null>(null);

  // ==========================
  // DATA FETCHING
  // ==========================

  const fetchFeed = useCallback(async (cursor?: string) => {
    const url = cursor
      ? `/api/polls?fid=${USER_FID}&limit=10&cursor=${encodeURIComponent(cursor)}`
      : `/api/polls?fid=${USER_FID}&limit=10`;

    const res = await fetch(url);
    const data = await res.json();
    return { polls: data.polls || [], nextCursor: data.nextCursor };
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [feedData, trendingRes, dailyRes] = await Promise.all([
        fetchFeed(),
        fetch(`/api/polls?trending=true&fid=${USER_FID}&limit=5`).then(r => r.json()),
        fetch(`/api/daily?fid=${USER_FID}`).then(r => r.json()),
      ]);

      setPolls(feedData.polls);
      setNextCursor(feedData.nextCursor);
      setTrendingPolls(trendingRes.polls || []);
      if (dailyRes.question) setDailyQuestion(dailyRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchFeed]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ==========================
  // INFINITE SCROLL
  // ==========================

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchFeed(nextCursor);
      setPolls(prev => [...prev, ...data.polls]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, fetchFeed]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && nextCursor && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [nextCursor, loadingMore, loadMore]);

  // ==========================
  // REAL-TIME POLLING (15s)
  // ==========================

  useEffect(() => {
    if (activeTab !== 'feed') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/polls?fid=${USER_FID}&limit=${polls.length || 10}`);
        const data = await res.json();
        if (data.polls) {
          setPolls(prev => {
            const updated = [...prev];
            for (const newP of data.polls) {
              const idx = updated.findIndex(p => p.id === newP.id);
              if (idx >= 0) {
                // Preserve user's local vote state
                if (updated[idx].userVotedOptionId) {
                  newP.userVotedOptionId = updated[idx].userVotedOptionId;
                }
                updated[idx] = { ...updated[idx], ...newP, total_votes: newP.total_votes, voteCounts: newP.voteCounts };
              }
            }
            return updated;
          });
        }
      } catch {
        // Silently fail
      }
    }, 15000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeTab, polls.length]);

  // ==========================
  // PULL TO REFRESH
  // ==========================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
  }, [fetchAll]);

  // ==========================
  // ACTIONS
  // ==========================

  const handleVote = async (pollId: string, optionId: string, prediction?: string) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          optionId,
          voterFid: USER_FID,
          voterUsername: 'quickpoll.dev',
          prediction: prediction || null,
        }),
      });
      const data = await res.json();

      if (data.voteCounts) {
        setPolls(prev =>
          prev.map(p =>
            p.id === pollId
              ? {
                ...p,
                voteCounts: data.voteCounts,
                total_votes: data.totalVotes,
                userVotedOptionId: optionId,
                predictionCorrect: data.predictionCorrect,
                majorityOptionId: data.majorityOptionId,
              }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleReaction = async (pollId: string, reaction: string) => {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          optionId: 'reaction-only',
          voterFid: USER_FID,
          voterUsername: 'quickpoll.dev',
          reaction,
        }),
      });
    } catch {
      // Silently fail — reaction is optional
    }
  };

  const handleCreatePoll = async (pollData: {
    question: string;
    options: { id: string; text: string; imageUrl?: string }[];
    poll_type: string;
    is_anonymous: boolean;
    is_prediction: boolean;
    expires_at: string | null;
    is_onchain: boolean;
    tagged_fids: number[];
    tagged_usernames: string[];
  }) => {
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pollData,
          creator_fid: USER_FID,
          creator_username: 'quickpoll.dev',
        }),
      });
      const data = await res.json();
      if (data.poll) {
        setPolls(prev => [data.poll, ...prev]);
        setHighlightedPollId(data.poll.id);
        setTimeout(() => setHighlightedPollId(null), 3000);

        // Show toast
        setToast('Poll created! Share it with friends?');
        setTimeout(() => setToast(null), 4000);

        // Show share prompt
        setLastCreatedPoll({ id: data.poll.id, question: pollData.question });
        setTimeout(() => setShowSharePrompt(true), 600);
      }
    } catch (error) {
      console.error('Failed to create poll:', error);
      setToast('Failed to create poll');
      setTimeout(() => setToast(null), 3000);
    }
    setShowCreate(false);
  };

  const handleShareToFarcaster = () => {
    if (!lastCreatedPoll) return;
    const castText = `I just asked: ${lastCreatedPoll.question} — Vote now! 🗳️`;
    const shareUrl = `${window.location.origin}/poll/${lastCreatedPoll.id}`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(farcasterUrl, '_blank');
    setShowSharePrompt(false);
  };

  // ==========================
  // RENDERING
  // ==========================

  const renderSkeleton = () => (
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
            <div className="skeleton" style={{ height: '48px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderFeed = () => {
    if (polls.length === 0 && !loading) {
      return (
        <div className="text-center animate-fade-in" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <div className="text-5xl" style={{ marginBottom: 'var(--space-4)' }}>📊</div>
          <h3 className="text-[18px] font-bold" style={{ marginBottom: 'var(--space-2)' }}>No polls yet</h3>
          <p className="text-metadata" style={{ marginBottom: 'var(--space-4)' }}>Create the first one!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-button touch-target"
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-blue)',
              color: 'white',
              border: 'none',
            }}
          >
            + Create Poll
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col" style={{ gap: 'var(--space-6)' }}>
        {polls.map((poll, index) => (
          <div
            key={poll.id}
            className="animate-slide-down"
            style={{
              animationDelay: `${index * 50}ms`,
              ...(highlightedPollId === poll.id ? {
                boxShadow: '0 0 0 2px var(--accent-blue), 0 0 20px rgba(59, 130, 246, 0.15)',
                borderRadius: 'var(--radius-md)',
                transition: 'box-shadow 3s ease-out',
              } : {}),
            }}
          >
            <PollCard
              poll={poll}
              currentUserFid={USER_FID}
              onVote={handleVote}
              onReaction={handleReaction}
            />
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: '1px' }} />

        {/* Loading more */}
        {loadingMore && (
          <div className="flex justify-center" style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <div
                className="animate-spin rounded-full"
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--border-default)',
                  borderTopColor: 'var(--accent-blue)',
                }}
              />
              <span className="text-metadata">Loading more...</span>
            </div>
          </div>
        )}

        {/* No more polls */}
        {!nextCursor && polls.length > 0 && !loadingMore && (
          <div className="text-center text-metadata" style={{ padding: 'var(--space-4) 0' }}>
            You&apos;re all caught up! ✨
          </div>
        )}
      </div>
    );
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

          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className={`flex items-center justify-center transition-transform touch-target ${refreshing ? 'animate-spin' : ''}`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
              }}
              aria-label="Refresh feed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>

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

            {/* User avatar */}
            <div
              className="rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--accent-purple)',
              }}
            >
              Q
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {activeTab === 'feed' ? (
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {/* Daily Question */}
            {dailyQuestion && <DailyQuestion data={dailyQuestion} />}

            {/* Trending */}
            <TrendingPolls polls={trendingPolls} />

            {/* Divider */}
            <div className="flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Recent Polls</span>
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Feed */}
            {loading ? renderSkeleton() : renderFeed()}
          </div>
        ) : (
          <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-4)' }}>
            <UserStats
              fid={USER_FID}
              username="quickpoll.dev"
            />
            <PollHistory polls={polls.filter(p => p.creator_fid === USER_FID)} />
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

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed left-1/2 bottom-28 z-50 animate-slide-up"
          style={{
            transform: 'translateX(-50%)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            whiteSpace: 'nowrap',
            maxWidth: '90%',
          }}
        >
          {toast}
        </div>
      )}

      {/* Farcaster share prompt */}
      {showSharePrompt && lastCreatedPoll && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="w-full max-w-lg animate-slide-up"
            style={{
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="rounded-full" style={{ width: '36px', height: '4px', background: 'var(--border-default)' }} />
            </div>

            <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="text-3xl" style={{ marginBottom: 'var(--space-2)' }}>🗳️</div>
              <h3 className="text-[16px] font-bold" style={{ marginBottom: 'var(--space-1)' }}>Share your poll</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Cast it to your Farcaster feed</p>
            </div>

            {/* Preview */}
            <div
              className="text-[14px]"
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-4)',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              I just asked: <strong style={{ color: 'var(--text-primary)' }}>{lastCreatedPoll.question}</strong> — Vote now! 🗳️
            </div>

            {/* Action buttons */}
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <button
                onClick={handleShareToFarcaster}
                className="w-full touch-target"
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-purple)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  height: '48px',
                }}
              >
                Cast to Farcaster
              </button>
              <button
                onClick={() => setShowSharePrompt(false)}
                className="w-full touch-target"
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
