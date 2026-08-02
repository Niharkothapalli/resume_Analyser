import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ResumeUpload({ selectedFile, onFileSelect, onClear }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const simulateProgress = (file) => {
    setError('');
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onFileSelect(file);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
      setError("Invalid format. Please upload PDF files only.");
      return;
    }
    simulateProgress(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  const handleClear = () => {
    setUploadProgress(0);
    onClear();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!selectedFile && uploadProgress === 0 ? triggerInput : undefined}
        className={`glass relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 transition-all duration-300 ${
          isDragActive
            ? 'border-brand-cyan bg-brand-indigo/5 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        }`}
      >
        {selectedFile ? (
          /* File Loaded State */
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-white">{selectedFile.name}</p>
            <p className="mt-1 text-xs text-gray-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; PDF Resume Loaded
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="mt-4 flex items-center space-x-1 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              <span>Change File</span>
            </button>
          </div>
        ) : uploadProgress > 0 && uploadProgress < 100 ? (
          /* Upload Progress State */
          <div className="w-full max-w-xs flex flex-col items-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-indigo border-t-transparent"></div>
            <p className="mt-4 text-sm font-medium text-white">Uploading & scanning resume...</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-indigo to-brand-cyan transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="mt-1.5 text-xs text-gray-500">{uploadProgress}%</span>
          </div>
        ) : (
          /* Upload Prompt State */
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gray-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Upload your resume</h3>
            <p className="mt-1.5 text-xs leading-normal text-gray-400 max-w-[240px]">
              Drag and drop your PDF resume here, or <span className="text-brand-indigo underline font-medium">browse local files</span>
            </p>
            <span className="mt-4 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
              PDF files only (Max 10MB)
            </span>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 flex items-center space-x-1.5 text-xs text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
