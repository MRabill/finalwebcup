import Link from 'next/link';

export default function ChatDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a0a2e] to-[#16213e] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black uppercase text-cyan-400 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        Dating Chat
                    </h1>
                    <p className="text-gray-300 text-lg">Cyberpunk-themed messaging interface</p>
                </div>

                {/* Instructions */}
                <div className="bg-black/40 border border-cyan-400/30 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase">How It Works</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>✓ Click on a profile to start a chat</li>
                        <li>✓ Send an invite first</li>
                        <li>✓ Wait 6-10 seconds for acceptance (simulated)</li>
                        <li>✓ Chat interface opens automatically</li>
                        <li>✓ Messages are sent to AI webhook and responses displayed</li>
                        <li>✓ Status messages show encryption/transmission state</li>
                    </ul>
                </div>

                {/* Available Chat Profiles */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-magenta-400 mb-6 uppercase">Available Profiles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Profile 1 */}
                        <Link href="/chat/1" className="group">
                            <div className="border-2 border-cyan-400 hover:border-cyan-300 bg-cyan-900/20 hover:bg-cyan-900/30 p-6 rounded-lg transition-all duration-300 cursor-pointer">
                                <div className="w-full h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded mb-4 flex items-center justify-center">
                                    <span className="text-4xl">👾</span>
                                </div>
                                <h3 className="font-bold text-cyan-400 text-lg uppercase mb-2">NeonRonin</h3>
                                <p className="text-gray-400 text-sm mb-4">Netrunner / Street Level</p>
                                <button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-2 px-4 rounded hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                                    Open Chat
                                </button>
                            </div>
                        </Link>

                        {/* Profile 2 */}
                        <Link href="/chat/2" className="group">
                            <div className="border-2 border-magenta-400 hover:border-magenta-300 bg-magenta-900/20 hover:bg-magenta-900/30 p-6 rounded-lg transition-all duration-300 cursor-pointer">
                                <div className="w-full h-32 bg-gradient-to-br from-magenta-500 to-purple-600 rounded mb-4 flex items-center justify-center">
                                    <span className="text-4xl">🌟</span>
                                </div>
                                <h3 className="font-bold text-magenta-400 text-lg uppercase mb-2">SilverPhantom</h3>
                                <p className="text-gray-400 text-sm mb-4">Hacker / Elite Level</p>
                                <button className="w-full bg-gradient-to-r from-magenta-500 to-magenta-600 text-white font-bold py-2 px-4 rounded hover:shadow-lg hover:shadow-magenta-500/50 transition-all">
                                    Open Chat
                                </button>
                            </div>
                        </Link>

                        {/* Profile 3 */}
                        <Link href="/chat/3" className="group">
                            <div className="border-2 border-purple-400 hover:border-purple-300 bg-purple-900/20 hover:bg-purple-900/30 p-6 rounded-lg transition-all duration-300 cursor-pointer">
                                <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded mb-4 flex items-center justify-center">
                                    <span className="text-4xl">💫</span>
                                </div>
                                <h3 className="font-bold text-purple-400 text-lg uppercase mb-2">VortexKiss</h3>
                                <p className="text-gray-400 text-sm mb-4">Syncro / Corporate</p>
                                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 px-4 rounded hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                                    Open Chat
                                </button>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/40 border border-cyan-400/30 p-4 rounded-lg">
                        <h3 className="text-cyan-400 font-bold mb-2 uppercase">✨ Features</h3>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• Invite system with status</li>
                            <li>• Random acceptance delay</li>
                            <li>• Animated loading UI</li>
                            <li>• Real-time chat</li>
                        </ul>
                    </div>
                    <div className="bg-black/40 border border-magenta-400/30 p-4 rounded-lg">
                        <h3 className="text-magenta-400 font-bold mb-2 uppercase">🚀 Technology</h3>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• Next.js 15 + React 19</li>
                            <li>• Tailwind CSS</li>
                            <li>• N8N Webhook Integration</li>
                            <li>• Cyberpunk Animations</li>
                        </ul>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="bg-black/40 border border-purple-400/30 p-6 rounded-lg">
                    <h3 className="text-purple-400 font-bold mb-4 uppercase">📡 Technical Details</h3>
                    <div className="space-y-3 text-gray-400 text-sm font-mono">
                        <div>
                            <span className="text-cyan-400">Webhook:</span> https://mrabeel.app.n8n.cloud/webhook/...
                        </div>
                        <div>
                            <span className="text-cyan-400">Wait Time:</span> Random 6-10 seconds
                        </div>
                        <div>
                            <span className="text-cyan-400">Session:</span> UUID-based conversation tracking
                        </div>
                        <div>
                            <span className="text-cyan-400">Colors:</span> Cyan (#00ffff) + Magenta (#d946ef)
                        </div>
                        <div>
                            <span className="text-cyan-400">Animations:</span> Glitch, scan-line, neon-glow effects
                        </div>
                    </div>
                </div>

                {/* Back button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 border border-gray-500 text-gray-400 hover:text-cyan-400 hover:border-cyan-400 rounded transition-all"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
