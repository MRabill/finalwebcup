/**
 * Dating Chat Interface - Implementation Examples
 * This file demonstrates various ways to use the chat interface
 */

// Example 1: Basic Chat Interface in a Page
// ============================================
/*
import DatingChatInterface from '@/components/dating-chat-interface';

export default function SimpleChatPage() {
    return (
        <div className="h-screen w-full">
            <DatingChatInterface 
                targetAlias="NeonRonin"
                targetAvatar="https://example.com/avatar.jpg"
            />
        </div>
    );
}
*/

// Example 2: Using with Profile Data
// ====================================
/*
import DatingChatInterface from '@/components/dating-chat-interface';

interface ProfileData {
    id: string;
    alias: string;
    avatar_url: string;
}

export default async function ProfileChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Fetch profile data
    const profile: ProfileData = await fetchProfile(id);
    
    return (
        <DatingChatInterface 
            targetAlias={profile.alias}
            targetAvatar={profile.avatar_url}
        />
    );
}
*/

// Example 3: Using Chat Utilities
// ================================
/*
import {
    createChatSession,
    createMessage,
    sendMessageViaWebhook,
    SessionStorage,
    getRandomWaitTime,
    SCI_FI_STATUSES
} from '@/lib/chat-utils';

// Create a new session
const session = createChatSession('NeonRonin', 'profile-id-123');

// Add a message
const userMessage = createMessage('user', 'Hello, are you there?');
session.messages.push(userMessage);

// Save session
SessionStorage.save(session);

// Send message via webhook
const response = await sendMessageViaWebhook(
    {
        message: 'Hello, are you there?',
        chatSessionUUIDS: session.sessionId
    },
    'https://mrabeel.app.n8n.cloud/webhook/...'
);

// Get AI response
const aiMessage = createMessage('ai', response.output);
session.messages.push(aiMessage);
SessionStorage.save(session);

// Get random statuses for loading UI
const statuses = SCI_FI_STATUSES;
const randomWait = getRandomWaitTime(); // 6-10 seconds
*/

// Example 4: Integration with Existing Profile Page
// ==================================================
/*
'use client';

import { useState } from 'react';
import DatingChatInterface from '@/components/dating-chat-interface';
import ProfileView from '@/components/profile-view';

interface ProfileData {
    id: string;
    alias: string;
    avatar_url: string;
    // ... other profile fields
}

export default function ProfilePage({ profile }: { profile: ProfileData }) {
    const [showChat, setShowChat] = useState(false);
    
    return (
        <div>
            {showChat ? (
                <DatingChatInterface 
                    targetAlias={profile.alias}
                    targetAvatar={profile.avatar_url}
                />
            ) : (
                <>
                    <ProfileView profile={profile} />
                    <button 
                        onClick={() => setShowChat(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Start Chat
                    </button>
                </>
            )}
        </div>
    );
}
*/

// Example 5: Advanced - Custom Hook for Chat Logic
// =================================================
/*
import { useState, useCallback } from 'react';
import { 
    createChatSession, 
    createMessage, 
    sendMessageViaWebhook,
    SessionStorage,
    retryRequest
} from '@/lib/chat-utils';

export function useChatSession(targetAlias: string, targetId?: string) {
    const [session, setSession] = useState(() => 
        createChatSession(targetAlias, targetId)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (messageText: string, webhookUrl: string) => {
            setLoading(true);
            setError(null);

            try {
                // Add user message
                const userMsg = createMessage('user', messageText);
                session.messages.push(userMsg);
                setSession({ ...session });

                // Send via webhook with retry
                const response = await retryRequest(
                    () => sendMessageViaWebhook(
                        {
                            message: messageText,
                            chatSessionUUIDS: session.sessionId
                        },
                        webhookUrl
                    )
                );

                // Add AI response
                const aiMsg = createMessage('ai', response.output);
                session.messages.push(aiMsg);
                setSession({ ...session });

                // Save to localStorage
                SessionStorage.save(session);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMsg);
                
                // Add error message
                const errorMsg_obj = createMessage(
                    'system',
                    '[ERROR]\n\nConnection interrupted. Quantum link compromised.'
                );
                session.messages.push(errorMsg_obj);
                setSession({ ...session });
            } finally {
                setLoading(false);
            }
        },
        [session]
    );

    const clearSession = useCallback(() => {
        SessionStorage.delete(session.sessionId);
        const newSession = createChatSession(targetAlias, targetId);
        setSession(newSession);
    }, [targetAlias, targetId, session.sessionId]);

    return {
        session,
        loading,
        error,
        sendMessage,
        clearSession,
    };
}

// Usage:
// const { session, sendMessage, loading } = useChatSession('NeonRonin');
// await sendMessage('Hello!', webhookUrl);
*/

