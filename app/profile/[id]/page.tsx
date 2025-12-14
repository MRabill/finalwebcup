import ProfilePageContent from "./profile-content";
import "../animations.css";
import matchResults from "@/app/profiles/match-results.json";

type ProfileData = (typeof matchResults.output)[number];

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return matchResults.output.map((p) => ({ id: p.candidate_id }));
}

export const dynamicParams = false;

export default function ProfilePage({ params }: ProfilePageProps) {
  const profile = matchResults.output.find((p) => p.candidate_id === params.id);
  if (!profile) {
    return <div className="text-white p-8">Profile not found.</div>;
  }

  const hydrated: ProfileData = {
    ...profile,
    id: profile.candidate_id,
    archetype: profile.alias,
    augmentation_level: profile.risk_level,
    primary_skill: "Unknown",
    risk_tolerance: 0,
    created_at: "",
    love_mood: "",
    vibe: "",
    short_bio: profile.notes ?? "",
    looking_for: "",
    age_or_build_year: 0,
  };

  return <ProfilePageContent profile={hydrated} />;
}
