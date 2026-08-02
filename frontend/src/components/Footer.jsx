import React from 'react';

const TECH_BADGES = [
  "React",
  "FastAPI",
  "Tailwind CSS",
  "FAISS",
  "Sentence Transformers",
  "Cohere"
];

function GitHubIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="pt-12 pb-13 sm:pb-14 border-t border-white/10 text-center text-white/45 text-[0.75rem] tracking-[2px] font-sans">
      <div className="max-w-[1300px] mx-auto px-6 flex flex-col items-center">
        {/* 1. CAREERLENS AI Logo */}
        <div className="font-['Syne'] font-extrabold text-lg tracking-[-1px] text-white uppercase mb-[14px]">
          CAREERLENS <span className="font-light opacity-40">AI</span>
        </div>

        {/* 2. Technology Badges - Monochrome Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-[24px]">
          {TECH_BADGES.map((badge, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-white/50 text-[10px] font-mono uppercase tracking-widest hover:border-white/25 hover:text-white/80 transition-all cursor-default"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* 3. Developer Credit */}
        <span className="text-white/60 font-semibold uppercase tracking-[2px] text-xs block mb-[10px]">
          CAREER LENS - AI // DESIGNED &amp; DEVELOPED_BY : <span className="text-white font-bold">NIHAR KOTHAPALLI.</span>
        </span>

        {/* 4. Copyright Line */}
        <p className="leading-relaxed text-xs text-white/40 mb-[20px]">
          &copy; 2026 CareerLens AI. Powered by FastAPI &amp; Multi-Provider RAG.
        </p>

        {/* 5. GitHub & LinkedIn Icons at Very Bottom */}
        <div className="flex justify-center items-center gap-7">
          <a
            href="https://github.com/Niharkothapalli"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="text-white/65 hover:text-white hover:scale-[1.08] transition-all duration-200 cursor-pointer hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.7)]"
          >
            <GitHubIcon className="w-[28px] h-[28px]" />
          </a>
          <a
            href="https://www.linkedin.com/in/niharkothapalli"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="text-white/65 hover:text-white hover:scale-[1.08] transition-all duration-200 cursor-pointer hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.7)]"
          >
            <LinkedInIcon className="w-[28px] h-[28px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
