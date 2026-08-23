import React, { useState, useEffect, useRef } from 'react';
import { Play, Briefcase, GraduationCap, ChevronDown } from 'lucide-react';

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

const APPLICATION_LEVELS = [
  { value: 'fresher', label: 'Fresher / Entry Level', colorClass: 'text-emerald-400' },
  { value: 'junior', label: 'Junior / 1–2 Years', colorClass: 'text-blue-400' },
  { value: 'mid_level', label: 'Mid-Level / 3–5 Years', colorClass: 'text-amber-400' },
  { value: 'senior', label: 'Senior / 5+ Years', colorClass: 'text-rose-400' }
];

const LEVEL_ACCENTS = {
  fresher: {
    border: 'border-emerald-500/30 focus:border-emerald-400/60',
    glow: 'shadow-[0_0_15px_rgba(74,222,128,0.12)]',
    icon: 'text-emerald-400'
  },
  junior: {
    border: 'border-blue-500/30 focus:border-blue-400/60',
    glow: 'shadow-[0_0_15px_rgba(96,165,250,0.12)]',
    icon: 'text-blue-400'
  },
  mid_level: {
    border: 'border-amber-500/30 focus:border-amber-400/60',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.12)]',
    icon: 'text-amber-400'
  },
  senior: {
    border: 'border-rose-500/30 focus:border-rose-400/60',
    glow: 'shadow-[0_0_15px_rgba(248,113,113,0.12)]',
    icon: 'text-rose-400'
  }
};

export default function Hero({ targetRole, setTargetRole, applicationLevel = 'fresher', setApplicationLevel, onAnalyze, selectedFile, isAnalyzing }) {
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [dropUpLevel, setDropUpLevel] = useState(false);
  const levelRef = useRef(null);

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [dropUpRole, setDropUpRole] = useState(false);
  const roleRef = useRef(null);

  const updateLevelDirection = () => {
    if (levelRef.current) {
      const rect = levelRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const requiredSpace = 190;
      
      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setDropUpLevel(true);
      } else {
        setDropUpLevel(false);
      }
    }
  };

  const updateRoleDirection = () => {
    if (roleRef.current) {
      const rect = roleRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const requiredSpace = 400;
      
      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setDropUpRole(true);
      } else {
        setDropUpRole(false);
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (levelRef.current && !levelRef.current.contains(e.target)) {
        setIsLevelOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isLevelOpen) {
      updateLevelDirection();
      window.addEventListener('resize', updateLevelDirection);
      window.addEventListener('scroll', updateLevelDirection, true);
      return () => {
        window.removeEventListener('resize', updateLevelDirection);
        window.removeEventListener('scroll', updateLevelDirection, true);
      };
    }
  }, [isLevelOpen]);

  useEffect(() => {
    if (isRoleOpen) {
      updateRoleDirection();
      window.addEventListener('resize', updateRoleDirection);
      window.addEventListener('scroll', updateRoleDirection, true);
      return () => {
        window.removeEventListener('resize', updateRoleDirection);
        window.removeEventListener('scroll', updateRoleDirection, true);
      };
    }
  }, [isRoleOpen]);

  const handleHeroClick = () => {
    if (!selectedFile) {
      document.getElementById('portalContainer')?.scrollIntoView({ behavior: 'smooth' });
    } else if (!isReady) {
      document.getElementById('portalContainer')?.scrollIntoView({ behavior: 'smooth' });
    } else if (onAnalyze) {
      onAnalyze();
    }
  };

  const isReady = selectedFile && targetRole.trim().length > 0;
  const currentAccent = LEVEL_ACCENTS[applicationLevel] || LEVEL_ACCENTS.fresher;
  const selectedLevelObj = APPLICATION_LEVELS.find((lvl) => lvl.value === applicationLevel) || APPLICATION_LEVELS[0];

  const filteredRoles = SUGGESTED_ROLES.filter(r => 
    r.toLowerCase().includes(targetRole.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[850px]">
        {/* Initiate AI Scan Button */}
        <button
          onClick={handleHeroClick}
          disabled={isAnalyzing}
          className={`px-6 py-4 rounded-full font-['Syne'] font-extrabold text-xs tracking-[1.5px] uppercase transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
            isReady
              ? 'bg-white text-[#121214] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]'
              : 'bg-white/90 text-[#121214] hover:scale-[1.02] hover:bg-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Initiate AI Scan</span>
        </button>

        {/* Target Job Role Input & Autocomplete */}
        <div className="relative flex-1 min-w-[200px]" ref={roleRef}>
          <Briefcase className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              setIsRoleOpen(true);
            }}
            onFocus={() => setIsRoleOpen(true)}
            placeholder="Target Role (e.g. Backend Engineer)"
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-11 pr-9 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-sans shadow-lg"
          />
          <button
            type="button"
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Dark Glass Dropdown Menu Aligned Left to Right with Button */}
          {isRoleOpen && (
            <div className={`glass absolute left-0 right-0 z-50 w-full overflow-hidden rounded-xl p-1.5 shadow-2xl backdrop-blur-xl bg-[#18181c] border border-white/10 animate-fadeIn ${
              dropUpRole ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}>
              {filteredRoles.map((role, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTargetRole(role);
                    setIsRoleOpen(false);
                  }}
                  className="flex w-full items-center rounded-lg px-3.5 py-2.5 text-left text-xs text-white/90 hover:text-white hover:bg-white/5 font-medium transition-colors cursor-pointer"
                >
                  {role}
                </button>
              ))}
              {filteredRoles.length === 0 && (
                <div className="px-3.5 py-2.5 text-xs text-white/40 italic">
                  Press enter or continue typing custom role
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Application Level Selector */}
        <div className="relative flex-1 sm:flex-initial sm:w-[220px] shrink-0 min-w-[200px]" ref={levelRef}>
          <GraduationCap className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${currentAccent.icon}`} />
          <button
            type="button"
            onClick={() => setIsLevelOpen(!isLevelOpen)}
            className={`w-full text-left bg-white/5 border ${currentAccent.border} ${currentAccent.glow} rounded-full py-4 pl-11 pr-9 text-xs text-white flex items-center justify-between focus:outline-none focus:bg-white/10 transition-all font-sans cursor-pointer`}
          >
            <span className="truncate">{selectedLevelObj.label}</span>
          </button>
          <ChevronDown className={`w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isLevelOpen ? 'rotate-180' : ''} ${currentAccent.icon}`} />

          {/* Floating Dark Glass Dropdown Menu */}
          {isLevelOpen && (
            <div className={`glass absolute left-0 right-0 z-50 w-full overflow-hidden rounded-xl p-1.5 shadow-2xl backdrop-blur-xl bg-[#18181c] border border-white/10 animate-fadeIn ${
              dropUpLevel ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}>
              {APPLICATION_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => {
                    if (setApplicationLevel) setApplicationLevel(lvl.value);
                    setIsLevelOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3.5 py-2.5 text-left text-xs ${lvl.colorClass} font-medium hover:bg-white/5 transition-colors cursor-pointer`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



