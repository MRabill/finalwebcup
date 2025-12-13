'use client';

import { useEffect, useState } from 'react';
import { RealtimeChat } from '@/components/realtime-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Room {
    id: string;
    name: string;
    inserted_at: string;
}

// Generate or retrieve a unique anonymous user ID
function getAnonymousUserId(): string {
    if (typeof window === 'undefined') return '';

    const storageName = 'anon_user_id';
    let userId = localStorage.getItem(storageName);

    if (!userId) {
        // Generate a random UUID
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        localStorage.setItem(storageName, userId);
    }

    return userId;
}

export default function RealtimePage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [newRoomName, setNewRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [userId, setUserId] = useState<string>('');

    // Initialize anonymous user ID
    useEffect(() => {
        setUserId(getAnonymousUserId());
    }, []);

    // Load rooms on mount
    useEffect(() => {
        const loadRooms = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .order('inserted_at', { ascending: false });

                if (error) throw error;
                if (data && data.length > 0) {
                    setRooms(data);
                    setSelectedRoomId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load rooms:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, []);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;

        setIsCreating(true);
        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert([{ name: newRoomName, created_by: userId }])
                .select();

            if (error) throw error;
            if (data && data[0]) {
                setRooms([data[0], ...rooms]);
                setSelectedRoomId(data[0].id);
                setNewRoomName('');
            }
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <main className= "min-h-screen bg-gray-50 p-4" >
        <div className="max-w-6xl mx-auto" >
            {/* Header */ }
            < div className = "mb-8" >
                <h1 className="text-4xl font-bold mb-2" > Realtime Chat </h1>
                    < p className = "text-gray-600" > Connect and chat with others in real - time </p>
          { userId && <p className="text-xs text-gray-500 mt-2" > User ID: { userId } </p> }
    </div>

    {
        isLoading ? (
            <div className= "flex items-center justify-center h-96" >
            <p className="text-gray-500" > Loading rooms...</p>
                </div>
        ) : (
            <div className= "grid grid-cols-1 lg:grid-cols-4 gap-6" >
            {/* Sidebar */ }
            < div className = "lg:col-span-1 space-y-4" >
                {/* Create Room */ }
                < Card className = "p-4" >
                    <h3 className="font-semibold mb-3" > Create Room </h3>
                        < div className = "space-y-2" >
                            <Input
                    placeholder="Room name"
        value = { newRoomName }
        onChange = {(e) => setNewRoomName(e.target.value)
    }
    onKeyDown = {(e) => {
        if (e.key === 'Enter') handleCreateRoom();
    }
}
                  />
    < Button
onClick = { handleCreateRoom }
className = "w-full"
disabled = { isCreating || !newRoomName.trim()}
                  >
    { isCreating? 'Creating...': 'Create' }
    </Button>
    </div>
    </Card>

{/* Rooms List */ }
<Card className="p-4" >
    <h3 className="font-semibold mb-3" > Rooms({ rooms.length }) </h3>
        < div className = "space-y-2 max-h-96 overflow-y-auto" >
            {
                rooms.length === 0 ? (
                    <p className= "text-sm text-gray-500" > No rooms yet.Create one!</ p >
                  ) : (
    rooms.map((room) => (
        <Button
                        key= { room.id }
                        variant = { selectedRoomId === room.id ? 'default' : 'outline'}
        className = "w-full justify-start truncate"
                        onClick = {() => setSelectedRoomId(room.id)}
        title = { room.name }
        >
        <span className="truncate" > { room.name } </span>
    </Button>
    ))
                  )}
</div>
    </Card>

{/* Info */ }
<Card className="p-4 bg-blue-50 border-blue-200" >
    <h3 className="font-semibold mb-2 text-sm" > ℹ️ About </h3>
        < p className = "text-xs text-gray-700" >
            Messages are synced in real - time with all users in the same room.
                </p>
                </Card>
                </div>

{/* Chat Area */ }
<div className="lg:col-span-3 bg-white rounded-lg shadow-sm border h-screen max-h-[600px] lg:max-h-[800px] flex flex-col" >
    {
        selectedRoomId?(
                <RealtimeChat roomId = { selectedRoomId } userId = { userId } />
              ): (
                <div className = "flex items-center justify-center h-full text-gray-500">
                  <p>Select or create a room to start chatting</ p >
    </div>
              )}
</div>
    </div>
        )}
</div>
    </main>
  );
}
