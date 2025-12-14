import { supabase, hasSupabaseCredentials } from "@/lib/supabase";
import seedProfiles from "./seed-profiles.json";

type Profile = {
  id: string;
  alias: string;
  archetype: string;
  avatar_url: string | null;
  age_or_build_year: number;
  augmentation_level: string;
  primary_skill: string;
  vibe: string;
  short_bio: string | null;
  looking_for: string;
  risk_tolerance: number;
  love_mood: string | null;
  created_at: string | null;
};

async function fetchProfiles(): Promise<{ profiles: Profile[]; error?: string }> {
  if (!hasSupabaseCredentials || !supabase) {
    return { profiles: seedProfiles as Profile[], error: "Supabase credentials are not configured. Showing seed data." };
  }

  const { data, error } = await supabase
    .from("character_profiles")
    .select(
      "id, alias, archetype, avatar_url, age_or_build_year, augmentation_level, primary_skill, vibe, short_bio, looking_for, risk_tolerance, love_mood, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { profiles: seedProfiles as Profile[], error: error.message };
  }

  return { profiles: (data ?? []) as Profile[] };
}

export default async function ProfilesPage() {
  const { profiles, error } = await fetchProfiles();

  return (
    <main
      className="min-h-screen w-full text-gray-100 px-6 py-10"
      style={{
        backgroundImage: "url('/illustration-rain-futuristic-city.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Character Database
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Profiles
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Avatars are now pulled live from the <code>character_profiles</code> table using{" "}
            <code>avatar_url</code>.
          </p>
          {error && (
            <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </header>

        {profiles.length === 0 ? (
          <div className="rounded border border-cyan-500/30 bg-black/50 px-4 py-6 text-sm text-cyan-100 backdrop-blur">
            No profiles found. Add rows to the <code>character_profiles</code> table to see them here.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0a0f24]/90 to-[#0f112a]/90 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-cyan-400/40 via-purple-500/20 to-transparent" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.alias}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                      No avatar_url
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                    {profile.archetype}
                  </div>
                  <div className="text-xl font-bold flex items-center gap-2">
                    {profile.alias}
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                      {profile.augmentation_level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {profile.primary_skill} • Risk {profile.risk_tolerance}/10
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    Age/Built: {profile.age_or_build_year} • Vibe: {profile.vibe}
                  </div>
                  {profile.short_bio && (
                    <p className="text-sm text-gray-300 mt-1 line-clamp-3">
                      {profile.short_bio}
                    </p>
                  )}
                  <div className="text-xs text-purple-200 mt-1">
                    Looking for: {profile.looking_for}
                  </div>
                  {profile.love_mood && (
                    <div className="text-[11px] text-pink-200">
                      Love mood: {profile.love_mood}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500 font-mono mt-2">
                    ID: {profile.id}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
