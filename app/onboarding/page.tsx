"use client";

import ParallaxLogin from "@/components/ParallaxLogin";

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#000814] relative">
      <ParallaxLogin />

      {/* Left Side Decoration - INTENSE */}
      <div className="absolute top-0 left-0 bottom-0 w-1/3 pointer-events-none hidden md:flex flex-col justify-between overflow-hidden z-[60]">
        {/* Huge Vertical Text Background */}
        <div className="absolute top-0 left-0 h-full flex items-center -ml-4 select-none opacity-20 mix-blend-screen">
            <span className="text-[18vh] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-cyan-900 to-transparent tracking-tighter" style={{ writingMode: 'vertical-rl', fontFamily: 'Orbitron, sans-serif' }}>
                CYBERNETICS
            </span>
        </div>

        {/* Top Info Block */}
        <div className="mt-32 ml-12 space-y-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <span className="text-cyan-400 font-mono text-lg font-bold tracking-[0.2em] glitch" data-glitch="NET_ID: 884-29X">NET_ID: 884-29X</span>
            </div>
            <div className="h-1.5 w-48 bg-cyan-900/30 overflow-hidden border border-cyan-500/30">
                <div className="h-full w-full bg-cyan-400 origin-left animate-[scale-x_2s_ease-in-out_infinite]" />
            </div>
            <div className="text-xs text-cyan-600 font-mono leading-relaxed pl-2 border-l-2 border-cyan-500/50">
                UPLINK_SECURE // <span className="text-cyan-300">ACTIVE</span><br/>
                ENCRYPTION_KEY_VALID
            </div>
        </div>

        {/* Middle Decorative Kanji */}
        <div className="absolute top-1/2 left-16 -translate-y-1/2 opacity-60 mix-blend-plus-lighter">
            <div className="text-7xl font-black text-cyan-500/10 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" style={{ writingMode: 'vertical-rl', textShadow: '2px 2px 0px rgba(0,255,255,0.2)' }}>
                接続確立
            </div>
        </div>

        {/* Bottom Data Stream */}
        <div className="mb-24 ml-12 relative z-10">
            <div className="bg-black/40 backdrop-blur-sm p-4 border border-cyan-500/20 border-l-4 border-l-cyan-500">
                <div className="text-cyan-500 font-bold text-xs mb-2 tracking-widest">DATA_STREAM_INCOMING</div>
                <div className="space-y-1 font-mono text-[10px] text-cyan-400/60">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="truncate w-48">
                            {`> 0x${Math.random().toString(16).slice(2,8).toUpperCase()}_PKT_${i} [OK]`}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Right Side Decoration - INTENSE */}
      <div className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none hidden md:flex flex-col justify-between items-end overflow-hidden z-[60]">
         {/* Huge Number Background */}
         <div className="absolute top-20 right-[-20px] select-none mix-blend-overlay opacity-30">
            <span className="text-[40vh] font-black text-pink-600 italic tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>01</span>
         </div>

         {/* Top Radar Element */}
         <div className="mt-32 mr-12 relative w-64 h-64 border border-pink-500/20 rounded-full flex items-center justify-center bg-pink-900/5 backdrop-blur-sm">
            <div className="absolute inset-0 border-2 border-pink-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 border border-dashed border-pink-500/40 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-12 border border-pink-500/20 rounded-full" />
            
            {/* Radar Sweep */}
            <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-b from-pink-500 to-transparent origin-bottom animate-[spin_4s_linear_infinite] shadow-[0_0_15px_#ec4899]" />
            
            {/* Blips */}
            <div className="absolute top-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            <div className="absolute bottom-16 left-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-700" />
         </div>

         {/* Middle Status Bars */}
         <div className="mr-12 space-y-6 text-right relative z-10">
            <div className="text-5xl font-black text-white/5 tracking-widest absolute -right-4 -top-12 select-none">STATUS</div>
            <div className="flex flex-col items-end gap-2 bg-black/20 p-4 rounded border-r-2 border-pink-500/50 backdrop-blur-sm">
                {['MEMORY', 'CPU_CORE', 'NET_LINK', 'PWR_CELL'].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-pink-400 font-bold tracking-wider">{label}</span>
                        <div className="w-32 h-2 bg-pink-900/30 skew-x-[-12deg] overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-pink-600 to-pink-400 animate-pulse" 
                                style={{ width: `${Math.random() * 40 + 60}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Bottom Warning Block */}
         <div className="mb-24 mr-12 flex items-end gap-6 relative z-10">
            <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <div className="text-red-500 font-black tracking-[0.2em] text-lg glitch" data-glitch="WARNING">WARNING</div>
                </div>
                <div className="text-[10px] text-pink-500/70 font-mono max-w-[200px] leading-relaxed border-t border-pink-500/30 pt-2">
                    UNAUTHORIZED SIGNAL DETECTED IN SECTOR 7G. SECURITY PROTOCOLS ENGAGED.
                </div>
            </div>
            {/* Hazard Stripes */}
            <div className="w-4 h-24 flex flex-col gap-1">
                {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="flex-1 bg-red-500/40 skew-y-[-20deg]" />
                ))}
            </div>
         </div>
      </div>
    </main>
  );
}
