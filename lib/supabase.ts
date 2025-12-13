import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to room messages
export function subscribeToRoom(roomId: string, onMessage: (payload: any) => void) {
    const topic = `room:${roomId}:messages`;
    const channel = supabase.channel(topic, { config: { private: true } });

    channel
        .on('broadcast', { event: 'INSERT' }, (payload) => {
            // payload will be the broadcasted row
            onMessage(payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscribed to', topic);
            }
        });

    return channel;
}

// Send a broadcast (client-side)
export async function sendMessage(roomId: string, body: string, metadata: Record<string, any> = {}) {
    // Preferred: insert into messages table (DB trigger will broadcast)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const { error } = await supabase.from('messages').insert([{ room_id: roomId, user_id: userId, body, metadata }]);
    if (error) {
        console.error(error);
        throw error;
    }
}

// Cleanup
export function unsubscribe(channel: any) {
    if (!channel) return;
    supabase.removeChannel(channel);
}
