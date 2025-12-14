import ProfilePageContent from "./profile-content";
import "../animations.css";

interface ProfileData {
    id: string;
    alias: string;
    archetype: string;
    avatar_url: string;
    augmentation_level: string;
    primary_skill: string;
    risk_tolerance: number;
    created_at: string;
    love_mood: string;
    vibe: string;
    short_bio: string;
    looking_for: string;
    age_or_build_year: number;
}

// Mock data - replace with actual API call
const getMockProfileData = (id: string): ProfileData => {
    return {
        id: "b027b0e4-631f-4db5-93ba-2cfdaa1d7944",
        alias: "NeonRonin",
        archetype: "Netrunner",
        avatar_url: "https://fstopgvgzqymmvzerpbk.supabase.co/storage/v1/object/public/cyber/3d-cartoon-character-djing-party.jpg",
        augmentation_level: "Street",
        primary_skill: "Hacking",
        risk_tolerance: 8,
        created_at: "2025-12-13T16:08:18.450178+00:00",
        love_mood: "Intense",
        vibe: "Mysterious",
        short_bio: "I break firewalls and vanish into neon.",
        looking_for: "Partner in Crime",
        age_or_build_year: 27
    };
};

interface ProfilePageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "sdfsdf" }];
}

export const dynamicParams = false;

export default function ProfilePage({ params }: ProfilePageProps) {
    const profile = getMockProfileData(params.id);
    return <ProfilePageContent profile={profile} />;
}
