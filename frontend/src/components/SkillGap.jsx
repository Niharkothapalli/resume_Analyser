import React from 'react';
import { AlertCircle, HelpCircle, BookOpen, Terminal } from 'lucide-react';

export default function SkillGap({ missing_skills, gap_analysis }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Missing Skills Chips */}
      <div className="glass rounded-2xl p-6">
        <h4 className="flex items-center space-x-2 font-display font-semibold text-white text-sm mb-4">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <span>Identified Missing Skills</span>
        </h4>
        <p className="text-xs text-gray-500 mb-6">
          The following skills are critical or preferred for this career role but were not detected in your resume context.
        </p>
        
        {missing_skills.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center text-sm font-semibold text-emerald-400">
            Excellent! You have all the required and preferred skills for this role.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {missing_skills.map((skill, i) => (
              <span 
                key={i} 
                className="inline-flex items-center rounded-xl border border-rose-500/15 bg-rose-500/5 px-3.5 py-1.5 text-xs font-semibold text-rose-400"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Structured Comparison Table */}
      {gap_analysis.length > 0 && (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/5 px-6 py-4">
            <h4 className="font-display font-semibold text-white text-sm">Gap Analysis & Upskilling Roadmaps</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400 border-collapse">
              <thead className="bg-white/2 text-xs font-semibold uppercase tracking-wider text-gray-300">
                <tr>
                  <th className="px-6 py-4">Skill</th>
                  <th className="px-6 py-4">Importance & Usage</th>
                  <th className="px-6 py-4">ATS Score Impact</th>
                  <th className="px-6 py-4">Learning Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gap_analysis.map((gap, i) => (
                  <tr key={i} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 shrink-0">
                      <span className="inline-flex items-center space-x-1.5 rounded-lg border border-brand-purple/20 bg-brand-purple/5 px-2.5 py-1 text-xs font-bold text-brand-purple">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>{gap.skill}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-gray-200 text-xs">Why it's important:</div>
                      <p className="mt-1 text-xs leading-relaxed">{gap.importance}</p>
                      
                      <div className="mt-3 font-semibold text-gray-200 text-xs">Role Usage:</div>
                      <p className="mt-1 text-xs leading-relaxed">{gap.usage}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-xs leading-relaxed">
                      {gap.ats_impact}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center space-x-1.5 text-brand-cyan">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-semibold text-xs">upskill plan</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-300">
                        {gap.learning_direction}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
