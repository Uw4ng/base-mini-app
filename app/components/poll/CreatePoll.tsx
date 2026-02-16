'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface CreatePollProps {
    onSubmit: (poll: {
        question: string;
        options: { id: string; text: string }[];
        poll_type: string;
        is_anonymous: boolean;
        is_prediction: boolean;
        expires_at: string | null;
        is_onchain: boolean;
    }) => void;
    onClose?: () => void;
}

export default function CreatePoll({ onSubmit, onClose }: CreatePollProps) {
    const [step, setStep] = useState(1);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [pollType, setPollType] = useState('standard');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [expiryHours, setExpiryHours] = useState<number | null>(24);
    const [isOnchain, setIsOnchain] = useState(false);
    const [isPrediction, setIsPrediction] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addOption = () => {
        if (options.length < 4) setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const isStepValid = () => {
        if (step === 1) return question.trim().length >= 3;
        if (step === 2) return options.filter(o => o.trim()).length >= 2;
        return true;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const pollOptions = options
            .filter(o => o.trim())
            .map(text => ({ id: uuidv4(), text: text.trim() }));

        const expiresAt = expiryHours
            ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
            : null;

        onSubmit({
            question: question.trim(),
            options: pollOptions,
            poll_type: pollType,
            is_anonymous: isAnonymous,
            is_prediction: isPrediction,
            expires_at: expiresAt,
            is_onchain: isOnchain,
        });

        setIsSubmitting(false);
    };

    const pollTypes = [
        { id: 'standard', label: 'Standard', icon: '📊' },
        { id: 'image', label: 'Image', icon: '🖼️' },
        { id: 'this_or_that', label: 'This or That', icon: '⚡' },
        { id: 'rating', label: 'Rating', icon: '⭐' },
    ];

    const expiryOptions = [
        { value: 1, label: '1h' },
        { value: 6, label: '6h' },
        { value: 24, label: '24h' },
        { value: 72, label: '3d' },
        { value: null, label: '∞' },
    ];

    return (
        <div className="flex flex-col" style={{ gap: 'var(--space-5)' }}>
            {/* Step indicator */}
            <div className="flex items-center justify-center" style={{ gap: 'var(--space-2)' }}>
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                        <div
                            className="flex items-center justify-center rounded-full text-[13px] font-semibold transition-all"
                            style={{
                                width: '28px',
                                height: '28px',
                                background: s === step ? 'var(--accent-blue)' : s < step ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                                color: s <= step ? 'white' : 'var(--text-tertiary)',
                            }}
                        >
                            {s < step ? '✓' : s}
                        </div>
                        {s < 3 && (
                            <div
                                style={{
                                    width: '24px',
                                    height: '2px',
                                    background: s < step ? 'var(--accent-green)' : 'var(--border-subtle)',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Question + Type */}
            {step === 1 && (
                <div className="animate-fade-in flex flex-col" style={{ gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-metadata block" style={{ marginBottom: 'var(--space-2)' }}>Your question</label>
                        <textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ask anything..."
                            className="w-full text-[18px] font-medium focus:outline-none resize-none placeholder:text-tertiary"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-4)',
                                color: 'var(--text-primary)',
                                minHeight: '96px',
                            }}
                            rows={3}
                            maxLength={280}
                            autoFocus
                            onFocus={(e) => {
                                const el = e.target as HTMLTextAreaElement;
                                el.style.borderColor = 'var(--border-focus)';
                            }}
                            onBlur={(e) => {
                                const el = e.target as HTMLTextAreaElement;
                                el.style.borderColor = 'var(--border-subtle)';
                            }}
                        />
                        <div className="text-right text-metadata" style={{ marginTop: 'var(--space-1)' }}>
                            {question.length}/280
                        </div>
                    </div>

                    {/* Poll type — horizontal pill tabs */}
                    <div>
                        <label className="text-metadata block" style={{ marginBottom: 'var(--space-2)' }}>Poll type</label>
                        <div className="flex" style={{ gap: 'var(--space-2)' }}>
                            {pollTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setPollType(type.id);
                                        if (type.id === 'this_or_that') setOptions(['', '']);
                                    }}
                                    className="flex items-center touch-target transition-all"
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        gap: 'var(--space-1)',
                                        background: pollType === type.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                        color: pollType === type.id ? 'white' : 'var(--text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        border: 'none',
                                    }}
                                >
                                    <span>{type.icon}</span>
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Options */}
            {step === 2 && (
                <div className="animate-fade-in flex flex-col" style={{ gap: 'var(--space-3)' }}>
                    <label className="text-metadata">Answer options</label>
                    {options.map((option, i) => (
                        <div key={i} className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                            <input
                                value={option}
                                onChange={e => updateOption(i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 text-option focus:outline-none"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px 16px',
                                    color: 'var(--text-primary)',
                                    minHeight: '48px',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                maxLength={100}
                            />
                            {options.length > 2 && (
                                <button
                                    onClick={() => removeOption(i)}
                                    className="touch-target flex items-center justify-center rounded-full transition-colors"
                                    style={{
                                        width: '36px', height: '36px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--accent-red)',
                                    }}
                                    aria-label={`Remove option ${String.fromCharCode(65 + i)}`}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {options.length < 4 && pollType !== 'this_or_that' && (
                        <button
                            onClick={addOption}
                            className="text-metadata w-full transition-colors touch-target"
                            style={{
                                border: '1px dashed var(--border-default)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '12px',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            + Add option
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
                <div className="animate-fade-in flex flex-col" style={{ gap: 'var(--space-4)' }}>
                    {/* Timer selector */}
                    <div>
                        <label className="text-metadata block" style={{ marginBottom: 'var(--space-2)' }}>Duration</label>
                        <div className="flex" style={{ gap: 'var(--space-2)' }}>
                            {expiryOptions.map(opt => (
                                <button
                                    key={String(opt.value)}
                                    onClick={() => setExpiryHours(opt.value)}
                                    className="transition-all touch-target"
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        background: expiryHours === opt.value ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                        color: expiryHours === opt.value ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggle row */}
                    <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
                        {/* Anonymous */}
                        <button
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className="flex items-center justify-between touch-target w-full"
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                            }}
                        >
                            <div className="text-left">
                                <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Anonymous</div>
                                <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Hide voter identities</div>
                            </div>
                            <div
                                className="relative rounded-full transition-colors"
                                style={{
                                    width: '44px', height: '24px',
                                    background: isAnonymous ? 'var(--accent-blue)' : 'var(--bg-hover)',
                                }}
                            >
                                <div
                                    className="absolute rounded-full bg-white shadow transition-transform"
                                    style={{
                                        width: '20px', height: '20px',
                                        top: '2px',
                                        transform: isAnonymous ? 'translateX(22px)' : 'translateX(2px)',
                                    }}
                                />
                            </div>
                        </button>

                        {/* On-chain */}
                        <button
                            onClick={() => setIsOnchain(!isOnchain)}
                            className="flex items-center justify-between touch-target w-full"
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                            }}
                        >
                            <div className="text-left">
                                <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Save on-chain</div>
                                <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Record results on Base</div>
                            </div>
                            <div
                                className="relative rounded-full transition-colors"
                                style={{
                                    width: '44px', height: '24px',
                                    background: isOnchain ? 'var(--accent-purple)' : 'var(--bg-hover)',
                                }}
                            >
                                <div
                                    className="absolute rounded-full bg-white shadow transition-transform"
                                    style={{
                                        width: '20px', height: '20px',
                                        top: '2px',
                                        transform: isOnchain ? 'translateX(22px)' : 'translateX(2px)',
                                    }}
                                />
                            </div>
                        </button>

                        {/* Prediction mode */}
                        <button
                            onClick={() => setIsPrediction(!isPrediction)}
                            className="flex items-center justify-between touch-target w-full"
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                            }}
                        >
                            <div className="text-left">
                                <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>🎯 Prediction mode</div>
                                <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Players guess the majority pick</div>
                            </div>
                            <div
                                className="relative rounded-full transition-colors"
                                style={{
                                    width: '44px', height: '24px',
                                    background: isPrediction ? 'var(--accent-orange)' : 'var(--bg-hover)',
                                }}
                            >
                                <div
                                    className="absolute rounded-full bg-white shadow transition-transform"
                                    style={{
                                        width: '20px', height: '20px',
                                        top: '2px',
                                        transform: isPrediction ? 'translateX(22px)' : 'translateX(2px)',
                                    }}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex" style={{ gap: 'var(--space-3)' }}>
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex-1 text-button touch-target transition-colors"
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Back
                    </button>
                )}
                {onClose && step === 1 && (
                    <button
                        onClick={onClose}
                        className="flex-1 text-button touch-target transition-colors"
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Cancel
                    </button>
                )}
                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!isStepValid()}
                        className="flex-1 text-button touch-target transition-all"
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            background: isStepValid() ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                            color: isStepValid() ? 'white' : 'var(--text-tertiary)',
                            border: 'none',
                            opacity: isStepValid() ? 1 : 0.5,
                            cursor: isStepValid() ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 text-button touch-target transition-all animate-pulse-glow"
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            border: 'none',
                            height: '48px',
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
                )}
            </div>
        </div>
    );
}
