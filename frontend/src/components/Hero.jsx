import React from 'react';
import { Play, Briefcase, Sparkles } from 'lucide-react';

const SUGGESTED_ROLES = [
  "Java Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Prompt Engineer",
  "AI Engineer",
  "Data Analyst"
];

export default function Hero({ targetRole, setTargetRole, onAnalyze, selectedFile, isAnalyzing }) {
  const handleHeroClick = () => {
    if (!selectedFile) {
      document.getElementById('portalContainer')?.scrollIntoView({ behavior: 'smooth' });
    } else if (onAnalyze) {
      onAnalyze();
    }
  };

  const isReady = selectedFile && targetRole.trim().length > 0;

  return (
    <div className="z-10 relative text-left">
      <span className="inline-block text-[0.7rem] uppercase tracking-[0.4em] text-white/45 mb-[18px] font-sans">
        Career Intelligence Platform
      </span>
      <h1 className="font-['Syne'] text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.95] font-extrabold tracking-[-2.5px] mb-[28px] bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent">
        TURN YOUR<br />RESUME INTO<br />CAREER INSIGHTS
      </h1>
      <p className="font-sans text-[0.75rem] sm:text-[0.8rem] md:text-[0.82rem] uppercase tracking-[0.14em] text-white/45 max-w-[780px] leading-[1.85] mb-[38px]">
        Understand your resume the way recruiters do. Measure ATS compatibility, identify skill gaps, and receive personalized career recommendations powered by Retrieval-Augmented Generation (RAG).
      </p>

      {/* Interactive Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-[720px]">
        {/* Initiate AI Scan & Analysis Button */}
        <button
          onClick={handleHeroClick}
          disabled={isAnalyzing}
          className={`px-7 py-4 rounded-full font-['Syne'] font-extrabold text-xs tracking-[1.5px] uppercase transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
            isReady
              ? 'bg-white text-[#121214] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
              : 'bg-white/90 text-[#121214] hover:scale-105 hover:bg-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Initiate AI Scan & Analysis</span>
        </button>

        {/* Target Job Role Input & Autocomplete - Widened by ~15% */}
        <div className="relative flex-1 min-w-[270px]">
          <Briefcase className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            list="hero-suggested-roles"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Role (e.g. Backend Engineer)"
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-11 pr-5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-sans shadow-lg"
          />
          <datalist id="hero-suggested-roles">
            {SUGGESTED_ROLES.map((role, idx) => (
              <option key={idx} value={role} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}
