import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FileText, Award, AlertTriangle, CheckCircle2, XCircle, Download,
  MessageSquare, Briefcase, Zap, ShieldCheck, ChevronRight, Layers, ArrowUpRight, BookOpen, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeAssistant from './ResumeAssistant';
import FullReportPDFView from './FullReportPDFView';

// Robust balanced-parentheses CSS color sanitizer that resolves nested oklab, oklch, color-mix, color() expressions
const parseCssColorToRgb = (cssText) => {
  if (!cssText || typeof cssText !== 'string') return cssText;
  if (!/(oklab|oklch|color-mix|color\()/i.test(cssText)) return cssText;

  let result = cssText;
  let iterations = 0;
  
  while (/(oklab|oklch|color-mix|color)\s*\(/i.test(result) && iterations < 100) {
    iterations++;
    const match = /(oklab|oklch|color-mix|color)\s*\(/i.exec(result);
    if (!match) break;

    const startIndex = match.index;
    const openParenIndex = startIndex + match[0].length - 1;

    let depth = 1;
    let endIndex = -1;
    for (let i = openParenIndex + 1; i < result.length; i++) {
      if (result[i] === '(') depth++;
      else if (result[i] === ')') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const fullExpr = result.substring(startIndex, endIndex + 1);
      let resolved = 'rgba(255, 255, 255, 0.1)';
      try {
        const dummy = document.createElement('div');
        dummy.style.color = fullExpr;
        document.body.appendChild(dummy);
        const comp = window.getComputedStyle(dummy).color;
        document.body.removeChild(dummy);
        if (comp && comp !== 'rgba(0, 0, 0, 0)') {
          resolved = comp;
        }
      } catch (e) {}

      result = result.substring(0, startIndex) + resolved + result.substring(endIndex + 1);
    } else {
      result = result.substring(0, startIndex) + 'rgba(255,255,255,0.1)' + result.substring(startIndex + match[0].length);
    }
  }

  return result;
};

export default function AnalysisDashboard({ session_id, target_role, targetRole, parsedData, selectedFile, report, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!report) return null;

  // Extract Target Role safely
  const getTargetRole = () => {
    const rawRole = target_role || targetRole || report?.target_role || report?.targetRole || '';
    const cleanRole = String(rawRole).trim();

    if (!cleanRole || /^(undefined|null|none|n\/a)$/i.test(cleanRole)) {
      return 'General Resume Analysis';
    }

    return cleanRole;
  };

  // Extract Candidate Name directly from uploaded filename without extension (.pdf, .docx, .doc)
  const getCandidateName = () => {
    const rawFileName = 
      selectedFile?.name || 
      report?.filename || 
      report?.file_name || 
      parsedData?.filename || 
      '';

    if (!rawFileName || typeof rawFileName !== 'string') {
      return 'Uploaded Resume';
    }

    // Remove file extension (.pdf, .docx, .doc, etc.)
    const cleanName = rawFileName.replace(/\.[^/.]+$/, '').trim();

    if (!cleanName || /^(undefined|null|none|n\/a)$/i.test(cleanName)) {
      return 'Uploaded Resume';
    }

    return cleanName;
  };

  const effectiveTargetRole = getTargetRole();
  const effectiveCandidateName = getCandidateName();

  // Extract structured report properties
  const atsScore = report.ats_score || 0;
  const verdict = report.verdict || 'Good Match';
  const summary = report.summary || 'Analysis successfully completed.';
  const scoreBreakdown = report.score_breakdown || {};
  const strengths = report.strengths || [];
  const missingSkills = report.missing_skills || [];
  const skillGaps = report.skill_gap_analysis || [];
  const qualityAnalysis = report.resume_quality_analysis || {};
  const suggestions = report.suggestions || [];
  const projects = report.recommended_projects || [];
  const certs = report.recommended_certifications || [];
  const keywords = report.keyword_breakdown || [];
  const interviewReadiness = report.interview_readiness || { score: 4, explanation: 'Good preparation' };

  // Export handlers
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `careerlens_report_${session_id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Direct text-based vector PDF export generated from analysis data/state (no html2canvas / no screenshots)
  const handleDownloadPDF = async () => {
    console.log("PDF Step 1 - PDF Report button clicked");
    setIsExportingPDF(true);

    try {
      console.log("PDF Step 2 - Collecting analysis data");
      if (!report) {
        throw new Error("Analysis report data is unavailable.");
      }

      console.log("PDF Step 3 - Loading jsPDF engine");
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 40;
      const marginTop = 45;
      const marginBottom = 50;
      const contentWidth = pageWidth - marginX * 2;
      const maxY = pageHeight - marginBottom;

      let y = marginTop;

      const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > maxY) {
          pdf.addPage();
          y = marginTop;
        }
      };

      const addHeader = () => {
        // 1. "CareerLens AI" - Largest text, Bold, Center aligned
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.setTextColor(17, 24, 39);
        pdf.text("CareerLens AI", pageWidth / 2, y, { align: 'center' });
        y += 24;

        // 2. "AI Resume Intelligence Report" - Slightly smaller, Semi-bold, Center aligned
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13.5);
        pdf.setTextColor(55, 65, 81);
        pdf.text("AI Resume Intelligence Report", pageWidth / 2, y, { align: 'center' });
        y += 18;

        // 3. "Designed & Developed by Nihar Kothapalli" - Small (10.5pt), Italic, Gray (#6B7280), Center aligned
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10.5);
        pdf.setTextColor(107, 114, 128);
        pdf.text("Designed & Developed by Nihar Kothapalli", pageWidth / 2, y, { align: 'center' });
        y += 20;

        // Divider Line
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(1);
        pdf.line(marginX, y, pageWidth - marginX, y);
        y += 22;
      };

      const addSectionTitle = (title) => {
        checkPageBreak(35);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(17, 24, 39);
        pdf.text(title, marginX, y);
        y += 6;
        pdf.setDrawColor(209, 213, 219);
        pdf.setLineWidth(0.75);
        pdf.line(marginX, y, pageWidth - marginX, y);
        y += 15;
      };

      const addParagraph = (text, isBold = false, fontSize = 10, color = [55, 65, 81]) => {
        if (!text) return;
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(String(text), contentWidth);
        const textHeight = lines.length * (fontSize + 4);
        checkPageBreak(textHeight);
        pdf.text(lines, marginX, y);
        y += textHeight + 4;
      };

      const addBulletPoint = (text, isBold = false, fontSize = 10) => {
        if (!text) return;
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(55, 65, 81);
        const bulletPrefix = "• ";
        const indent = 15;
        const lines = pdf.splitTextToSize(String(text), contentWidth - indent);
        const textHeight = lines.length * (fontSize + 4);
        checkPageBreak(textHeight);
        pdf.text(bulletPrefix, marginX, y);
        pdf.text(lines, marginX + indent, y);
        y += textHeight + 4;
      };

      const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      console.log("PDF Step 4 - Writing text sections");

      // 1. Header
      addHeader();

      // 2. Candidate Information
      addSectionTitle("1. Candidate Information");
      addParagraph(`Uploaded Resume: ${effectiveCandidateName}`, true);
      addParagraph(`Target Role: ${effectiveTargetRole}`, true);
      addParagraph(`Generated Date: ${formattedDate}`);
      addParagraph(`Session ID: ${session_id ? session_id.slice(0, 8) : 'N/A'}`);
      y += 10;

      // 3. Executive Summary
      addSectionTitle("2. Executive Summary");
      addParagraph(summary);
      y += 10;

      // 4. ATS Score
      addSectionTitle("3. ATS Score Breakdown");
      addParagraph(`Overall ATS Match Score: ${atsScore} / 100 (${verdict})`, true, 11, [17, 24, 39]);
      y += 4;
      Object.entries(scoreBreakdown).forEach(([cat, info]) => {
        const catName = cat.replace(/_/g, ' ').toUpperCase();
        addParagraph(`${catName}: ${info.score} / ${info.max}`, true);
        if (info.explanation) addParagraph(info.explanation, false, 9, [107, 114, 128]);
      });
      if (keywords.length > 0) {
        y += 4;
        addParagraph("Target Role Keyword Match Audit:", true);
        const foundKw = keywords.filter(k => k.found).map(k => k.keyword).join(', ');
        const missingKw = keywords.filter(k => !k.found).map(k => k.keyword).join(', ');
        if (foundKw) addBulletPoint(`Identified Keywords: ${foundKw}`);
        if (missingKw) addBulletPoint(`Missing Keywords: ${missingKw}`);
      }
      y += 10;

      // 5. Resume Quality
      addSectionTitle("4. Resume Quality Audit");
      addBulletPoint(`LinkedIn Profile Link: ${qualityAnalysis.linkedin_found ? 'Verified' : 'Not Detected'}`);
      addBulletPoint(`GitHub Profile Link: ${qualityAnalysis.github_found ? 'Verified' : 'Not Detected'}`);
      addBulletPoint(`Portfolio Link: ${qualityAnalysis.portfolio_found ? 'Verified' : 'Not Detected'}`);
      addBulletPoint(`Quantified Impact Metrics: ${qualityAnalysis.achievements_quantified ? 'Present & Verified' : 'Needs Quantitative Impact Metrics'}`);
      if (suggestions.length > 0) {
        y += 4;
        addParagraph("Actionable Quality Suggestions:", true);
        suggestions.forEach(sug => addBulletPoint(sug));
      }
      y += 10;

      // 6. Candidate Strengths
      addSectionTitle("5. Candidate Strengths");
      if (strengths.length === 0) {
        addParagraph("No specific strengths recorded.");
      } else {
        strengths.forEach(str => addBulletPoint(str));
      }
      y += 10;

      // 7. Skill Gap Analysis
      addSectionTitle("6. Skill Gap Analysis");
      if (missingSkills.length > 0) {
        addParagraph(`Key Missing Skills: ${missingSkills.join(', ')}`, true);
        y += 4;
      }
      if (skillGaps.length > 0) {
        skillGaps.forEach(gap => {
          addParagraph(`Skill: ${gap.skill}`, true);
          if (gap.importance) addParagraph(`  • Importance: ${gap.importance}`, false, 9);
          if (gap.usage) addParagraph(`  • Target Usage: ${gap.usage}`, false, 9);
          if (gap.learning_direction) addParagraph(`  • Learning Direction: ${gap.learning_direction}`, false, 9);
          y += 4;
        });
      }
      y += 10;

      // 8. Projects & Certifications Recommendations
      addSectionTitle("7. Recommended Projects & Certifications");
      if (projects.length > 0) {
        addParagraph("Recommended Portfolio Projects:", true);
        projects.forEach(proj => {
          addParagraph(`${proj.title} [Difficulty: ${proj.difficulty || 'Medium'}]`, true);
          if (proj.description) addParagraph(proj.description, false, 9);
          if (proj.tech_stack) addParagraph(`Tech Stack: ${proj.tech_stack.join(', ')}`, false, 9, [107, 114, 128]);
          y += 4;
        });
      }
      if (certs.length > 0) {
        y += 4;
        addParagraph("Recommended Certifications:", true);
        certs.forEach(cert => {
          addBulletPoint(`${cert.name} (Provider: ${cert.provider || 'N/A'})`);
        });
      }
      y += 10;

      // 9. Resume Assistant Recommendations
      addSectionTitle("8. Resume Assistant Recommendations");
      addParagraph(`Interview Readiness Rating: ${interviewReadiness.score} / 5`, true);
      addParagraph(interviewReadiness.explanation || "Utilize the interactive Resume Assistant chat interface to refine bullet points and align qualifications with job descriptions.");
      y += 10;

      // 10. Strategic Next Career Direction
      addSectionTitle("9. Strategic Next Career Direction");
      addParagraph(
        `Targeting the ${
          effectiveTargetRole &&
          effectiveTargetRole !== 'General Resume Analysis' &&
          !/^(undefined|null|none|n\/a)$/i.test(effectiveTargetRole)
            ? `${effectiveTargetRole} position`
            : 'desired position'
        } requires grounding career progression in empirical technical evidence.`
      );
      addParagraph(`Focus on addressing the ${missingSkills.length} critical skill gaps identified above and implementing at least 1 recommended high-impact project.`);
      y += 10;

      // 11. Final Action Plan
      addSectionTitle("10. Final Action Plan");
      addBulletPoint(`Step 1: Integrate missing keywords (${missingSkills.slice(0, 5).join(', ')}) into experience bullet points.`);
      addBulletPoint(`Step 2: Add quantified metrics (percentages, dollar amounts, scale) to key work achievements.`);
      addBulletPoint(`Step 3: Complete project implementation for ${projects[0]?.title || 'recommended portfolio project'}.`);
      addBulletPoint(`Step 4: Update LinkedIn and GitHub profile links to ensure 100% ATS audit compliance.`);

      console.log("PDF Step 5 - Adding page numbers and footer");
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.75);
        pdf.line(marginX, pageHeight - 35, pageWidth - marginX, pageHeight - 35);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text("Generated by CareerLens AI", marginX, pageHeight - 20);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 20, { align: 'right' });
      }

      console.log("PDF Step 6 - Downloading PDF file");
      const filename = `CareerLens_AI_Full_Report_${session_id ? session_id.slice(0, 8) : 'export'}.pdf`;
      pdf.save(filename);
      console.log("PDF Export Complete!");
    } catch (err) {
      console.error("PDF Export Failed", err);
      alert(`PDF Export Failed: ${err.message || err}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Verdict badge colors
  const getVerdictStyle = (v) => {
    if (v.includes('Excellent')) return 'bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]';
    if (v.includes('Good')) return 'bg-white/10 border-white/20 text-white';
    if (v.includes('Average')) return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
    return 'bg-rose-500/15 border-rose-500/40 text-rose-400';
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'ats', label: 'ATS Score', icon: Award },
    { id: 'gap', label: 'Skill Gap', icon: AlertTriangle },
    { id: 'quality', label: 'Resume Quality', icon: ShieldCheck },
    { id: 'projects', label: 'Projects & Certs', icon: Briefcase },
    { id: 'chat', label: 'Resume Assistant', icon: MessageSquare },
  ];

  const dashboardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const dashboardItemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 py-10 space-y-8"
    >
      {/* Executive Summary Header */}
      <motion.div variants={dashboardItemVariants} className="glass-panel-report p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[2px] text-white/58 font-bold">
                Executive Analysis Report
              </span>
              <span className="text-[10px] text-white/58">&bull; Session: {session_id.slice(0, 8)}</span>
            </div>
            <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-white/98">
              Target Role: <span className="underline decoration-white/20 underline-offset-4">{effectiveTargetRole}</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 no-print">
            <span className={`px-4 py-1.5 rounded-full text-xs font-['Syne'] font-bold border uppercase tracking-wider ${getVerdictStyle(verdict)}`}>
              {verdict}
            </span>
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 rounded-full text-xs font-['Syne'] uppercase tracking-wider text-white/82 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-full text-xs font-['Syne'] uppercase tracking-wider text-[#121214] bg-white font-extrabold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPDF ? 'Generating PDF...' : 'PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Header Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-left">
          <motion.div variants={dashboardItemVariants} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/5">
            <span className="text-[10px] text-white/58 uppercase tracking-widest block mb-1">ATS Match Score</span>
            <span className="font-['Syne'] font-extrabold text-3xl text-white/98">{atsScore}/100</span>
          </motion.div>

          <motion.div variants={dashboardItemVariants} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/5">
            <span className="text-[10px] text-white/58 uppercase tracking-widest block mb-1">Interview Readiness</span>
            <div className="flex items-center gap-1">
              <span className="font-['Syne'] font-extrabold text-3xl text-white/98">{interviewReadiness.score}</span>
              <span className="text-white/58 text-sm">/ 5 ★</span>
            </div>
          </motion.div>

          <motion.div variants={dashboardItemVariants} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/5">
            <span className="text-[10px] text-white/58 uppercase tracking-widest block mb-1">Identified Strengths</span>
            <span className="font-['Syne'] font-extrabold text-3xl text-[#4ade80]">{strengths.length}</span>
          </motion.div>

          <motion.div variants={dashboardItemVariants} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/5">
            <span className="text-[10px] text-white/58 uppercase tracking-widest block mb-1">Critical Skill Gaps</span>
            <span className="font-['Syne'] font-extrabold text-3xl text-[#f87171]">{missingSkills.length}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation Menu */}
      <motion.div variants={dashboardItemVariants} className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-print custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full text-xs font-['Syne'] uppercase tracking-[1.5px] whitespace-nowrap transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white text-[#121214] font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Animated Tab Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6 text-left"
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="glass-panel-report p-6 sm:p-8 space-y-4">
                <h3 className="font-['Syne'] font-bold text-xl text-white/98 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-white/80" />
                  <span>Executive AI Summary</span>
                </h3>
                <p className="text-white/82 text-sm leading-relaxed font-normal">{summary}</p>
              </div>

              {/* Strengths & Key Missing Skills Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel-report p-6 space-y-4">
                  <h4 className="font-['Syne'] font-bold text-sm uppercase tracking-wider text-[#4ade80] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Strengths ({strengths.length})</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-white/82">
                    {strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 bg-[#0e0e10]/80 p-3 rounded-xl border border-white/5">
                        <span className="text-[#4ade80] font-bold">&rarr;</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel-report p-6 space-y-4">
                  <h4 className="font-['Syne'] font-bold text-sm uppercase tracking-wider text-[#f87171] flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>Key Missing Skills ({missingSkills.length})</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-white/82">
                    {missingSkills.map((ms, i) => (
                      <li key={i} className="flex items-start gap-2 bg-[#0e0e10]/80 p-3 rounded-xl border border-white/5">
                        <span className="text-[#f87171] font-bold">&bull;</span>
                        <span>{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Next Steps */}
              <div className="glass-panel-report p-6 space-y-4">
                <h4 className="font-['Syne'] font-bold text-sm uppercase tracking-wider text-white/98 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-white/80" />
                  <span>Strategic Next Career Direction</span>
                </h4>
                <p className="text-white/82 text-xs leading-relaxed font-normal">
                  {interviewReadiness.explanation || 'Focus on implementing projects targeting your identified missing skills to achieve complete ATS alignment.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-6 py-3 rounded-full font-['Syne'] font-bold text-xs uppercase tracking-wider bg-white/10 text-white/98 hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                  >
                    <span>Switch to Deep-Dive Chat Assistant &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATS SCORE */}
          {activeTab === 'ats' && (
            <div className="space-y-6">
              <div className="glass-panel-report p-6 sm:p-8 space-y-6">
                <h3 className="font-['Syne'] font-bold text-xl text-white/98">Algorithmic ATS Breakdown</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(scoreBreakdown).map(([cat, info], idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white/98 uppercase tracking-wider">{cat.replace('_', ' ')}</span>
                        <span className="font-mono text-white/82 font-semibold">{info.score} / {info.max}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${(info.score / info.max) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-white/58 leading-relaxed font-normal pt-1">{info.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Role Keyword Match Table */}
              {keywords.length > 0 && (
                <div className="glass-panel-report p-6 space-y-4">
                  <h4 className="font-['Syne'] font-bold text-sm uppercase tracking-wider text-white/98">Target Role Keyword Match</h4>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {keywords.map((kw, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                          kw.found
                            ? 'bg-[#4ade80]/15 border-[#4ade80]/35 text-[#4ade80]'
                            : 'bg-white/5 border-white/10 text-white/58'
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
          )}

          {/* TAB 3: SKILL GAP */}
          {activeTab === 'gap' && (
            <div className="space-y-6">
              <div className="glass-panel-report p-6 space-y-4">
                <h3 className="font-['Syne'] font-bold text-xl text-white/98">Deep-Dive Skill Gap Analysis</h3>
                <p className="text-white/58 text-xs font-normal">
                  Direct comparison of candidate skills against requirements for {target_role}.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {skillGaps.map((gap, idx) => (
                  <div key={idx} className="glass-panel-report p-6 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h4 className="font-['Syne'] font-bold text-base text-white/98">{gap.skill}</h4>
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        Required Gap
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-white/82 font-normal">
                      <div className="bg-[#0e0e10]/80 p-3 rounded-xl border border-white/5">
                        <strong className="text-white/98 block font-medium">Why it Matters:</strong>
                        <span>{gap.importance}</span>
                      </div>
                      <div className="bg-[#0e0e10]/80 p-3 rounded-xl border border-white/5">
                        <strong className="text-white/98 block font-medium">Target Role Usage:</strong>
                        <span>{gap.usage}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <strong className="text-[#4ade80] block font-medium">Suggested Learning Path:</strong>
                        <span>{gap.learning_direction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESUME QUALITY */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="glass-panel-report p-6 space-y-6">
                <h3 className="font-['Syne'] font-bold text-xl text-white/98">Resume Quality Audit</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 text-center">
                    <span className="text-[10px] text-white/58 block uppercase">LinkedIn Profile</span>
                    <span className={`font-bold text-sm block mt-1 ${qualityAnalysis.linkedin_found ? 'text-[#4ade80]' : 'text-white/58'}`}>
                      {qualityAnalysis.linkedin_found ? 'Found' : 'Not Detected'}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 text-center">
                    <span className="text-[10px] text-white/58 block uppercase">GitHub Profile</span>
                    <span className={`font-bold text-sm block mt-1 ${qualityAnalysis.github_found ? 'text-[#4ade80]' : 'text-white/58'}`}>
                      {qualityAnalysis.github_found ? 'Found' : 'Not Detected'}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 text-center">
                    <span className="text-[10px] text-white/58 block uppercase">Portfolio Link</span>
                    <span className={`font-bold text-sm block mt-1 ${qualityAnalysis.portfolio_found ? 'text-[#4ade80]' : 'text-white/58'}`}>
                      {qualityAnalysis.portfolio_found ? 'Found' : 'Not Detected'}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 text-center">
                    <span className="text-[10px] text-white/58 block uppercase">Quantified Impact</span>
                    <span className={`font-bold text-sm block mt-1 ${qualityAnalysis.achievements_quantified ? 'text-[#4ade80]' : 'text-white/58'}`}>
                      {qualityAnalysis.achievements_quantified ? 'Present' : 'Needs Metrics'}
                    </span>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-['Syne'] font-bold text-sm uppercase tracking-wider text-white/98">Actionable Quality Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.map((sug, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#0e0e10]/80 border border-white/5 text-xs text-white/82 flex items-start gap-2">
                        <span className="text-white/98 font-bold">&rarr;</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS & CERTIFICATIONS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="glass-panel-report p-6 space-y-4">
                <h3 className="font-['Syne'] font-bold text-xl text-white/98">Recommended Projects to Close Gaps</h3>
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-[#0e0e10]/80 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-['Syne'] font-bold text-base text-white/98">{proj.title}</h4>
                        <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/98">
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-white/82 leading-relaxed font-normal">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tech_stack?.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/58">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Certifications */}
              {certs.length > 0 && (
                <div className="glass-panel-report p-6 space-y-4">
                  <h3 className="font-['Syne'] font-bold text-xl text-white/98">Recommended Certifications</h3>
                  <div className="grid sm:grid-cols-3 gap-4 pt-2">
                    {certs.map((cert, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#0e0e10]/80 border border-white/10 space-y-2">
                        <h4 className="font-['Syne'] font-bold text-sm text-white/98">{cert.name}</h4>
                        <span className="text-[10px] text-white/58 block uppercase">{cert.provider}</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cert.skills_covered?.map((s, sIdx) => (
                            <span key={sIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/58">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RESUME ASSISTANT (CHAT) */}
          {activeTab === 'chat' && (
            <div className="glass-panel-report p-4 sm:p-6 border border-white/10 min-h-[500px] flex flex-col">
              <ResumeAssistant session_id={session_id} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
