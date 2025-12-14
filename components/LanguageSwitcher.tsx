"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "ENG" },
    { code: "fr", label: "FRA" },
    { code: "pt", label: "POR" },
  ];

  return (
    <div className="fixed top-6 left-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 px-3 py-2 bg-black/60 border border-cyan-500/30 backdrop-blur-md hover:border-cyan-500 hover:bg-cyan-950/30 transition-all duration-300 clip-path-polygon"
        >
          <div className="w-6 h-6 rounded border border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all text-cyan-500">
            <Globe className="w-3 h-3" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[8px] text-cyan-500/70 font-mono tracking-widest group-hover:text-cyan-400">LANG</span>
            <span className="text-xs text-cyan-500 font-bold font-orbitron tracking-wider group-hover:text-cyan-300 uppercase">
              {languages.find((l) => l.code === language)?.label}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[100px] flex flex-col gap-1 bg-black/80 border border-cyan-500/30 backdrop-blur-xl p-1 shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-in fade-in zoom-in-95 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-mono tracking-wider hover:bg-cyan-500/20 transition-colors ${
                  language === lang.code ? "text-cyan-300 bg-cyan-500/10 border-l-2 border-cyan-500" : "text-cyan-500/60"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

