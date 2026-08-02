import React, { useRef, useState, useEffect } from 'react';
import { Upload, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function UploadPortal({
  selectedFile,
  parsedData,
  onFileSelect,
  onReset,
  isUploading,
  error
}) {
  const portalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mouse tilt effect matching design reference
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!portalRef.current) return;
      const x = (window.innerWidth / 2 - e.pageX) / 80;
      const y = (window.innerHeight / 2 - e.pageY) / 80;
      portalRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div
      ref={portalRef}
      id="portalContainer"
      className="glass-panel min-h-[520px] flex flex-col justify-center items-center text-center p-8 sm:p-10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] relative transition-transform duration-200 ease-out"
    >
      {/* Top Left Floater - Informational Only */}
      <div className="floater glass-panel f1 hidden lg:block text-left pointer-events-none">
        <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-[1.5px] border border-white/10 mb-2 text-white">
          {selectedFile ? 'Active Ingest' : 'Analysis'}
        </div>
        <div className="font-bold text-white text-xs truncate max-w-[180px]">
          {selectedFile ? selectedFile.name : 'Ready to Ingest'}
        </div>
        <span className="text-white/50 text-[0.65rem] block mt-0.5">
          {selectedFile ? 'PDF Stream Received' : 'Awaiting PDF stream...'}
        </span>
      </div>

      {/* Bottom Right Floater - Informational Only */}
      <div className="floater glass-panel f2 hidden lg:block text-left pointer-events-none">
        <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-[1.5px] border border-white/10 mb-2 text-white">
          {parsedData ? 'Verified' : 'Gap Found'}
        </div>
        <div className="font-bold text-white text-xs">
          {parsedData ? `${parsedData.skills?.length || 0} Skills Segmented` : 'Strategic Ops'}
        </div>
        <span className="text-white/50 text-[0.65rem] block mt-0.5">
          {parsedData ? 'Vector Index Ready' : 'Priority: Critical'}
        </span>
      </div>

      {/* Upload & Visual Status Container */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-6 z-10">
        {!selectedFile ? (
          <>
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-36 h-36 rounded-full border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.08] hover:border-white ${
                isDragging ? 'border-white bg-white/10 scale-105' : 'border-white/15'
              }`}
            >
              {isUploading ? (
                <div className="spinner" />
              ) : (
                <Upload className="w-10 h-10 text-white/30 group-hover:text-white transition-colors" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-['Syne'] font-bold text-xl text-white">
                {isUploading ? 'Indexing Proof...' : 'Upload Your Resume'}
              </h3>
              <p className="text-white/45 text-xs font-light">
                Drag & Drop PDF resume or click to browse
              </p>
              <div className="text-[10px] text-white/30 tracking-wider uppercase pt-1">
                Format: PDF &nbsp;|&nbsp; Max Size: 10MB
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            />
          </>
        ) : (
          /* File Uploaded & Visual Metadata Status Panel */
          <div className="w-full space-y-5 animate-fadeIn">
            {/* File Chip */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-white/70 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{selectedFile.name}</div>
                  <div className="text-[10px] text-white/40">{(selectedFile.size / 1024).toFixed(1)} KB &bull; PDF Stream Verified</div>
                </div>
              </div>
              <button
                onClick={onReset}
                className="text-xs text-white/40 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/10 cursor-pointer"
                title="Change File"
              >
                Change
              </button>
            </div>

            {/* Parsed Metadata Card */}
            {parsedData && (
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4ade80] text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Structure Segmented</span>
                  </div>
                  <span className="text-[10px] text-white/40 uppercase font-mono">FAISS Indexed</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-white/40 block">Candidate Name</span>
                    <span className="font-bold text-white truncate block">{parsedData.name || 'Detected'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Detected Skills</span>
                    <span className="font-bold text-white block">{parsedData.skills?.length || 0} skills</span>
                  </div>
                </div>

                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1.5">Skills Preview</span>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.skills.slice(0, 6).map((sk, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/60">
                          {sk}
                        </span>
                      ))}
                      {parsedData.skills.length > 6 && (
                        <span className="text-[9px] text-white/30 self-center">
                          +{parsedData.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="w-full p-3 rounded-2xl bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
