import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

export default function ATSScoreCard({ ats_score, breakdown, keyword_breakdown }) {
  // SVG Config
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ats_score / 100) * circumference;

  const categories = [
    { key: 'technical_skills', label: 'Technical Skills', color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
    { key: 'experience', label: 'Work Experience', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { key: 'projects', label: 'Projects Quality', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
    { key: 'keyword_match', label: 'Keyword Match', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'education', label: 'Education Credentials', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { key: 'resume_quality', label: 'Resume Quality', color: 'text-rose-400', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-3">
        {/* SVG Circular Progress Gauge */}
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <h4 className="font-display font-semibold text-gray-400 text-sm">Overall Score</h4>
          
          <div className="relative my-6 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="h-36 w-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-white/5"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-brand-indigo transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-extrabold text-white">{ats_score}%</span>
              <span className="text-[10px] tracking-wider uppercase text-gray-500 font-semibold">ATS RATING</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Weighted score based on industry-standard parsing criteria.
          </p>
        </div>

        {/* Categories Grid (Technical Skills, etc.) */}
        <div className="glass md:col-span-2 rounded-2xl p-6">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Evaluation Breakdown</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map(({ key, label, color, bg }) => {
              const item = breakdown[key];
              if (!item) return null;
              const percent = Math.round((item.score / item.max) * 100);
              return (
                <div key={key} className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-400">{label}</span>
                    <span className="font-bold text-white">{item.score} / {item.max}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/5">
                    <div 
                      className={`h-full rounded-full bg-brand-indigo`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanations List */}
      <div className="glass rounded-2xl p-6">
        <h4 className="font-display font-semibold text-white text-sm mb-4">Detailed Score Rationale</h4>
        <div className="space-y-4">
          {categories.map(({ key, label, color, bg }) => {
            const item = breakdown[key];
            if (!item) return null;
            return (
              <div key={key} className="flex flex-col border-b border-white/5 pb-4 last:border-b-0 last:pb-0 md:flex-row md:items-start md:space-x-4">
                <div className={`mb-2 md:mb-0 inline-flex items-center shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold ${bg} ${color} md:w-44 justify-center`}>
                  {label}: {item.score}/{item.max}
                </div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  {item.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyword Checklist */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-brand-cyan" />
          <h4 className="font-display font-semibold text-white text-sm">Target Keyword Match Analysis</h4>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          ATS scans rely heavily on keyword intersections. Below is the checklist of matching keywords found in your resume text.
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {keyword_breakdown.map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold ${
                item.found 
                  ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400' 
                  : 'border-white/5 bg-white/5 text-gray-500'
              }`}
            >
              <span>{item.keyword}</span>
              {item.found ? (
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-gray-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
