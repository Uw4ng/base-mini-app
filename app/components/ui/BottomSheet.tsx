'use client';

import { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);
    const startY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 0) setDragY(dy);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragY > 100) {
            onClose();
        }
        setDragY(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 overlay animate-fade-in"
                onClick={onClose}
                role="button"
                aria-label="Close bottom sheet"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 animate-slide-up flex flex-col"
                style={{
                    maxHeight: '90vh',
                    background: 'var(--bg-secondary)',
                    borderTopLeftRadius: 'var(--radius-lg)',
                    borderTopRightRadius: 'var(--radius-lg)',
                    transform: `translateY(${dragY}px)`,
                    transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                    <div
                        className="rounded-full"
                        style={{
                            width: '36px',
                            height: '4px',
                            background: 'var(--border-default)',
                        }}
                    />
                </div>

                {/* Header */}
                {title && (
                    <div
                        className="flex items-center justify-between px-5 pb-3"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                        <h2 className="text-[18px] font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="touch-target flex items-center justify-center rounded-full transition-colors"
                            style={{ width: '32px', height: '32px', background: 'var(--bg-tertiary)' }}
                            aria-label="Close"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-5)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
