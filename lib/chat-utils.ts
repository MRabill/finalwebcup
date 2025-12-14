/**
 * Dating Chat Utilities
 * Helper functions for chat interface management
 */

import { v4 as uuidv4 } from 'uuid';

export interface ChatSession {
    sessionId: string;
    targetAlias: string;
    targetId?: string;
    createdAt: Date;
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai' | 'system';
    message: string;
    timestamp: Date;
    status?: 'sent' | 'delivered' | 'read' | 'pending';
}

export interface WebhookPayload {
    message: string;
    chatSessionUUIDS: string;
}

export interface WebhookResponse {
    output: string;
    [key: string]: any;
}

/**
 * Create a new chat session
 */
export function createChatSession(targetAlias: string, targetId?: string): ChatSession {
    return {
        sessionId: uuidv4(),
        targetAlias,
        targetId,
        createdAt: new Date(),
        messages: [],
    };
}

/**
 * Create a new message
 */
export function createMessage(
    sender: 'user' | 'ai' | 'system',
    message: string,
    status: 'sent' | 'delivered' | 'read' | 'pending' = 'sent'
): ChatMessage {
    return {
        id: uuidv4(),
        sender,
        message,
        timestamp: new Date(),
        status,
    };
}

/**
 * Format timestamp for display
 */
export function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format timestamp for log
 */
export function formatTimestamp(date: Date): string {
    return date.toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Send message via webhook
 */
export async function sendMessageViaWebhook(
    payload: WebhookPayload,
    webhookUrl: string
): Promise<WebhookResponse> {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: WebhookResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Webhook error:', error);
        throw error;
    }
}

/**
 * Sci-fi status messages for loading states
 */
export const SCI_FI_STATUSES = [
    'scanning...',
    'encrypting...',
    'decrypting...',
    'transmitting...',
    'handshaking...',
    'synchronizing...',
    'buffering...',
    'quantum-linking...',
    'initializing quantum entanglement...',
    'calibrating neural link...',
    'bypassing firewall...',
    'patching security protocol...',
    'hacking defense systems...',
    'loading consciousness...',
    'merging data streams...',
];

/**
 * Get random sci-fi status
 */
export function getRandomStatus(): string {
    return SCI_FI_STATUSES[Math.floor(Math.random() * SCI_FI_STATUSES.length)];
}

/**
 * Get random wait time (6-10 seconds)
 */
export function getRandomWaitTime(): number {
    return 6000 + Math.random() * 4000;
}

/**
 * Format message for display (handle system messages with special formatting)
 */
export function formatMessageDisplay(message: string): string {
    // If it's a system message (starts with [)
    if (message.startsWith('[')) {
        return message;
    }
    // Otherwise return as-is
    return message;
}

/**
 * Check if message is a system message
 */
export function isSystemMessage(message: string): boolean {
    return message.startsWith('[') && message.endsWith(']');
}

/**
 * Get status message based on event type
 */
export function getStatusMessage(type: 'transmitting' | 'decrypting' | 'connecting' | 'accepted'): string {
    const messages = {
        transmitting: '[TRANSMITTING...]',
        decrypting: '[DECRYPTING...]',
        connecting: '[INITIALIZING CONTACT PROTOCOL]',
        accepted: '[TRANSMISSION ACCEPTED]',
    };
    return messages[type];
}

/**
 * Session storage utilities
 */
export const SessionStorage = {
    /**
     * Save session to localStorage
     */
    save(session: ChatSession): void {
        try {
            const key = `chat-session-${session.sessionId}`;
            localStorage.setItem(key, JSON.stringify(session));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    },

    /**
     * Load session from localStorage
     */
    load(sessionId: string): ChatSession | null {
        try {
            const key = `chat-session-${sessionId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load session:', error);
            return null;
        }
    },

    /**
     * Delete session from localStorage
     */
    delete(sessionId: string): void {
        try {
            const key = `chat-session-${sessionId}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    },

    /**
     * Get all sessions
     */
    getAll(): ChatSession[] {
        try {
            const sessions: ChatSession[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('chat-session-')) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        sessions.push(JSON.parse(data));
                    }
                }
            }
            return sessions;
        } catch (error) {
            console.error('Failed to get sessions:', error);
            return [];
        }
    },

    /**
     * Clear all sessions
     */
    clearAll(): void {
        try {
            const keys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('chat-session-')) {
                    keys.push(key);
                }
            }
            keys.forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error('Failed to clear sessions:', error);
        }
    },
};

/**
 * Retry logic for failed requests
 */
export async function retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
            }
        }
    }

    throw lastError;
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for scroll/resize handling
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
