import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export default function ResumeQuality({ quality }) {
  const {
    linkedin_found,
    github_found,
    portfolio_found,
    achievements_quantified,
    resume_length_pages,
    recommendations
  } = quality;

  const checks = [
    { label: 'LinkedIn Profile Link', status: linkedin_found, detail: 'Used to verify candidate identity and job history.' },
    { label: 'GitHub Repository Link', status: github_found, detail: 'Crucial for developers to show code history and contributions.' },
    { label: 'Portfolio/Website Link', status: portfolio_found, detail: 'Useful for showcasing project hosting and design skills.' },
    { label: 'Quantified Metric Achievements', status: achievements_quantified, detail: 'Checks for performance statistics like %, $, or time values.' },
    { label: 'Resume Size/Length Constraint', status: resume_length_pages <= 2, detail: `Length should be within 1-2 pages. Found: ${resume_length_pages} page(s).` }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Formatting checklist */}
        <div className="glass rounded-2xl p-6">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Structure and Formatting Verification</h4>
          <p className="text-xs text-gray-500 mb-6">
            We scan document sections and metadata links to ensure compatibility with modern ATS requirements.
          </p>
          
          <div className="space-y-4">
            {checks.map((check, i) => (
              <div key={i} className="flex items-start space-x-3 rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="mt-0.5 shrink-0">
                  {check.status ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{check.label}</div>
                  <p className="mt-0.5 text-xs text-gray-400">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality actions recommendations */}
        <div className="glass rounded-2xl p-6">
          <h4 className="font-display font-semibold text-white text-sm mb-4">Actionable Formatting Suggestions</h4>
          <p className="text-xs text-gray-500 mb-6">
            Follow these concrete recommendations to optimize the visual presentation and scanner parsing rates.
          </p>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center text-sm font-semibold text-emerald-400">
              Your resume follows excellent structure and format guidelines!
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-sm text-gray-400">
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-indigo" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
