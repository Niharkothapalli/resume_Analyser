import React, { useState, useRef, useEffect } from 'react';
import { 
  Trophy, Award, BarChart3, AlertTriangle, 
  Layers, FolderKanban, MessageSquareCode, CheckCircle 
} from 'lucide-react';
import ATSScoreCard from './ATSScoreCard';
import SkillGap from './SkillGap';
import ResumeQuality from './ResumeQuality';
import RecommendedProjects from './RecommendedProjects';
import ResumeAssistant from './ResumeAssistant';

const TABS = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'ats', name: 'ATS Score', icon: Trophy },
  { id: 'gap', name: 'Skill Gap', icon: AlertTriangle },
  { id: 'quality', name: 'Resume Quality', icon: Layers },
  { id: 'projects', name: 'Projects & Certs', icon: FolderKanban },
  { id: 'chat', name: 'Resume Assistant', icon: MessageSquareCode }
];

export default function AnalysisReport({ session_id, target_role, report }) {
  const [activeTab, setActiveTab] = useState('overview');
  const reportRef = useRef(null);

  // Smooth scroll to the report once generated
  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [report]);

  const { ats_score, summary, verdict } = report;

  const getVerdictStyle = (v) => {
    switch (v) {
      case 'Excellent Match':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Good Match':
        return 'bg-brand-indigo/10 text-brand-cyan border-brand-indigo/20';
      case 'Average Match':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Needs Improvement':
        default:
          return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div ref={reportRef} className="mx-auto max-w-7xl px-6 py-12">
      {/* Title */}
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white">CareerLens AI Report</h2>
        <p className="mt-1 text-sm text-gray-400">
          AI-powered resume evaluation completed successfully for <span className="text-brand-indigo font-semibold">{target_role}</span>.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20' 
                  : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Summary Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8 animate-float-none">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getVerdictStyle(verdict)}`}>
                    {verdict}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">Profile Overview</h3>
                  <p className="mt-4 text-gray-300 leading-relaxed text-sm">
                    {summary}
                  </p>
                </div>

                {/* Score badge in summary */}
                <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 px-8 py-6 text-center md:w-48">
                  <span className="text-sm font-medium text-gray-400">Overall Score</span>
                  <span className="mt-2 font-display text-5xl font-black text-white">{ats_score}%</span>
                  <span className="mt-2 text-xs text-gray-500">Scale of 0-100</span>
                </div>
              </div>
            </div>

            {/* General strengths card list */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass rounded-2xl p-6">
                <h4 className="flex items-center space-x-2 font-display font-semibold text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  {report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass rounded-2xl p-6">
                <h4 className="flex items-center space-x-2 font-display font-semibold text-white">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span>Suggestions Checklist</span>
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  {report.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-indigo"></span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ats' && (
          <ATSScoreCard 
            ats_score={ats_score} 
            breakdown={report.score_breakdown} 
            keyword_breakdown={report.keyword_breakdown}
          />
        )}

        {activeTab === 'gap' && (
          <SkillGap 
            missing_skills={report.missing_skills} 
            gap_analysis={report.skill_gap_analysis} 
          />
        )}

        {activeTab === 'quality' && (
          <ResumeQuality 
            quality={report.resume_quality_analysis} 
          />
        )}

        {activeTab === 'projects' && (
          <RecommendedProjects 
            projects={report.recommended_projects} 
            certifications={report.recommended_certifications}
          />
        )}

        {activeTab === 'chat' && (
          <ResumeAssistant 
            session_id={session_id} 
            target_role={target_role}
          />
        )}
      </div>
    </div>
  );
}
