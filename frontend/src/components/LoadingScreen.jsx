import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileSearch, Sparkles, Database } from 'lucide-react';

const LOADING_STEPS = [
  { message: "Extracting resume plain text...", icon: FileSearch },
  { message: "Chunking document and generating sentence embeddings...", icon: Database },
  { message: "Indexing vector embeddings in FAISS local database...", icon: Database },
  { message: "Performing semantic RAG retrieval for target role...", icon: Sparkles },
  { message: "Computing weighted scoring breakdowns (Python engine)...", icon: Sparkles },
  { message: "Formulating context and invoking Gemini client report generation...", icon: Sparkles }
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500); // Progress step every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const IconComponent = LOADING_STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-bg/90 backdrop-blur-lg">
      <div className="w-full max-w-md px-6 text-center">
        {/* Glowing scanning card mock */}
        <div className="relative mx-auto mb-10 h-44 w-32 overflow-hidden rounded-xl border border-brand-indigo/30 bg-indigo-950/20 shadow-2xl border-glow">
          <div className="scanner-line"></div>
          <div className="flex h-full w-full flex-col items-center justify-center space-y-2 text-brand-indigo/40">
            <FileSearch className="h-10 w-10 animate-pulse text-brand-indigo" />
            <span className="text-[10px] tracking-widest uppercase">SCANNING</span>
          </div>
        </div>

        {/* Text and current stage */}
        <h2 className="font-display text-2xl font-bold text-white">Analyzing Your Profile</h2>
        <p className="mt-2 text-sm text-gray-400">
          This takes a few seconds while we build the semantic index.
        </p>

        {/* Current status line */}
        <div className="mt-8 flex items-center justify-center space-x-3 rounded-2xl border border-white/5 bg-white/5 p-4">
          <IconComponent className="h-5 w-5 text-brand-cyan animate-pulse" />
          <span className="text-sm font-medium text-gray-200">
            {LOADING_STEPS[currentStep].message}
          </span>
        </div>

        {/* Progress Dots */}
        <div className="mt-8 flex justify-center space-x-1.5">
          {LOADING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-4 bg-brand-indigo'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-white/10'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
