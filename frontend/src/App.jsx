import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AmbientBackground from './components/AmbientBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadPortal from './components/UploadPortal';
import ExecutiveReportPreview from './components/ExecutiveReportPreview';
import AITimelineLoader from './components/AITimelineLoader';
import AnalysisDashboard from './components/AnalysisDashboard';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import { History, X, Clock } from 'lucide-react';
import axios from 'axios';

// Configure optional dynamic base API URL for production deployment (e.g. Render backend)
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [applicationLevel, setApplicationLevel] = useState('fresher');
  const [sessionId, setSessionId] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const reportRef = useRef(null);

  // Auto-scroll smoothly to Executive AI Report Preview / Generated Report when analysis completes
  useEffect(() => {
    if (report && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [report]);

  // Perform upload to FastAPI backend
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError('');
    setParsedData(null);
    setSessionId('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSessionId(response.data.session_id);
      setParsedData(response.data.parsed_data);
      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please verify the backend service is running.');
      setSelectedFile(null);
      setSessionId('');
      setParsedData(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Perform AI Analysis call
  const handleAnalyze = async () => {
    if (!sessionId) {
      setError('Please upload your resume PDF first.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please specify your target job role.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/analyze', {
        session_id: sessionId,
        target_role: targetRole.trim(),
        application_level: applicationLevel
      });
      setReport(response.data.analysis);

      // Save to recent analyses list for UI readiness
      const newEntry = {
        id: sessionId,
        role: targetRole.trim(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: response.data.analysis.ats_score,
        verdict: response.data.analysis.verdict
      };
      setRecentAnalyses((prev) => [newEntry, ...prev.filter((item) => item.id !== sessionId)]);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Analysis failed. Please check backend model key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up and reset session
  const handleReset = async () => {
    if (sessionId) {
      try {
        await axios.delete(`/api/session/${sessionId}`);
      } catch (err) {
        console.warn('Could not delete session on server:', err);
      }
    }
    setSelectedFile(null);
    setTargetRole('');
    setSessionId('');
    setParsedData(null);
    setReport(null);
    setError('');
  };

  const handleSelectHistory = async (entry) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`/api/report/${entry.id}`);
      setSessionId(entry.id);
      setTargetRole(entry.role);
      setReport(response.data.analysis);
      setHistoryDrawerOpen(false);
    } catch (err) {
      console.error('History load error:', err);
      setError('Could not load selected report session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      <AmbientBackground />
      <Navbar onReset={handleReset} onOpenHistory={() => setHistoryDrawerOpen(true)} />

      {/* History Drawer */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-sm bg-[#18181c] border-l border-white/10 h-full p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/60" />
                  <h3 className="font-['Syne'] font-bold text-sm text-white">Recent Analyses</h3>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {recentAnalyses.length === 0 ? (
                  <p className="text-xs text-white/40 italic py-4">No recent sessions yet. Run an analysis to store history.</p>
                ) : (
                  recentAnalyses.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistory(item)}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white group-hover:text-white">{item.role}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                          {item.score}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-white/40">
                        <span>{item.date}</span>
                        <span className="uppercase tracking-wider">{item.verdict}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setHistoryDrawerOpen(false)}
              className="w-full py-2.5 text-xs font-mono uppercase bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              Close History
            </button>
          </motion.div>
        </div>
      )}

      <main className="relative z-10 pt-24 pb-8">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-4 space-y-20">
          {/* 1. Hero + Upload Portal Grid (Side-by-Side) */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Hero
                targetRole={targetRole}
                setTargetRole={setTargetRole}
                applicationLevel={applicationLevel}
                setApplicationLevel={setApplicationLevel}
                onAnalyze={handleAnalyze}
                selectedFile={selectedFile}
                isAnalyzing={isLoading}
              />
            </div>
            <div className="lg:col-span-5">
              <UploadPortal
                selectedFile={selectedFile}
                parsedData={parsedData}
                onFileSelect={handleFileSelect}
                onReset={handleReset}
                isUploading={isUploading}
                error={error}
              />
            </div>
          </div>

          {/* Conditional Layout Based On Analysis State */}
          {!report ? (
            /* BEFORE ANALYSIS */
            <FeaturesSection />
          ) : (
            /* AFTER ANALYSIS */
            <>
              <div ref={reportRef} className="scroll-mt-24 space-y-12">
                <ExecutiveReportPreview />

                <div id="analysisReport" className="pt-4">
                  <AnalysisDashboard
                    report={report}
                    session_id={sessionId}
                    targetRole={targetRole}
                    parsedData={parsedData}
                    selectedFile={selectedFile}
                    onReset={handleReset}
                  />
                </div>
              </div>

              <FeaturesSection />
            </>
          )}
        </div>

        {/* Loading Screen & Task Timeline Modal */}
        <AITimelineLoader
          isAnalyzing={isLoading}
          error={error}
          onRetry={handleAnalyze}
        />
      </main>

      <Footer />
    </div>
  );
}
