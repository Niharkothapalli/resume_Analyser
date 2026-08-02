import React from 'react';
import { 
  Award, ShieldCheck, Zap, AlertTriangle, Briefcase, FileText, CheckCircle2, 
  XCircle, TrendingUp, Sparkles, BookOpen, Layers, Check, ArrowRight
} from 'lucide-react';

export default function FullReportPDFView({ report, session_id, target_role }) {
  if (!report) return null;

  const atsScore = report.ats_score || 0;
  const verdict = report.verdict || 'Good Match';
  const summary = report.summary || 'Executive analysis completed successfully.';
  const scoreBreakdown = report.score_breakdown || {};
  const strengths = report.strengths || [];
  const missingSkills = report.missing_skills || [];
  const skillGaps = report.skill_gap_analysis || [];
  const qualityAnalysis = report.resume_quality_analysis || {};
  const suggestions = report.suggestions || [];
  const projects = report.recommended_projects || [];
  const certs = report.recommended_certifications || [];
  const keywords = report.keyword_breakdown || [];
  const interviewReadiness = report.interview_readiness || { score: 4, explanation: 'Strong technical preparation' };

  return (
    <div 
      id="pdf-full-report-container" 
      className="bg-[#121214] text-white p-8 font-sans space-y-12 max-w-[900px] mx-auto text-left border border-white/10 rounded-3xl"
    >
      {/* ================================================================== */}
      {/* SECTION 1: COVER PAGE                                             */}
      {/* ================================================================== */}
      <div className="min-h-[600px] flex flex-col justify-between p-8 bg-gradient-to-b from-[#1a1a1e] to-[#121214] rounded-2xl border border-white/10 page-break-after-always">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
            <div className="font-['Syne'] font-extrabold text-2xl tracking-[-1px] text-white flex items-center">
              <span>CAREERLENS</span>
              <span className="font-light text-xs tracking-wider text-white/60 ml-2 uppercase">AI</span>
            </div>
            <span className="text-xs font-mono bg-white/10 px-3.5 py-1.5 rounded-full text-white/80 border border-white/10">
              Session ID: {session_id?.slice(0, 8)}
            </span>
          </div>

          <div className="space-y-4 pt-8">
            <span className="inline-block bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest text-white/80">
              Official Evaluation Export
            </span>
            <h1 className="font-['Syne'] font-extrabold text-4xl sm:text-5xl tracking-tight text-white leading-tight">
              Executive ATS Resume &amp;<br />Career Intelligence Report
            </h1>
            <p className="text-white/60 text-sm max-w-xl font-light pt-2">
              Comprehensive multi-dimensional evaluation generated using Retrieval-Augmented Generation (RAG), dense vector search, and LLM orchestration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-12 border-t border-white/10 mt-auto">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-widest block mb-1 font-mono">Target Role</span>
            <span className="font-['Syne'] font-bold text-xl text-white">{target_role}</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/50 uppercase tracking-widest block mb-1 font-mono">ATS Match Score</span>
              <span className="font-['Syne'] font-extrabold text-3xl text-white">{atsScore} / 100</span>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
              {verdict}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: EXECUTIVE OVERVIEW                                     */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6 page-break-after-always">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 2: Executive Overview</h2>
            <span className="text-xs text-white/40 font-mono">Core Candidate Profile Audit</span>
          </div>
        </div>

        <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Executive AI Summary</h3>
          <p className="text-sm text-white/90 leading-relaxed font-light">{summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4ade80] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Candidate Strengths ({strengths.length})
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#4ade80] font-bold">&rarr;</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f87171] flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Key Missing Skills ({missingSkills.length})
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              {missingSkills.map((ms, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#f87171] font-bold">&bull;</span>
                  <span>{ms}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 3: ATS SCORE BREAKDOWN & KEYWORD MATCH                    */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6 page-break-after-always">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 3: ATS Score Breakdown</h2>
            <span className="text-xs text-white/40 font-mono">Algorithmic Scoring Matrix</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(scoreBreakdown).map(([cat, info], idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase tracking-wider">{cat.replace('_', ' ')}</span>
                <span className="font-mono text-white/80">{info.score} / {info.max}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(info.score / info.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/60 leading-normal pt-1 font-light">{info.explanation}</p>
            </div>
          ))}
        </div>

        {keywords.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Target Role Keyword Match Audit</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                    kw.found
                      ? 'bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {kw.found ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{kw.keyword}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: SKILL GAP ANALYSIS                                     */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6 page-break-after-always">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 4: Skill Gap Analysis</h2>
            <span className="text-xs text-white/40 font-mono">Target Role Skill Deficit Audit</span>
          </div>
        </div>

        <div className="space-y-4">
          {skillGaps.map((gap, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-white">{gap.skill}</h3>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Required Skill Deficit
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-white/80 font-light">
                <div>
                  <strong className="text-white block font-medium">Importance to Role:</strong>
                  <span>{gap.importance}</span>
                </div>
                <div>
                  <strong className="text-white block font-medium">Target Usage:</strong>
                  <span>{gap.usage}</span>
                </div>
              </div>
              <div className="text-xs text-[#4ade80] font-light pt-1 border-t border-white/5">
                <strong className="block font-medium">Recommended Learning Direction:</strong>
                <span>{gap.learning_direction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 5: RESUME QUALITY AUDIT                                   */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6 page-break-after-always">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 5: Resume Quality Audit</h2>
            <span className="text-xs text-white/40 font-mono">Structural & Formatting Audit</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-white/50 block uppercase">LinkedIn Link</span>
            <span className={`font-bold text-xs block mt-1 ${qualityAnalysis.linkedin_found ? 'text-[#4ade80]' : 'text-white/40'}`}>
              {qualityAnalysis.linkedin_found ? 'Verified' : 'Missing'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-white/50 block uppercase">GitHub Profile</span>
            <span className={`font-bold text-xs block mt-1 ${qualityAnalysis.github_found ? 'text-[#4ade80]' : 'text-white/40'}`}>
              {qualityAnalysis.github_found ? 'Verified' : 'Missing'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-white/50 block uppercase">Portfolio Link</span>
            <span className={`font-bold text-xs block mt-1 ${qualityAnalysis.portfolio_found ? 'text-[#4ade80]' : 'text-white/40'}`}>
              {qualityAnalysis.portfolio_found ? 'Verified' : 'Missing'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-white/50 block uppercase">Quantified Metrics</span>
            <span className={`font-bold text-xs block mt-1 ${qualityAnalysis.achievements_quantified ? 'text-[#4ade80]' : 'text-white/40'}`}>
              {qualityAnalysis.achievements_quantified ? 'Detected' : 'Needs Metrics'}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Actionable Formatting & Quality Fixes</h3>
          {suggestions.map((sug, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 flex items-start gap-2 font-light">
              <span className="text-white font-bold">&rarr;</span>
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 6: PROJECTS & CERTIFICATIONS                             */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6 page-break-after-always">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 6: Projects &amp; Certifications</h2>
            <span className="text-xs text-white/40 font-mono">Recommended Competency Enhancements</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Recommended Portfolio Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-white">{proj.title}</h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/80">
                    {proj.difficulty}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.tech_stack?.map((tech, tIdx) => (
                    <span key={tIdx} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {certs.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Recommended Certifications</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {certs.map((cert, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <h4 className="font-bold text-xs text-white">{cert.name}</h4>
                  <span className="text-[10px] text-white/50 uppercase block font-mono">{cert.provider}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SECTION 7 & 8: RESUME ASSISTANT & STRATEGIC DIRECTION            */}
      {/* ================================================================== */}
      <div className="p-8 rounded-2xl bg-[#18181c] border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-['Syne'] font-bold text-xl text-white">Section 7 &amp; 8: Assistant Grounding &amp; Career Roadmap</h2>
            <span className="text-xs text-white/40 font-mono">Strategic Readiness Assessment</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">RAG AI Assistant Grounding</h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Interactive session vector index active under FAISS storage ID <code className="font-mono text-white/90">{session_id?.slice(0, 8)}</code>.
              Queries submitted to the Resume Assistant are restricted to candidate's parsed credential blocks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Interview Readiness Score</h3>
            <div className="flex items-center gap-2">
              <span className="font-['Syne'] font-extrabold text-2xl text-white">{interviewReadiness.score}</span>
              <span className="text-white/60 text-xs">/ 5 ★</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light">{interviewReadiness.explanation}</p>
          </div>
        </div>

        {/* Footer Credit Line */}
        <div className="pt-6 border-t border-white/10 text-center text-[10px] text-white/40 uppercase font-mono tracking-widest">
          Report Generated by CareerLens AI &bull; Powered by Multi-Provider RAG Vector Engine
        </div>
      </div>
    </div>
  );
}
