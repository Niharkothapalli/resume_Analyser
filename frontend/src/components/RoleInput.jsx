import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';

const SUGGESTED_ROLES = [
  "Backend Developer",
  "Software Engineer",
  "Java Developer",
  "Data Engineer",
  "AI Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Frontend Developer",
  "Python Developer"
];

export default function RoleInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (role) => {
    onChange(role);
    setInputValue(role);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  // Filter recommendations based on current text input
  const filteredSuggestions = SUGGESTED_ROLES.filter(role => 
    role.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="w-full" ref={containerRef}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        Target Career Role
      </label>
      
      <div className="relative">
        {/* Left Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <Briefcase className="h-5 w-5" />
        </div>

        {/* Text Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. Backend Developer, AI Engineer..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-4.5 pr-12 pl-12 text-sm text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all duration-200 focus:border-brand-indigo/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-indigo/20"
        />

        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white"
        >
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Autocomplete Dropdown List */}
        {isOpen && (filteredSuggestions.length > 0 || inputValue) && (
          <div className="glass absolute z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-xl p-1.5 shadow-2xl backdrop-blur-xl">
            {filteredSuggestions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className="flex w-full items-center rounded-lg px-3.5 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                {role}
              </button>
            ))}
            {filteredSuggestions.length === 0 && inputValue && (
              <div className="px-3.5 py-2.5 text-xs text-gray-500 italic">
                Use custom role: "{inputValue}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
