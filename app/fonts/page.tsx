"use client";

import React from "react";

export default function FontsPage() {
    const fonts = [
        {
            name: "Orbitron",
            class: "font-orbitron",
            description: "Geometric, futuristic display font. Perfect for headings and titles.",
            weights: ["400", "700", "900"],
        },
        {
            name: "Audiowide",
            class: "font-audiowide",
            description: "Techno-inspired display font with a wide stance. Great for standout text.",
            weights: ["400"],
        },
        {
            name: "Sarpanch",
            class: "font-sarpanch",
            description: "Bold geometric sans-serif with a tech edge. Supports multiple weights.",
            weights: ["400", "500", "600", "700"],
        },
        {
            name: "Russo One",
            class: "font-russo-one",
            description: "Strong, geometric display font with a futuristic vibe.",
            weights: ["400"],
        },
        {
            name: "Major Mono Display",
            class: "font-major-mono",
            description: "Monospaced display font for system UI and data visualization.",
            weights: ["400"],
        },
    ];

    return (
        <div className= "min-h-screen bg-slate-950 text-white p-8" >
        {/* Header */ }
        < div className = "max-w-6xl mx-auto mb-12" >
            <h1 className="font-orbitron text-5xl font-bold mb-2 text-cyan-400" >
                CYBERPUNK TYPEFACES
                    </h1>
                    < p className = "text-slate-400 text-lg" >
                        IAstroMatch – Intergalactic Dating Platform Font System
                            </p>
                            </div>

    {/* Neon divider */ }
    <div className="max-w-6xl mx-auto mb-12 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" > </div>

    {/* Font showcase grid */ }
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8" >
    {
        fonts.map((font, index) => (
            <div
            key= { index }
            className = "border border-cyan-500/30 bg-slate-900/50 backdrop-blur rounded-lg p-8 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
            {/* Font name */ }
            < div className = {`${font.class} text-4xl font-bold mb-4 text-cyan-400`} >
        { font.name }
        </div>

    {/* Font samples */ }
    <div className="space-y-4 mb-6" >
        <div className={ `${font.class} text-2xl text-white` }>
            ENTER THE GRID
                </div>
                < div className = {`${font.class} text-lg text-slate-300`
}>
    Connecting 4 392 102 lifeforms…
</div>
    < div className = {`${font.class} text-sm text-slate-400`}>
        Signal jammed.Check your input and try again.
              </div>
            </div>

{/* Description */ }
<p className="text-slate-400 text-sm mb-4" > { font.description } </p>

{/* Font weights */ }
<div className="border-t border-slate-700 pt-4" >
    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" >
        Available Weights
            </p>
            < div className = "flex gap-2 flex-wrap" >
            {
                font.weights.map((weight) => (
                    <span
                    key= { weight }
                    className = "px-3 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                    { weight }
                    </span>
                ))
            }
                </div>
                </div>
                </div>
        ))}
</div>

{/* Usage section */ }
<div className="max-w-6xl mx-auto mt-16" >
    <h2 className="font-orbitron text-3xl font-bold mb-8 text-cyan-400" >
        USAGE GUIDE
            </h2>

            < div className = "grid grid-cols-1 md:grid-cols-2 gap-8" >
                {/* Implementation */ }
                < div className = "border border-magenta-500/30 bg-slate-900/50 backdrop-blur rounded-lg p-6" >
                    <h3 className="font-russo-one text-xl mb-4 text-magenta-400" >
                        In Your Components
                            </h3>
                            < pre className = "bg-slate-950 p-4 rounded text-xs text-green-400 overflow-x-auto font-major-mono" >
                                {`{/* Using Tailwind classes */}
<h1 className="font-orbitron 
  text-4xl font-bold">
  Title
</h1>`}
</pre>
    </div>

{/* Font assignment */ }
<div className="border border-magenta-500/30 bg-slate-900/50 backdrop-blur rounded-lg p-6" >
    <h3 className="font-russo-one text-xl mb-4 text-magenta-400" >
        Font Applications
            </h3>
            < ul className = "space-y-2 text-sm text-slate-300" >
                <li>
                <span className="text-cyan-400 font-orbitron" > Orbitron </span>: Page
titles, main headings
    </li>
    < li >
    <span className="text-cyan-400 font-audiowide" > Audiowide </span>: Hero
text, standout CTA
    </li>
    < li >
    <span className="text-cyan-400 font-sarpanch" > Sarpanch </span>: Section
titles, badges
    </li>
    < li >
    <span className="text-cyan-400 font-russo-one" > Russo One </span>: UI
accents, labels
    </li>
    < li >
    <span className="text-cyan-400 font-major-mono" > Major Mono </span>: Data,
codes, stats
    </li>
    </ul>
    </div>
    </div>
    </div>

{/* Cyberpunk text samples */ }
<div className="max-w-6xl mx-auto mt-16" >
    <h2 className="font-orbitron text-3xl font-bold mb-8 text-cyan-400" >
        IMMERSIVE SAMPLES
            </h2>

            < div className = "space-y-6" >
                {/* Sample 1: Profile Card */ }
                < div className = "border-2 border-cyan-500/50 bg-slate-900/50 backdrop-blur rounded-lg p-8" >
                    <div className="font-orbitron text-2xl text-cyan-400 mb-2" >
                        COMPATIBILITY SCAN
                            </div>
                            < div className = "font-major-mono text-sm text-slate-400 mb-4" >
                                [ENCRYPTION: QUANTUM]
                                </div>
                                < div className = "grid grid-cols-2 gap-4" >
                                    <div>
                                    <div className="font-sarpanch text-lg text-magenta-400" > 92 % </div>
                                        < div className = "text-xs text-slate-400 font-major-mono" > Match Rating </div>
                                            </div>
                                            < div >
                                            <div className="font-sarpanch text-lg text-yellow-400" > STABLE ALLIANCE </div>
                                                < div className = "text-xs text-slate-400 font-major-mono" > Prognosis </div>
                                                    </div>
                                                    </div>
                                                    </div>

{/* Sample 2: Dialog */ }
<div className="border-2 border-magenta-500/50 bg-slate-900/50 backdrop-blur rounded-lg p-8" >
    <div className="font-audiowide text-xl text-magenta-400 mb-4" >
        OPEN DIPLOMATIC CHANNEL
            </div>
            < div className = "space-y-2 text-sm" >
                <div className="text-slate-300" >
                    <span className="font-major-mono text-green-400" > { ">"} </span> Connected with
Zex - 7 from Sector 9
    </div>
    < div className = "text-slate-300" >
        <span className="font-major-mono text-green-400" > { ">"} </span> Initiating handshake
            </div>
            < div className = "text-slate-400" >
                <span className="font-major-mono text-yellow-400" > { "?"} </span> Awaiting response…
                    </div>
                    </div>
                    </div>

{/* Sample 3: Error state */ }
<div className="border-2 border-red-500/50 bg-slate-900/50 backdrop-blur rounded-lg p-8" >
    <div className="font-russo-one text-xl text-red-400 mb-4" >
              ⚠ SIGNAL JAMMED
    </div>
    < div className = "font-sarpanch text-sm text-red-300 mb-3" >
        ERROR: PROTOCOL VIOLATION DETECTED
            </div>
            < p className = "text-slate-300 text-sm" >
                Your input failed our security scan.Recalibrate and try again, or{ " " }
<span className="text-cyan-400 font-orbitron" > hack another sector </span>.
    </p>
    </div>
    </div>
    </div>

{/* Footer */ }
<div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-700 text-center" >
    <p className="text-slate-500 text-xs font-major-mono" >
        IAstroMatch Font System v1.0 | Cyberpunk UI / UX Guidelines Compliant
            </p>
            </div>
            </div>
  );
}
