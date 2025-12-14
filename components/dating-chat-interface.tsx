'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Trash2 } from 'lucide-react';
import './dating-chat.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    message: string;
    timestamp: Date;
}

interface DatingChatInterfaceProps {
    targetAlias: string;
    targetAvatar?: string;
    onClose?: () => void;
}

const WEBHOOK_URL = 'https://mrabeel.app.n8n.cloud/webhook/e152d4ad-78ed-4b42-893e-4a49373882ad';

const sciTechStatuses = [
    'scanning...',
    'encrypting...',
    'decrypting...',
    'transmitting...',
    'handshaking...',
    'synchronizing...',
    'buffering...',
    'quantum-linking...',
];

export default function DatingChatInterface({ targetAlias, targetAvatar, onClose }: DatingChatInterfaceProps) {
    const [chatSessionUUID] = useState(() => uuidv4());
    const [chatState, setChatState] = useState<'idle' | 'inviting' | 'waiting' | 'active' | 'error'>('idle');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [waitingTime, setWaitingTime] = useState(0);
    const [currentStatus, setCurrentStatus] = useState('scanning...');
    const [statusIndex, setStatusIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Status animation cycling
    useEffect(() => {
        if (chatState !== 'waiting') return;

        const statusInterval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % sciTechStatuses.length);
            setCurrentStatus(sciTechStatuses[(statusIndex + 1) % sciTechStatuses.length]);
        }, 400);

        return () => clearInterval(statusInterval);
    }, [chatState, statusIndex]);

    // Waiting room timer
    useEffect(() => {
        if (chatState !== 'waiting') return;

        const startTime = Date.now();
        const acceptTime = 6000 + Math.random() * 4000; // 6-10 seconds

        const timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setWaitingTime(Math.floor(elapsed / 100) / 10);

            if (elapsed >= acceptTime) {
                clearInterval(timerInterval);
                setChatState('active');
                // Add system message
                setMessages((prev) => [
                    ...prev,
                    {
                        id: uuidv4(),
                        sender: 'ai',
                        message: `[TRANSMISSION ACCEPTED]\n\nAh, greetings, lifeform. I am ${targetAlias}. The encrypted channel is now open.`,
                        timestamp: new Date(),
                    },
                ]);
            }
        }, 100);

        return () => clearInterval(timerInterval);
    }, [chatState, targetAlias]);

    const handleInvite = () => {
        setChatState('inviting');
        setTimeout(() => {
            setChatState('waiting');
            setWaitingTime(0);
            setStatusIndex(0);
            // Add invite message
            setMessages([
                {
                    id: uuidv4(),
                    sender: 'user',
                    message: `[INITIATING CONTACT PROTOCOL]\n\nSending invite to ${targetAlias}...`,
                    timestamp: new Date(),
                },
            ]);
        }, 500);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || chatState !== 'active') return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const userMsg: ChatMessage = {
            id: uuidv4(),
            sender: 'user',
            message: userMessage,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        // Add transmission status
        setMessages((prev) => [
            ...prev,
            {
                id: uuidv4(),
                sender: 'user',
                message: '[TRANSMITTING...]',
                timestamp: new Date(),
            },
        ]);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    chatSessionUUIDS: chatSessionUUID,
                }),
            });

            console.log('Webhook response:', response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response has content
            const responseText = await response.text();
            console.log('Webhook response text:', responseText);
            console.log('Response text length:', responseText.length);

            if (!responseText) {
                throw new Error('Empty response from server');
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed webhook response:', data);
            } catch (parseError) {
                console.error('Failed to parse response:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            // Remove transmission status message
            setMessages((prev) => prev.filter((m) => m.message !== '[TRANSMITTING...]'));

            // Add decryption status
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    sender: 'ai',
                    message: '[DECRYPTING...]',
                    timestamp: new Date(),
                },
            ]);

            // Simulate decryption time
            setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m.message !== '[DECRYPTING...]'));
                const aiMsg: ChatMessage = {
                    id: uuidv4(),
                    sender: 'ai',
                    message: data.output || 'Signal lost. Try again.',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMsg]);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => prev.filter((m) => m.message !== '[TRANSMITTING...]'));
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    sender: 'ai',
                    message: '[ERROR]\n\nConnection interrupted. Quantum link compromised.',
                    timestamp: new Date(),
                },
            ]);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34,211,238,0.12) 25%, rgba(34,211,238,0.12) 26%, transparent 27%, transparent 74%, rgba(34,211,238,0.12) 75%, rgba(34,211,238,0.12) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(236,72,153,0.12) 25%, rgba(236,72,153,0.12) 26%, transparent 27%, transparent 74%, rgba(236,72,153,0.12) 75%, rgba(236,72,153,0.12) 76%, transparent 77%, transparent)`,
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_55%)]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between border-b border-cyan-500/30 px-6 py-4 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-orbitron text-lg font-semibold tracking-[0.25em] text-cyan-300 uppercase">
                            {targetAlias}
                        </div>
                        <p className="font-sarpanch text-xs uppercase tracking-[0.25em] text-slate-400">
                            [STATUS: {chatState === 'active' ? 'CONNECTED' : 'INITIALIZING'}]
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-lime-300">
                        {chatState === 'active' ? 'online' : 'initializing'}
                    </span>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-full border border-fuchsia-500/60 bg-transparent px-3 py-1 text-xs font-sarpanch uppercase tracking-[0.22em] text-fuchsia-300 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 transition-all"
                            title="Close chat"
                        >
                            close
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Area or Waiting Room */}
            <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
                {chatState === 'idle' || chatState === 'inviting' ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="font-sarpanch text-base text-slate-500 mb-4">
                                // READY FOR CONTACT
                            </p>
                            <p className="max-w-sm text-sm font-sarpanch uppercase tracking-[0.22em] text-cyan-500/70">
                                send an invite to initiate encrypted channel with {targetAlias}
                            </p>
                        </div>
                    </div>
                ) : chatState === 'waiting' ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <div className="absolute w-32 h-32 border-2 border-cyan-500 rounded-full animate-spin"
                                style={{ animationDuration: '3s' }}>
                            </div>
                            <div className="absolute w-24 h-24 border-2 border-magenta-500 rounded-full animate-spin"
                                style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 border border-cyan-400 rounded-full opacity-40 animate-pulse" />
                            </div>
                            <div className="relative z-10 text-cyan-400 font-bold text-3xl">
                                {waitingTime.toFixed(1)}s
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-cyan-400 text-sm font-mono uppercase tracking-wider mb-2">
                                {currentStatus}
                            </div>
                            <div className="text-gray-400 text-xs">Waiting for acceptance...</div>
                        </div>
                        <div className="w-full max-w-xs h-1 bg-gray-700 rounded overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-100"
                                style={{ width: `${Math.min((waitingTime / 10) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
                        <div
                            className="flex-1 rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-4 py-4 md:px-5 md:py-5 shadow-inner shadow-cyan-500/15 flex flex-col"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
                                    <p className="font-sarpanch text-base text-slate-500">
                        // NO TRANSMISSIONS YET
                                    </p>
                                    <p className="max-w-sm text-sm font-sarpanch uppercase tracking-[0.22em] text-cyan-500/70">
                                        type your first message below to begin encrypted conversation
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => {
                                        const textContent = message.message;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`flex max-w-[85%] flex-col space-y-3 md:max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                                                >
                                                    {textContent && (
                                                        <div
                                                            className={`relative rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-[0_0_20px_rgba(15,23,42,0.9)] backdrop-blur-md ${message.sender === 'user'
                                                                ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
                                                                : 'border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-100'
                                                                }`}
                                                        >
                                                            {!message.sender && (
                                                                <span className="mb-1 inline-block font-sarpanch text-xs uppercase tracking-[0.24em] text-fuchsia-200/80">
                                    // {targetAlias}
                                                                </span>
                                                            )}

                                                            <p className={!message.sender ? "font-russo-one text-sm" : ""}>
                                                                {textContent}
                                                            </p>

                                                            <div className="mt-2 flex items-center justify-end gap-2 text-xs font-sarpanch uppercase tracking-[0.18em] text-slate-400">
                                                                <span className="h-[3px] w-8 bg-gradient-to-r from-transparent via-slate-500/70 to-transparent" />
                                                                <span>
                                                                    {message.timestamp.toLocaleTimeString()}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={`pointer-events-none absolute inset-0 rounded-xl border border-transparent ${message.sender === 'user'
                                                                    ? 'shadow-[0_0_25px_rgba(34,211,238,0.65)]'
                                                                    : 'shadow-[0_0_25px_rgba(236,72,153,0.65)]'
                                                                    } opacity-30`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex items-center gap-3 rounded-xl border border-fuchsia-400/60 bg-fuchsia-500/10 px-4 py-2 text-sm font-sarpanch uppercase tracking-[0.24em] text-fuchsia-100 shadow-[0_0_20px_rgba(236,72,153,0.45)]">
                                                <span className="h-2 w-2 animate-ping rounded-full bg-fuchsia-300" />
                                                <span>processing quantum stream</span>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Input Area */}
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
            }} className="relative z-10 border-t border-cyan-500/30 px-6 py-4 bg-black/20 backdrop-blur-sm space-y-2">
                {chatState === 'idle' || chatState === 'inviting' ? (
                    <button
                        type="button"
                        onClick={handleInvite}
                        disabled={chatState === 'inviting'}
                        className={`w-full py-3 px-6 font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${chatState === 'inviting'
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {chatState === 'inviting' ? 'Sending Invite...' : `Send Invite to ${targetAlias}`}
                    </button>
                ) : chatState === 'waiting' ? null : (
                    <div className="group rounded-2xl border border-cyan-500/40 bg-slate-950/80 px-3 py-2 shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300 focus-within:border-cyan-300 focus-within:shadow-[0_0_45px_rgba(34,211,238,0.7)]">
                        <div className="flex items-center gap-2 px-1">
                            <Input
                                type="text"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={isLoading}
                                className="h-10 flex-1 border-0 bg-transparent text-base text-cyan-100 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />

                            {/* Icons on the right */}
                            <div className="flex items-center gap-1">
                                {/* Send */}
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="h-9 w-9 font-orbitron bg-cyan-400 text-xs font-semibold tracking-[0.28em] text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                                    title="Transmit"
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                </Button>

                                {/* Clear / purge log */}
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={() => {
                                        setMessages([]);
                                        setInputValue('');
                                    }}
                                    className="h-9 w-9 border border-fuchsia-500/60 bg-transparent text-xs font-orbitron tracking-[0.2em] text-fuchsia-300 hover:border-fuchsia-400 hover:bg-fuchsia-500/10"
                                    title="Purge log"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
