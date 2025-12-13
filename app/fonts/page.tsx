export const dynamic = "force-static";

export const metadata = {
  title: "Fonts Showcase",
  description: "Preview of the cyberpunk font stack used in the project.",
};

const fonts = [
  {
    name: "Orbitron",
    className: "font-orbitron",
    description: "Geometric, futuristic display font. Perfect for headings and titles.",
    weights: ["400", "700", "900"],
  },
  {
    name: "Audiowide",
    className: "font-audiowide",
    description: "Techno-inspired display font with a wide stance. Great for standout text.",
    weights: ["400"],
  },
  {
    name: "Sarpanch",
    className: "font-sarpanch",
    description: "Bold geometric sans-serif with a tech edge. Supports multiple weights.",
    weights: ["400", "500", "600", "700"],
  },
  {
    name: "Russo One",
    className: "font-russo-one",
    description: "Strong, geometric display font with a futuristic vibe.",
    weights: ["400"],
  },
  {
    name: "Major Mono Display",
    className: "font-major-mono",
    description: "Monospaced display font for system UI and data visualization.",
    weights: ["400"],
  },
];

export default function FontsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto mb-12 max-w-6xl">
        <h1 className="font-orbitron mb-2 text-5xl font-bold text-cyan-400">CYBERPUNK TYPEFACES</h1>
        <p className="text-lg text-slate-400">IAstroMatch — Intergalactic font system showcase</p>
      </div>

      <div className="mx-auto mb-12 h-px max-w-6xl bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {fonts.map((font) => (
          <div
            key={font.name}
            className="rounded-lg border border-cyan-500/30 bg-slate-900/50 p-8 backdrop-blur transition-all duration-300 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className={`${font.className} mb-4 text-4xl font-bold text-cyan-400`}>{font.name}</div>

            <div className="mb-6 space-y-4">
              <div className={`${font.className} text-2xl text-white`}>ENTER THE GRID</div>
              <div className={`${font.className} text-lg text-slate-300`}>Connecting 4 392 102 lifeforms</div>
              <div className={`${font.className} text-sm text-slate-400`}>Signal jammed. Check your input and try again.</div>
            </div>

            <p className="mb-4 text-sm text-slate-400">{font.description}</p>

            <div className="border-t border-slate-700 pt-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">Available Weights</p>
              <div className="flex flex-wrap gap-2">
                {font.weights.map((weight) => (
                  <span
                    key={weight}
                    className="rounded border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    {weight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <h2 className="font-orbitron mb-8 text-3xl font-bold text-cyan-400">USAGE GUIDE</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-pink-500/30 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="font-russo-one mb-4 text-xl text-pink-400">In Your Components</h3>
            <pre className="font-major-mono overflow-x-auto rounded bg-slate-950 p-4 text-xs text-green-400">
{`{/* Using Tailwind classes */}
<h1 className="font-orbitron text-4xl font-bold">
  Title
</h1>`}
            </pre>
          </div>

          <div className="rounded-lg border border-pink-500/30 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="font-russo-one mb-4 text-xl text-pink-400">Font Applications</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <span className="font-orbitron text-cyan-400">Orbitron</span>: Page titles, main headings
              </li>
              <li>
                <span className="font-audiowide text-cyan-400">Audiowide</span>: Hero text, standout CTA
              </li>
              <li>
                <span className="font-sarpanch text-cyan-400">Sarpanch</span>: Section titles, badges
              </li>
              <li>
                <span className="font-russo-one text-cyan-400">Russo One</span>: UI accents, labels
              </li>
              <li>
                <span className="font-major-mono text-cyan-400">Major Mono</span>: Data, codes, stats
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <h2 className="font-orbitron mb-8 text-3xl font-bold text-cyan-400">IMMERSIVE SAMPLES</h2>

        <div className="space-y-6">
          <div className="rounded-lg border-2 border-cyan-500/50 bg-slate-900/50 p-8 backdrop-blur">
            <div className="font-orbitron mb-2 text-2xl text-cyan-400">COMPATIBILITY SCAN</div>
            <div className="font-major-mono mb-4 text-sm text-slate-400">[ENCRYPTION: QUANTUM]</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-sarpanch text-lg text-pink-400">92%</div>
                <div className="font-major-mono text-xs text-slate-400">Match Rating</div>
              </div>
              <div>
                <div className="font-sarpanch text-lg text-yellow-400">STABLE ALLIANCE</div>
                <div className="font-major-mono text-xs text-slate-400">Prognosis</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-pink-500/50 bg-slate-900/50 p-8 backdrop-blur">
            <div className="font-audiowide mb-4 text-xl text-pink-400">OPEN DIPLOMATIC CHANNEL</div>
            <div className="space-y-2 text-sm">
              <div className="text-slate-300">
                <span className="font-major-mono text-green-400">{">"}</span> Connected with Zex-7 from Sector 9
              </div>
              <div className="text-slate-300">
                <span className="font-major-mono text-green-400">{">"}</span> Initiating handshake
              </div>
              <div className="text-slate-400">
                <span className="font-major-mono text-yellow-400">?</span> Awaiting response
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-red-500/50 bg-slate-900/50 p-8 backdrop-blur">
            <div className="font-russo-one mb-4 text-xl text-red-400">SIGNAL JAMMED</div>
            <div className="font-sarpanch mb-3 text-sm text-red-300">ERROR: PROTOCOL VIOLATION DETECTED</div>
            <p className="text-sm text-slate-300">
              Your input failed our security scan. Recalibrate and try again, or{" "}
              <span className="font-orbitron text-cyan-400">hack another sector</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl border-t border-slate-700 pt-8 text-center">
        <p className="font-major-mono text-xs text-slate-500">IAstroMatch Font System v1.0 | Cyberpunk UI Guide</p>
      </div>
    </div>
  );
}
