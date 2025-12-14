import ProfilePageContent from "./profile-content";
import "../animations.css";
import matchResults from "@/app/profiles/match-results.json";
import seedProfiles from "@/app/profiles/seed-profiles.json";

type ProfileData = {
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
};

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const ids = new Set<string>();
  matchResults.output.forEach((p) => ids.add(p.candidate_id));
  (seedProfiles as any[]).forEach((p) => ids.add((p as any).id));
  return Array.from(ids).map((id) => ({ id }));
}

export const dynamicParams = false;

export default function ProfilePage({ params }: ProfilePageProps) {
    const matchProfile = matchResults.output.find(
      (p) => p.candidate_id === params.id || p.alias.toLowerCase() === params.id.toLowerCase()
    );
    const seedProfile = (seedProfiles as any[]).find(
      (p) => p.id === params.id || p.alias?.toLowerCase?.() === params.id.toLowerCase()
    ) as any | undefined;

    let hydrated: ProfileData | null = null;

    if (matchProfile) {
      hydrated = {
        id: matchProfile.candidate_id,
        alias: matchProfile.alias,
        archetype: matchProfile.alias,
        avatar_url: matchProfile.avatar_url,
        augmentation_level: matchProfile.risk_level,
        primary_skill: "Unknown",
        risk_tolerance: 0,
        created_at: "",
        love_mood: "",
        vibe: "",
        short_bio: matchProfile.notes ?? "",
        looking_for: "",
        age_or_build_year: 0,
      };
    } else if (seedProfile) {
      hydrated = {
        id: seedProfile.id,
        alias: seedProfile.alias,
        archetype: seedProfile.archetype,
        avatar_url: seedProfile.avatar_url,
        augmentation_level: seedProfile.augmentation_level,
        primary_skill: seedProfile.primary_skill,
        risk_tolerance: seedProfile.risk_tolerance,
        created_at: seedProfile.created_at ?? "",
        love_mood: seedProfile.love_mood ?? "",
        vibe: seedProfile.vibe ?? "",
        short_bio: seedProfile.short_bio ?? "",
        looking_for: seedProfile.looking_for ?? "",
        age_or_build_year: seedProfile.age_or_build_year ?? 0,
      };
    }

    if (!hydrated) {
        return <div className="text-white p-8">Profile not found.</div>;
    }

    return <ProfilePageContent profile={hydrated} />;
}
