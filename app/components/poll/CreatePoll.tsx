'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface CreatePollProps {
    onSubmit: (poll: {
        question: string;
        options: { id: string; text: string }[];
        poll_type: string;
        is_anonymous: boolean;
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addOption = () => {
        if (options.length < 6) setOptions([...options, '']);
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
            expires_at: expiresAt,
            is_onchain: isOnchain,
        });

        setIsSubmitting(false);
    };

    const pollTypes = [
        { id: 'standard', label: 'Standard', icon: '📊', desc: 'Multiple choice' },
        { id: 'this_or_that', label: 'This or That', icon: '⚡', desc: 'Binary choice' },
        { id: 'rating', label: 'Rating', icon: '⭐', desc: 'Scale 1-5' },
    ];

    const expiryOptions = [
        { value: 1, label: '1 hour' },
        { value: 6, label: '6 hours' },
        { value: 24, label: '24 hours' },
        { value: 72, label: '3 days' },
        { value: null, label: 'No limit' },
    ];

    return (
        <div className="space-y-5">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s === step
                                    ? 'bg-accent text-white scale-110'
                                    : s < step
                                        ? 'bg-success/20 text-success'
                                        : 'bg-foreground/5 text-muted'
                                }`}
                        >
                            {s < step ? '✓' : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-8 h-0.5 ${s < step ? 'bg-success/40' : 'bg-foreground/10'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Question */}
            {step === 1 && (
                <div className="animate-fade-in space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted mb-2 block">Your question</label>
                        <textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="What do you want to ask?"
                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none text-base"
                            rows={3}
                            maxLength={280}
                            autoFocus
                        />
                        <div className="text-right text-xs text-muted mt-1">{question.length}/280</div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted mb-2 block">Poll type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {pollTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setPollType(type.id);
                                        if (type.id === 'this_or_that') setOptions(['', '']);
                                    }}
                                    className={`p-3 rounded-xl border text-center transition-all ${pollType === type.id
                                            ? 'border-accent bg-accent/10 scale-[1.02]'
                                            : 'border-border bg-foreground/5 hover:border-foreground/20'
                                        }`}
                                >
                                    <div className="text-xl mb-1">{type.icon}</div>
                                    <div className="text-xs font-medium">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Options */}
            {step === 2 && (
                <div className="animate-fade-in space-y-3">
                    <label className="text-sm font-medium text-muted mb-2 block">Answer options</label>
                    {options.map((option, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {String.fromCharCode(65 + i)}
                            </div>
                            <input
                                value={option}
                                onChange={e => updateOption(i, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className="flex-1 bg-foreground/5 border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 text-sm"
                                maxLength={100}
                            />
                            {options.length > 2 && (
                                <button
                                    onClick={() => removeOption(i)}
                                    className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors flex-shrink-0"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {options.length < 6 && pollType !== 'this_or_that' && (
                        <button
                            onClick={addOption}
                            className="w-full py-2.5 rounded-xl border border-dashed border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
                        >
                            + Add option
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
                <div className="animate-fade-in space-y-4">
                    {/* Duration */}
                    <div>
                        <label className="text-sm font-medium text-muted mb-2 block">Duration</label>
                        <div className="flex flex-wrap gap-2">
                            {expiryOptions.map(opt => (
                                <button
                                    key={String(opt.value)}
                                    onClick={() => setExpiryHours(opt.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${expiryHours === opt.value
                                            ? 'bg-accent text-white'
                                            : 'bg-foreground/5 text-muted hover:bg-foreground/10'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <span className="text-sm font-medium">Anonymous voting</span>
                                <p className="text-xs text-muted">Hide voter identities</p>
                            </div>
                            <div
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                className={`w-11 h-6 rounded-full relative transition-colors ${isAnonymous ? 'bg-accent' : 'bg-foreground/10'
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                                        }`}
                                />
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <span className="text-sm font-medium">Save on-chain</span>
                                <p className="text-xs text-muted">Record results on Base (optional)</p>
                            </div>
                            <div
                                onClick={() => setIsOnchain(!isOnchain)}
                                className={`w-11 h-6 rounded-full relative transition-colors ${isOnchain ? 'bg-accent' : 'bg-foreground/10'
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${isOnchain ? 'translate-x-5' : 'translate-x-0.5'
                                        }`}
                                />
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex-1 py-3 rounded-xl border border-border text-muted font-medium hover:bg-foreground/5 transition-colors"
                    >
                        Back
                    </button>
                )}
                {onClose && step === 1 && (
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-border text-muted font-medium hover:bg-foreground/5 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!isStepValid()}
                        className="flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            background: isStepValid() ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)',
                        }}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl font-bold text-white transition-all animate-pulse-glow"
                        style={{ background: 'var(--accent-gradient)' }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </span>
                        ) : (
                            '🚀 Create Poll'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
