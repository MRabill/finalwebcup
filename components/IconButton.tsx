import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from "lucide-react";

interface IconButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    /** ms per character for typewriter effect */
    typingSpeedMs?: number;
}

const IconButton: React.FC<IconButtonProps> = ({ 
    text, 
    onClick, 
    disabled = false, 
    className = "",
    icon = <ChevronRight size={16} className="text-cyan-500" />,
    typingSpeedMs = 50,
}) => {
    const [typed, setTyped] = useState("");

    const reducedMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    }, []);

    useEffect(() => {
        if (reducedMotion) {
            setTyped(text);
            return;
        }

        setTyped("");
        let i = 0;
        const id = window.setInterval(() => {
            i += 1;
            setTyped(text.slice(0, i));
            if (i >= text.length) window.clearInterval(id);
        }, Math.max(typingSpeedMs, 5));

        return () => window.clearInterval(id);
    }, [text, typingSpeedMs, reducedMotion]);

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full group relative overflow-hidden ${className}`}
        >
            <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative border border-white/20 hover:border-cyan-500/50 text-white font-mono text-sm py-4 flex items-center justify-between px-6 transition-all group-disabled:opacity-50 group-disabled:cursor-not-allowed">
                <span className="tracking-widest">{typed}</span>
                <div className="flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-white/20 group-hover:w-12 group-hover:bg-cyan-500 transition-all" />
                    {icon}
                </div>
            </div>
        </button>
    );
};

export default IconButton;
