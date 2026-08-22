import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  "Resume Uploaded",
  "Parsing Resume Structure",
  "Extracting Candidate Information",
  "Detecting Skills & Experience",
  "Creating Resume Embeddings",
  "Building FAISS Vector Index",
  "Retrieving Relevant Context",
  "Matching Against Target Role",
  "Calculating ATS Score",
  "Detecting Skill Gaps",
  "Generating Recommendations",
  "Creating Executive Summary",
  "Building Career Roadmap",
  "Preparing Resume Assistant",
  "Analysis Complete"
];

const AI_MESSAGES = [
  "Understanding your resume...",
  "Identifying technical skills & credentials...",
  "Reviewing professional work experience...",
  "Calculating ATS mathematical compatibility...",
  "Searching career knowledge base...",
  "Comparing candidate profile to role requirements...",
  "Building personalized skill gap recommendations...",
  "Preparing RAG career insights...",
  "Generating final evaluation report..."
];

export default function AITimelineLoader({ isAnalyzing, error, onRetry }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(5);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  // Lock document body and html scroll when analysis modal is active
  useEffect(() => {
    if (isAnalyzing || error) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [isAnalyzing, error]);

  useEffect(() => {
    if (!isAnalyzing || error) return;

    // Advance timeline stages smoothly
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    // Advance percentage smoothly
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 92) {
          return prev + Math.floor(Math.random() * 5) + 2;
        }
        return prev;
      });
    }, 450);

    // Rotate AI status messages
    const messageInterval = setInterval(() => {
      setAiMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
    }, 1800);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(countdownInterval);
    };
  }, [isAnalyzing, error]);

  // Complete timeline smoothly when done
  useEffect(() => {
    if (!isAnalyzing && currentStageIndex > 0 && !error) {
      setCurrentStageIndex(STAGES.length - 1);
      setProgressPercent(100);
      setSecondsRemaining(0);
    }
  }, [isAnalyzing, error]);

  if (!isAnalyzing && !error) return null;

  const modalMarkup = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)] overflow-hidden"
      >
        <div className="w-full max-w-xl my-auto glass-panel p-7 sm:p-9 border border-white/10 text-left space-y-6 shadow-[0_32px_96px_rgba(0,0,0,0.85)] relative z-[10000]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-['Syne'] font-extrabold text-lg text-white">AI Analysis Engine</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-sans">
                  Active Context Reasoning
                </p>
              </div>
            </div>
            {!error && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
                  <span>Est. Time: ≈ 8s</span>
                </span>
                <span className="text-[11px] font-mono text-white/80 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AI Confidence: <strong className="text-[#4ade80]">High</strong></span>
                </span>
              </div>
            )}
          </div>

          {/* Error Failure Handling */}
          {error ? (
            <div className="space-y-4 py-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Analysis Interrupted</span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 rounded-full font-['Syne'] font-extrabold text-xs tracking-widest uppercase bg-white text-[#121214] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Analysis</span>
              </button>
            </div>
          ) : (
            <>
              {/* Dynamic AI Status Message & Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-white/80 font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white/50 animate-spin" />
                    {AI_MESSAGES[aiMessageIndex]}
                  </span>
                  <span className="font-mono text-white/50">{progressPercent}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-white/40 via-white to-white/80 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Vertical Timeline List */}
              <div className="max-h-[280px] overflow-y-auto pr-2 space-y-2.5 pt-2 custom-scrollbar">
                {STAGES.map((stageName, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isLoading = idx === currentStageIndex;
                  const isPending = idx > currentStageIndex;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-center gap-3 text-xs p-2.5 rounded-xl transition-all ${
                        isLoading
                          ? 'bg-white/10 border border-white/20 text-white font-semibold'
                          : isCompleted
                          ? 'text-white/70'
                          : 'text-white/25'
                      }`}
                    >
                      {/* Icon state */}
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                      ) : isLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 flex items-center justify-center text-[9px] text-white/30 font-mono">
                          {idx + 1}
                        </div>
                      )}

                      <span className="truncate">{stageName}</span>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalMarkup, document.body);
}
