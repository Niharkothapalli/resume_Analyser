import React, { useState, useEffect } from "react";
import { History, Menu, X } from "lucide-react";
import axios from "axios";

export default function Navbar({ onOpenHistory }) {
  const [healthData, setHealthData] = useState({
    status: "checking",
    provider: "cohere",
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get("/api/health");
        setHealthData(response.data);
      } catch (err) {
        setHealthData({
          status: "offline",
          provider: "unknown",
        });
      }
    };

    checkHealth();

    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const isOnline = healthData.status === "healthy";



  return (
    <nav className="relative z-50 py-5 font-sans border-b border-white/5 bg-[#121214]/40 backdrop-blur-md">
      <div className="max-w-[1300px] mx-auto px-6 flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="group text-decoration-none flex items-center">
          <div className="font-['Syne'] font-extrabold text-2xl tracking-[-1.5px] text-white flex items-start">
            <span>CAREERLENS</span>
            <span className="font-light text-[0.6rem] tracking-wider text-white/60 ml-1.5 -mt-0.5 uppercase">
              AI
            </span>
          </div>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="systemStatus"
            className={`px-4 py-2 rounded-full text-xs font-['Syne'] font-bold tracking-[1.5px] uppercase transition-all duration-300 border bg-transparent flex items-center gap-2 ${
              isOnline
                ? "border-[#4ade80]/40 text-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                : "border-[#f87171]/40 text-[#f87171]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? "bg-[#4ade80] animate-pulse"
                  : "bg-[#f87171]"
              }`}
            />

            <span>
              {healthData.status === 'checking' ? 'Waking up...' : isOnline ? 'System: Online' : 'System: Offline'}
            </span>

            {isOnline && healthData.provider && (
              <span className="text-[10px] opacity-60 font-mono tracking-normal capitalize">
                ({healthData.provider})
              </span>
            )}
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-4 py-2 rounded-full text-xs font-['Syne'] uppercase tracking-[1.5px] text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-white/60" />
              <span>History</span>
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-4 pb-6 border-t border-white/5 bg-[#121214]/95 backdrop-blur-xl flex flex-col gap-3">
          <div className="py-2.5 px-4 rounded-full text-xs font-['Syne'] text-center border border-white/10 text-white/80 flex items-center justify-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? "bg-[#4ade80] animate-pulse"
                  : "bg-[#f87171]"
              }`}
            />

            <span>
              System: {isOnline ? "Online" : "Offline"} (
              {healthData.provider || "Unknown"})
            </span>
          </div>

          {onOpenHistory && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="w-full py-2.5 rounded-full text-xs font-['Syne'] uppercase tracking-[1.5px] text-white/80 bg-white/5 border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Recent Analyses</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}