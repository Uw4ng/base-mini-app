'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FriendTagger from '../social/FriendTagger';
import { useToast } from '@/app/components/ui/ToastProvider';

type PollType = 'standard' | 'image' | 'this_or_that' | 'rating';
type ExpiresIn = null | '1h' | '6h' | '12h' | '24h' | '48h';

interface CreatePollProps {
    onSubmit: (data: {
        question: string;
        options: { id: string; text: string; imageUrl?: string }[];
        poll_type: PollType;
        is_anonymous: boolean;
        is_prediction: boolean;
        expires_at: string | null;
        is_onchain: boolean;
        tagged_fids: number[];
        tagged_usernames: string[];
    }) => void;
    onClose?: () => void;
}

const EXPIRY_OPTIONS: { value: ExpiresIn; label: string }[] = [
    { value: null, label: 'None' },
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '12h', label: '12h' },
    { value: '24h', label: '24h' },
    { value: '48h', label: '48h' },
];

const POLL_TYPES: { id: PollType; label: string; icon: string }[] = [
    { id: 'standard', label: 'Text', icon: '📝' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'this_or_that', label: 'A or B', icon: '⚡' },
    { id: 'rating', label: 'Rate', icon: '⭐' },
];

function getExpiryDate(expiresIn: ExpiresIn): string | null {
    if (!expiresIn) return null;
    const hours = parseInt(expiresIn);
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function formatExpiryPreview(expiresIn: ExpiresIn): string {
    if (!expiresIn) return '';
    const date = new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000);
    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Ends at ${time}${isToday ? ' today' : ` ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}`;
}

export default function CreatePoll({ onSubmit, onClose }: CreatePollProps) {
    const [question, setQuestion] = useState('');
    const [pollType, setPollType] = useState<PollType>('standard');
    const [options, setOptions] = useState<{ id: string; text: string; imageUrl?: string }[]>([
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
    ]);
    const [ratingSubject, setRatingSubject] = useState('');
    const [expiresIn, setExpiresIn] = useState<ExpiresIn>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPrediction, setIsPrediction] = useState(false);
    const [isOnchain, setIsOnchain] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);
    const [showFriendTagger, setShowFriendTagger] = useState(false);
    const [taggedFriends, setTaggedFriends] = useState<{ fid: number; username: string }[]>([]);

    const { showToast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus textarea on mount
    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 400);
    }, []);

    // Reset options when poll type changes
    useEffect(() => {
        if (pollType === 'this_or_that') {
            setOptions([
                { id: uuidv4(), text: '' },
                { id: uuidv4(), text: '' },
            ]);
        } else if (pollType === 'rating') {
            // Rating uses a single subject
            setOptions([]);
        } else if (options.length < 2) {
            setOptions([
                { id: uuidv4(), text: '' },
                { id: uuidv4(), text: '' },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pollType]);

    // ==================
    // OPTIONS MANAGEMENT
    // ==================

    const addOption = () => {
        if (options.length < 4 && pollType !== 'this_or_that') {
            setOptions([...options, { id: uuidv4(), text: '' }]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2 && pollType !== 'this_or_that') {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOptionText = (index: number, text: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], text };
        setOptions(updated);
    };

    // ==================
    // VALIDATION
    // ==================

    const questionError = touched && question.trim().length > 0 && question.trim().length < 3
        ? 'Question must be at least 3 characters'
        : question.length > 200
            ? 'Question too long (max 200)'
            : null;

    const getOptionErrors = () => {
        if (pollType === 'rating') return [];
        return options.map((opt, i) => {
            if (!touched) return null;
            if (opt.text.length > 80) return 'Max 80 characters';
            // Check duplicates
            const isDuplicate = options.some((o, j) => j !== i && o.text.trim() && o.text.trim().toLowerCase() === opt.text.trim().toLowerCase());
            if (isDuplicate && opt.text.trim()) return 'Duplicate option';
            return null;
        });
    };

    const optionErrors = getOptionErrors();

    const isValid = () => {
        if (question.trim().length < 3) return false;
        if (question.length > 200) return false;
        if (pollType === 'rating') {
            return ratingSubject.trim().length >= 1;
        }
        const filled = options.filter(o => o.text.trim());
        if (filled.length < 2) return false;
        // Check for duplicates
        const texts = filled.map(o => o.text.trim().toLowerCase());
        if (new Set(texts).size !== texts.length) return false;
        // Check max length
        if (options.some(o => o.text.length > 80)) return false;
        return true;
    };

    // ==================
    // SUBMIT
    // ==================

    const handleSubmit = async () => {
        setTouched(true);
        if (!isValid() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                question: pollType === 'rating'
                    ? `Rate: ${ratingSubject.trim()}`
                    : question.trim(),
                options: pollType === 'rating'
                    ? [1, 2, 3, 4, 5].map(n => ({
                        id: uuidv4(),
                        text: `${'★'.repeat(n)}${'☆'.repeat(5 - n)} (${n})`,
                    }))
                    : options.filter(o => o.text.trim() || o.imageUrl).map(o => ({
                        ...o,
                        text: o.text.trim(),
                    })),
                poll_type: pollType,
                is_anonymous: isAnonymous,
                is_prediction: isPrediction,
                expires_at: getExpiryDate(expiresIn),
                is_onchain: isOnchain,
                tagged_fids: taggedFriends.map(f => f.fid),
                tagged_usernames: taggedFriends.map(f => f.username),
            });
            showToast('Poll created successfully!', 'success');
            onClose?.();
        } catch (error) {
            console.error(error);
            showToast('Failed to create poll. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    // ==================
    // RENDER
    // ==================

    return (
        <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {/* Question */}
            <div>
                <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={e => { setQuestion(e.target.value); setTouched(true); }}
                    placeholder="Ask anything..."
                    className="w-full focus:outline-none resize-none"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: `1px solid ${questionError ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-4)',
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif',
                        minHeight: '88px',
                        lineHeight: 1.4,
                    }}
                    rows={3}
                    maxLength={200}
                    onFocus={e => { e.currentTarget.style.borderColor = questionError ? 'var(--accent-red)' : 'var(--border-focus)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = questionError ? 'var(--accent-red)' : 'var(--border-subtle)'; }}
                />
                <div className="flex items-center justify-between" style={{ marginTop: '4px', padding: '0 4px' }}>
                    {questionError
                        ? <span className="text-[12px]" style={{ color: 'var(--accent-red)' }}>{questionError}</span>
                        : <span />
                    }
                    <span className="text-[12px] tabular-nums" style={{
                        color: question.length > 180 ? 'var(--accent-orange)' : 'var(--text-tertiary)',
                    }}>
                        {question.length}/200
                    </span>
                </div>
            </div>

            {/* Poll Type Tabs — horizontal scroll */}
            <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 'var(--space-2)', margin: '0 -4px', padding: '0 4px' }}>
                {POLL_TYPES.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setPollType(type.id)}
                        className="flex items-center touch-target transition-all flex-shrink-0"
                        style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-full)',
                            gap: '6px',
                            background: pollType === type.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                            color: pollType === type.id ? 'white' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: pollType === type.id ? 'none' : '1px solid var(--border-subtle)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>

            {/* ================================ */}
            {/* TYPE-SPECIFIC OPTIONS            */}
            {/* ================================ */}

            {/* A) STANDARD — 2-4 text options */}
            {pollType === 'standard' && (
                <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-2)' }}>
                    {options.map((opt, i) => (
                        <div key={opt.id}>
                            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                                <div className="relative flex-1">
                                    <input
                                        value={opt.text}
                                        onChange={e => updateOptionText(i, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        className="w-full focus:outline-none"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            border: `1px solid ${optionErrors[i] ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '14px 16px',
                                            color: 'var(--text-primary)',
                                            fontSize: '15px',
                                            minHeight: '48px',
                                        }}
                                        maxLength={80}
                                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = optionErrors[i] ? 'var(--accent-red)' : 'var(--border-subtle)'; setTouched(true); }}
                                    />
                                    {opt.text.length > 60 && (
                                        <span className="absolute top-1 right-2 text-[11px] tabular-nums" style={{
                                            color: opt.text.length > 75 ? 'var(--accent-red)' : 'var(--text-tertiary)',
                                        }}>
                                            {opt.text.length}/80
                                        </span>
                                    )}
                                </div>
                                {options.length > 2 && (
                                    <button
                                        onClick={() => removeOption(i)}
                                        className="touch-target flex items-center justify-center rounded-full flex-shrink-0"
                                        style={{
                                            width: '36px', height: '36px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--accent-red)',
                                            border: 'none',
                                            fontSize: '18px',
                                        }}
                                        aria-label={`Remove option ${String.fromCharCode(65 + i)}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {optionErrors[i] && (
                                <span className="text-[12px] block" style={{ color: 'var(--accent-red)', padding: '2px 4px' }}>{optionErrors[i]}</span>
                            )}
                        </div>
                    ))}
                    {options.length < 4 && (
                        <button
                            onClick={addOption}
                            className="w-full transition-colors touch-target text-[14px]"
                            style={{
                                border: '1px dashed var(--border-default)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '14px',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                            }}
                        >
                            + Add option
                        </button>
                    )}
                </div>
            )}

            {/* B) IMAGE — 2-4 image options */}
            {pollType === 'image' && (
                <div className="flex flex-col animate-fade-in" style={{ gap: 'var(--space-2)' }}>
                    {options.map((opt, i) => (
                        <div key={opt.id}>
                            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                                {/* Image placeholder */}
                                <div
                                    className="flex items-center justify-center flex-shrink-0 rounded-lg cursor-pointer transition-colors"
                                    style={{
                                        width: '80px', height: '80px',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px dashed var(--border-default)',
                                    }}
                                    onClick={() => {
                                        // In production, this would open a file picker
                                        // For now, we'll use a placeholder
                                        const updated = [...options];
                                        updated[i] = { ...updated[i], imageUrl: `https://picsum.photos/seed/${opt.id}/200` };
                                        setOptions(updated);
                                    }}
                                >
                                    {opt.imageUrl ? (
                                        <img
                                            src={opt.imageUrl}
                                            alt={`Option ${String.fromCharCode(65 + i)}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-xl">📷</div>
                                            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tap</div>
                                        </div>
                                    )}
                                </div>
                                {/* Caption input */}
                                <div className="flex-1">
                                    <input
                                        value={opt.text}
                                        onChange={e => updateOptionText(i, e.target.value)}
                                        placeholder={`Caption ${String.fromCharCode(65 + i)}`}
                                        className="w-full focus:outline-none"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            border: `1px solid ${optionErrors[i] ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '14px 16px',
                                            color: 'var(--text-primary)',
                                            fontSize: '15px',
                                        }}
                                        maxLength={80}
                                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; setTouched(true); }}
                                    />
                                </div>
                                {options.length > 2 && (
                                    <button
                                        onClick={() => removeOption(i)}
                                        className="touch-target flex items-center justify-center rounded-full flex-shrink-0"
                                        style={{
                                            width: '36px', height: '36px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--accent-red)',
                                            border: 'none',
                                            fontSize: '18px',
                                        }}
                                        aria-label={`Remove option ${String.fromCharCode(65 + i)}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {optionErrors[i] && (
                                <span className="text-[12px] block" style={{ color: 'var(--accent-red)', padding: '2px 4px 2px 96px' }}>{optionErrors[i]}</span>
                            )}
                        </div>
                    ))}
                    {options.length < 4 && (
                        <button
                            onClick={addOption}
                            className="w-full transition-colors touch-target text-[14px]"
                            style={{
                                border: '1px dashed var(--border-default)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '14px',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                            }}
                        >
                            + Add image option
                        </button>
                    )}
                </div>
            )}

            {/* C) THIS OR THAT — exactly 2 options with VS */}
            {pollType === 'this_or_that' && (
                <div className="animate-fade-in">
                    <div className="relative flex flex-col" style={{ gap: 'var(--space-3)' }}>
                        {/* Option A */}
                        <input
                            value={options[0]?.text || ''}
                            onChange={e => updateOptionText(0, e.target.value)}
                            placeholder="This..."
                            className="w-full focus:outline-none text-center"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: `1px solid ${optionErrors[0] ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '20px 16px',
                                color: 'var(--text-primary)',
                                fontSize: '17px',
                                fontWeight: 600,
                            }}
                            maxLength={80}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; setTouched(true); }}
                        />
                        {optionErrors[0] && (
                            <span className="text-[12px] block text-center" style={{ color: 'var(--accent-red)' }}>{optionErrors[0]}</span>
                        )}

                        {/* VS badge */}
                        <div className="flex items-center justify-center">
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: '40px', height: '40px',
                                    background: 'var(--accent-orange)',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                                }}
                            >
                                VS
                            </div>
                        </div>

                        {/* Option B */}
                        <input
                            value={options[1]?.text || ''}
                            onChange={e => updateOptionText(1, e.target.value)}
                            placeholder="That..."
                            className="w-full focus:outline-none text-center"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: `1px solid ${optionErrors[1] ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '20px 16px',
                                color: 'var(--text-primary)',
                                fontSize: '17px',
                                fontWeight: 600,
                            }}
                            maxLength={80}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; setTouched(true); }}
                        />
                        {optionErrors[1] && (
                            <span className="text-[12px] block text-center" style={{ color: 'var(--accent-red)' }}>{optionErrors[1]}</span>
                        )}
                    </div>
                </div>
            )}

            {/* D) RATING — single subject input with star preview */}
            {pollType === 'rating' && (
                <div className="animate-fade-in flex flex-col" style={{ gap: 'var(--space-3)' }}>
                    <div>
                        <label className="text-[12px] font-medium block" style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            What are you rating?
                        </label>
                        <input
                            value={ratingSubject}
                            onChange={e => { setRatingSubject(e.target.value); setTouched(true); }}
                            placeholder="e.g. Today's community call"
                            className="w-full focus:outline-none"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '14px 16px',
                                color: 'var(--text-primary)',
                                fontSize: '15px',
                                minHeight: '48px',
                            }}
                            maxLength={100}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        />
                    </div>

                    {/* Star preview */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            padding: 'var(--space-4)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div className="flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex" style={{ gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <span key={n} className="text-2xl" style={{ color: n <= 3 ? 'var(--accent-orange)' : 'var(--text-tertiary)', opacity: n <= 3 ? 1 : 0.4 }}>
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                1–5 star scale
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================ */}
            {/* TAG FRIENDS                       */}
            {/* ================================ */}

            <div>
                <button
                    onClick={() => setShowFriendTagger(true)}
                    className="flex items-center transition-colors"
                    style={{
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-tertiary)',
                        border: '1px dashed var(--border-default)',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        width: '100%',
                    }}
                >
                    🏷️ {taggedFriends.length > 0 ? `${taggedFriends.length} friend${taggedFriends.length > 1 ? 's' : ''} tagged` : 'Tag friends (optional)'}
                </button>
                {taggedFriends.length > 0 && (
                    <div className="flex flex-wrap" style={{ gap: '4px', marginTop: '6px' }}>
                        {taggedFriends.map(f => (
                            <span
                                key={f.fid}
                                className="text-[11px] font-medium"
                                style={{
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    color: 'var(--accent-blue)',
                                }}
                            >
                                @{f.username}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <FriendTagger
                isOpen={showFriendTagger}
                onClose={() => setShowFriendTagger(false)}
                selectedFriends={taggedFriends}
                onSelect={setTaggedFriends}
                maxTags={5}
            />

            {/* ================================ */}
            {/* SETTINGS                         */}
            {/* ================================ */}

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 -8px' }} />

            <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
                {/* Timer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <span className="text-base">⏱</span>
                        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Timer</span>
                    </div>
                    <div className="flex" style={{ gap: '4px' }}>
                        {EXPIRY_OPTIONS.map(opt => (
                            <button
                                key={String(opt.value)}
                                onClick={() => setExpiresIn(opt.value)}
                                className="transition-all"
                                style={{
                                    padding: '5px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: expiresIn === opt.value ? 'var(--accent-blue)' : 'transparent',
                                    color: expiresIn === opt.value ? 'white' : 'var(--text-tertiary)',
                                    border: expiresIn === opt.value ? 'none' : '1px solid var(--border-subtle)',
                                    minWidth: '36px',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                {expiresIn && (
                    <div className="text-[12px] animate-fade-in" style={{ color: 'var(--accent-blue)', paddingLeft: '28px' }}>
                        {formatExpiryPreview(expiresIn)}
                    </div>
                )}

                {/* Anonymous toggle */}
                <ToggleRow
                    icon="👁"
                    label="Anonymous"
                    helperOn="Voters won't be shown"
                    value={isAnonymous}
                    onChange={setIsAnonymous}
                    color="var(--accent-blue)"
                />

                {/* Prediction toggle */}
                <ToggleRow
                    icon="🎯"
                    label="Prediction"
                    helperOn="Voters guess the majority first"
                    value={isPrediction}
                    onChange={setIsPrediction}
                    color="var(--accent-orange)"
                />

                {/* On-chain toggle */}
                <ToggleRow
                    icon="⛓"
                    label="Save on-chain"
                    helperOn="Results will be saved to Base permanently"
                    value={isOnchain}
                    onChange={setIsOnchain}
                    color="var(--accent-purple)"
                    subtle
                    note={isOnchain ? 'Requires wallet connection' : undefined}
                />
            </div>

            {/* ================================ */}
            {/* SUBMIT BUTTON                    */}
            {/* ================================ */}

            <button
                onClick={handleSubmit}
                disabled={!isValid() || isSubmitting}
                className="w-full transition-all touch-target"
                style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isValid() ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    color: isValid() ? 'white' : 'var(--text-tertiary)',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    height: '52px',
                    opacity: isValid() ? 1 : 0.6,
                    cursor: isValid() ? 'pointer' : 'not-allowed',
                    boxShadow: isValid() ? '0 4px 14px rgba(59, 130, 246, 0.35)' : 'none',
                }}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center" style={{ gap: 'var(--space-2)' }}>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                    </span>
                ) : (
                    'Create Poll'
                )}
            </button>
        </div>
    );
}

// ========================================
// TOGGLE ROW COMPONENT
// ========================================

function ToggleRow({
    icon,
    label,
    helperOn,
    value,
    onChange,
    color,
    subtle,
    note,
}: {
    icon: string;
    label: string;
    helperOn: string;
    value: boolean;
    onChange: (v: boolean) => void;
    color: string;
    subtle?: boolean;
    note?: string;
}) {
    return (
        <div>
            <button
                onClick={() => onChange(!value)}
                className="flex items-center justify-between w-full touch-target"
                style={{ background: 'none', border: 'none', padding: '2px 0' }}
            >
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="text-base" style={{ opacity: subtle ? 0.6 : 1 }}>{icon}</span>
                    <span className="text-[14px] font-medium" style={{ color: subtle ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {label}
                    </span>
                </div>
                <div
                    className="relative rounded-full transition-colors flex-shrink-0"
                    style={{
                        width: '44px', height: '24px',
                        background: value ? color : 'var(--bg-hover)',
                    }}
                >
                    <div
                        className="absolute rounded-full bg-white shadow transition-transform"
                        style={{
                            width: '20px', height: '20px',
                            top: '2px',
                            transform: value ? 'translateX(22px)' : 'translateX(2px)',
                        }}
                    />
                </div>
            </button>
            {value && (
                <div className="animate-fade-in text-[12px]" style={{ color: 'var(--text-tertiary)', paddingLeft: '28px', marginTop: '2px' }}>
                    {helperOn}
                </div>
            )}
            {note && (
                <div className="animate-fade-in text-[11px]" style={{ color: 'var(--text-tertiary)', paddingLeft: '28px', marginTop: '2px', fontStyle: 'italic' }}>
                    {note}
                </div>
            )}
        </div>
    );
}
