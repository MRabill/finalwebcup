'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
    id: string;
    body: string;
    user_id: string;
    room_id: string;
    inserted_at: string;
    metadata?: Record<string, any>;
    user?: {
        email: string;
    };
}

interface RealtimeChatProps {
    roomId: string;
    userId: string;
}

export function RealtimeChat({ roomId, userId }: RealtimeChatProps) {
    // Guard against missing credentials so static export doesn't break.
    if (!supabase) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border bg-white p-6 text-center text-gray-600">
                Supabase credentials are not configured.
            </div>
        );
    }

    const client = supabase;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const channelRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const loadingTimeoutRef = useRef<NodeJS.Timeout>();

    // Load initial messages
    const loadMessages = async () => {
        try {
            setIsLoadingMessages(true);
            const { data, error } = await client
                .from('messages')
                .select('*')
                .eq('room_id', roomId)
                .order('inserted_at', { ascending: true });

            if (error) {
                console.error('Error loading messages:', error);
                throw error;
            }

            if (data) {
                console.log('Loaded messages:', data.length);
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, [roomId]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!roomId) return;

        console.log('Subscribing to room:', roomId);

        const channel = client
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload: any) => {
                    console.log('New message received:', payload);
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
                setIsConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                client.removeChannel(channelRef.current);
                setIsConnected(false);
            }
        };
    }, [roomId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const messageContent = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            console.log('Sending message:', { roomId, userId, body: messageContent });

            const { data, error } = await client.from('messages').insert([
                {
                    room_id: roomId,
                    user_id: userId,
                    body: messageContent,
                },
            ]).select();

            if (error) {
                console.error('Insert error:', error);
                throw error;
            }

            console.log('Message inserted:', data);

            // Reload messages to ensure we have the latest
            if (data && data.length > 0) {
                setMessages((prev) => [...prev, data[0]]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputValue(messageContent); // Restore message on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className= "flex flex-col h-full max-w-2xl mx-auto w-full" >
        {/* Header */ }
        < div className = "border-b p-4" >
            <div className="flex items-center justify-between" >
                <h2 className="text-lg font-semibold" > Room: { roomId.slice(0, 8) } </h2>
                    < div className = "flex items-center gap-2" >
                        <div className={ `h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'}` } />
                            < span className = "text-sm text-gray-600" >
                                { isConnected? 'Connected': 'Connecting...' }
                                </span>
                                </div>
                                </div>
                                </div>

    {/* Messages */ }
    <div className="flex-1 overflow-y-auto p-4 space-y-4" >
        {
            isLoadingMessages?(
          <div className = "flex items-center justify-center h-full text-gray-500" >
                    <p>Loading messages...</ p >
        </div>
        ) : messages.length === 0 ? (
        <div className= "flex items-center justify-center h-full text-gray-500" >
        <p>No messages yet.Start the conversation! </p>
            </div>
        ) : (
        messages.map((message) => (
            <div key= { message.id } className = "flex gap-3 animate-in fade-in" >
            <Avatar className="h-8 w-8 flex-shrink-0" >
            <AvatarFallback>
            { message.user?.email?.[0]?.toUpperCase() || 'U' }
            </AvatarFallback>
            </Avatar>
        < div className = "flex-1 min-w-0" >
        <div className="flex items-baseline gap-2" >
        <p className="text-sm font-medium" > { message.user?.email || 'Anonymous' } </p>
        < p className = "text-xs text-gray-500" >
        { new Date(message.inserted_at).toLocaleTimeString() }
        </p>
        </div>
        < Card className = "mt-1 p-3 bg-gray-50" >
        <p className="text-sm break-words" > { message.body } </p>
        </Card>
        </div>
        </div>
        ))
        )
}
<div ref={ messagesEndRef } />
    </div>

{/* Input */ }
<form onSubmit={ handleSendMessage } className = "border-t p-4" >
    <div className="flex gap-2" >
        <Input
            value={ inputValue }
onChange = {(e) => setInputValue(e.target.value)}
placeholder = "Type a message..."
disabled = { isLoading || !isConnected}
className = "flex-1"
    />
    <Button type="submit" disabled = { isLoading || !inputValue.trim()}>
        { isLoading? 'Sending...': 'Send' }
        </Button>
        </div>
        </form>
        </div>
  );
}