// Example 6: Session Persistence
// ===============================
/*
import { SessionStorage } from '@/lib/chat-utils';

// Get all active sessions
const allSessions = SessionStorage.getAll();
console.log(`Active sessions: ${allSessions.length}`);

// Load a specific session
const session = SessionStorage.load('session-uuid-here');

// Save session
SessionStorage.save(session);

// Delete session
SessionStorage.delete('session-uuid-here');

// Clear all sessions
SessionStorage.clearAll();
*/

// Example 7: Webhook Integration Testing
// =======================================
/*
import { sendMessageViaWebhook, retryRequest } from '@/lib/chat-utils';

// Test single request
const response = await sendMessageViaWebhook(
    {
        message: 'Test message',
        chatSessionUUIDS: 'test-session-uuid'
    },
    'https://mrabeel.app.n8n.cloud/webhook/...'
);

// Test with retry logic (up to 3 attempts)
const responseWithRetry = await retryRequest(
    () => sendMessageViaWebhook(
        {
            message: 'Test message',
            chatSessionUUIDS: 'test-session-uuid'
        },
        'https://mrabeel.app.n8n.cloud/webhook/...'
    ),
    3, // max retries
    1000 // delay in ms
);
*/

// Example 8: Complete Chat Flow
// ==============================
/*
'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    createMessage,
    sendMessageViaWebhook,
    getStatusMessage,
    SCI_FI_STATUSES
} from '@/lib/chat-utils';

export default function CompleteChat({ targetAlias }: { targetAlias: string }) {
    const sessionId = useRef(uuidv4()).current;
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatState, setChatState] = useState<'idle' | 'waiting' | 'active'>('idle');

    const handleInvite = () => {
        setChatState('waiting');
        
        // Simulate wait
        setTimeout(() => {
            setChatState('active');
            setMessages([
                createMessage('system', `[CONNECTED TO ${targetAlias.toUpperCase()}]`)
            ]);
        }, Math.random() * 4000 + 6000);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const msgText = inputValue.trim();
        setInputValue('');
        setIsLoading(true);

        // Add user message
        setMessages(prev => [
            ...prev,
            createMessage('user', msgText)
        ]);

        // Add transmitting status
        setMessages(prev => [
            ...prev,
            createMessage('system', getStatusMessage('transmitting'))
        ]);

        try {
            const response = await sendMessageViaWebhook(
                {
                    message: msgText,
                    chatSessionUUIDS: sessionId
                },
                'https://mrabeel.app.n8n.cloud/webhook/...'
            );

            // Remove transmitting, add decrypting
            setMessages(prev => 
                prev.filter(m => m.message !== getStatusMessage('transmitting'))
            );
            
            setMessages(prev => [
                ...prev,
                createMessage('system', getStatusMessage('decrypting'))
            ]);

            // Simulate decryption time
            setTimeout(() => {
                setMessages(prev => 
                    prev.filter(m => m.message !== getStatusMessage('decrypting'))
                );
                
                setMessages(prev => [
                    ...prev,
                    createMessage('ai', response.output)
                ]);
                
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [
                ...prev,
                createMessage('system', '[ERROR]\n\nConnection lost')
            ]);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0e27]">
            {/* Header */}
<div className="border-b border-cyan-500/30 px-6 py-4" >
    <div className="text-cyan-400 font-bold uppercase" > { targetAlias } </div>
        </div>

{/* Messages */ }
<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" >
{
    messages.map((msg) => (
        <div 
                        key= { msg.id }
                        className = { msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start' }
        >
        <div className={
            msg.sender === 'user'
                ? 'bg-cyan-900/40 border border-cyan-400/50 text-cyan-100 px-4 py-3 rounded max-w-xs'
                : 'bg-magenta-900/30 border border-magenta-400/50 text-magenta-100 px-4 py-3 rounded max-w-xs'
        } >
        { msg.message }
        </div>
    </div>
    ))
}
    </div>

{/* Input */ }
<div className="border-t border-cyan-500/30 px-6 py-4" >
    { chatState === 'idle' ? (
        <button 
                        onClick= { handleInvite }
                        className = "w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded"
    >
    Send Invite
        </button>
                ) : chatState === 'waiting' ? (
    <div className= "text-center text-gray-400" > Waiting for response...</div>
                ) : (
    <div className= "flex gap-3" >
    <input
                            type="text"
value = { inputValue }
onChange = {(e) => setInputValue(e.target.value)}
onKeyPress = {(e) => e.key === 'Enter' && handleSendMessage()}
placeholder = "Type message..."
className = "flex-1 bg-gray-900 border border-cyan-400/30 rounded px-4 py-3 text-gray-100 placeholder-gray-500"
    />
    <button
                            onClick={ handleSendMessage }
disabled = {!inputValue.trim() || isLoading}
className = "bg-magenta-600 hover:bg-magenta-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
    >
    Send
    </button>
    </div>
                )}
</div>
    </div>
    );
}
*/

export default {};
