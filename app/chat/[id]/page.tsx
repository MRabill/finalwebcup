import DatingChatInterface from '@/components/dating-chat-interface';

interface ChatPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Mock profile data for the chat
const getMockProfileData = (id: string) => {
    const profiles: { [key: string]: { alias: string; avatar: string } } = {
        '1': {
            alias: 'NeonRonin',
            avatar:
                'https://fstopgvgzqymmvzerpbk.supabase.co/storage/v1/object/public/cyber/3d-cartoon-character-djing-party.jpg',
        },
        '2': {
            alias: 'SilverPhantom',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SilverPhantom',
        },
        '3': {
            alias: 'VortexKiss',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VortexKiss',
        },
        default: {
            alias: 'CyberLover',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberLover',
        },
    };

    return profiles[id] || profiles['default'];
};

export default async function ChatPage({ params }: ChatPageProps) {
    const { id } = await params;
    const targetProfile = getMockProfileData(id);

    return (
        <div className="h-screen w-full">
            <DatingChatInterface targetAlias={targetProfile.alias} targetAvatar={targetProfile.avatar} />
        </div>
    );
}

export async function generateStaticParams() {
    return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export const dynamicParams = true;
