'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                className="fixed top-4 left-0 right-0 flex flex-col items-center pointer-events-none"
                style={{ zIndex: 9999, gap: '8px' }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="animate-slide-down shadow-lg pointer-events-auto flex items-center"
                        style={{
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${toast.type === 'error' ? 'var(--accent-red)' :
                                    toast.type === 'success' ? 'var(--accent-green)' :
                                        'var(--border-default)'
                                }`,
                            color: 'var(--text-primary)',
                            maxWidth: '90%',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    >
                        {toast.type === 'success' && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                        {toast.type === 'error' && <span style={{ color: 'var(--accent-red)' }}>✕</span>}
                        {toast.type === 'info' && <span style={{ color: 'var(--accent-blue)' }}>ℹ</span>}
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
