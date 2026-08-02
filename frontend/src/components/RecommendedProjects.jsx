import React from 'react';
import { Layers, Lightbulb, BadgeCheck, Code, Award } from 'lucide-react';

export default function RecommendedProjects({ projects, certifications }) {
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'intermediate':
        return 'bg-brand-indigo/10 text-brand-cyan border-brand-indigo/20';
      case 'beginner':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Projects Grid */}
      <div>
        <h3 className="flex items-center space-x-2 font-display text-lg font-semibold text-white mb-4">
          <Lightbulb className="h-5 w-5 text-brand-cyan" />
          <span>Upskilling Project Recommendations</span>
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Close your skills gap by building these projects, which are specifically selected to cover missing competencies required for your target role.
        </p>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center text-gray-500">
            No projects needed! Your current skills cover all role requirements.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, i) => (
              <div key={i} className="glass-card hover:border-glow flex flex-col justify-between rounded-2xl p-6 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-white text-base">{project.title}</h4>
                    <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>
                  
                  <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="flex items-center space-x-1 text-gray-400 mb-2">
                    <Code className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech, j) => (
                      <span 
                        key={j} 
                        className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div className="border-t border-white/5 pt-8">
        <h3 className="flex items-center space-x-2 font-display text-lg font-semibold text-white mb-4">
          <Award className="h-5 w-5 text-brand-purple" />
          <span>Industry Certifications Path</span>
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Earning these certifications will validate your skills and significantly boost your resume value for recruiters.
        </p>

        {certifications.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center text-gray-500">
            No certifications recommended. Your profile credentials look complete.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {certifications.map((cert, i) => (
              <div key={i} className="glass flex flex-col justify-between rounded-2xl p-5 border border-white/5 bg-white/2">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple">
                    <Award className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display font-semibold text-white text-sm leading-snug">{cert.name}</h4>
                  <p className="mt-1 text-xs text-gray-500">Provider: {cert.provider}</p>
                </div>

                <div className="mt-5 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">SKILLS COVERED</span>
                  <div className="flex flex-wrap gap-1">
                    {cert.skills_covered.map((skill, j) => (
                      <span 
                        key={j} 
                        className="rounded-full bg-brand-purple/5 border border-brand-purple/10 px-2 py-0.5 text-[9px] font-medium text-brand-purple"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
