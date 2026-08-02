import React from 'react';
import { Database, Search, Compass, ArrowRight, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PROCESS_STEPS = [
  "Resume",
  "Embedding",
  "Semantic Search",
  "RAG Retrieval",
  "AI Analysis",
  "Career Insights"
];

export default function FeaturesSection() {
  return (
    <div className="w-full space-y-28 pt-16 pb-0">
      {/* Retrieval Section */}
      <section id="retrieval" className="scroll-mt-24 space-y-16">
        <div className="text-center space-y-4">
          <span className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[0.65rem] uppercase tracking-[1.5px] text-white">
            Core Engine
          </span>
          <h2 className="font-['Syne'] font-extrabold text-4xl sm:text-5xl tracking-[-2px] text-white">
            Retrieval Reasoning
          </h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto font-light leading-relaxed">
            How CareerLens AI transforms unformatted PDF documents into structured career intelligence.
          </p>
        </div>

        {/* Minimal System Process Flow Visualization - Single Line Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-5 sm:p-6 max-w-[1020px] mx-auto border border-white/10"
        >
          <span className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold block mb-4 text-center">
            System Process Flow
          </span>
          <div className="flex flex-nowrap items-center justify-between gap-2.5 sm:gap-3 lg:gap-3.5 overflow-x-auto custom-scrollbar pb-1">
            {PROCESS_STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-[11px] sm:text-[12px] whitespace-nowrap shrink-0 hover:border-white/20 hover:text-white transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                  <span>{step}</span>
                </div>
                {idx < PROCESS_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 shrink-0 self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Retrieval Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-['Syne'] font-bold text-xl text-white">Resume Parsing</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              We process performance metrics, technical skill sets, and work experience. We filter out fluff to highlight verifiable proof of candidate impact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-['Syne'] font-bold text-xl text-white">Semantic Retrieval</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              Our FAISS RAG engine pulls exact contextual fragments from your past achievements to validate every career recommendation without hallucination.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-['Syne'] font-bold text-xl text-white">AI Recommendations</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              The system translates candidate background into an actionable strategic roadmap that specifies targeted project work and interview preparation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Clarity / Philosophy Section */}
      <section id="clarity" className="scroll-mt-24 space-y-16">
        <div className="text-center space-y-3">
          <span className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[0.65rem] uppercase tracking-[1.5px] text-white">
            The Philosophy
          </span>
          <h2 className="font-['Syne'] font-extrabold text-4xl sm:text-5xl tracking-[-2px] text-white">
            Escape the Pull
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left border-l-2 border-l-white/10"
          >
            <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-white/40 block">
              The Status Quo
            </span>
            <h3 className="font-['Syne'] font-bold text-xl text-white">Generic Resume Advice</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              Most online feedback is cookie-cutter and superficial. It prescribes identical generic advice without understanding individual candidate depth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left border-l-2 border-l-white/30"
          >
            <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-white/60 block">
              The CareerLens Shift
            </span>
            <h3 className="font-['Syne'] font-bold text-xl text-white">AI-Powered Intelligence</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              We leverage your actual domain experience. Our vector algorithms map missing keywords and highlight high-value achievements.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-8 sm:p-10 space-y-5 text-left border-l-2 border-l-white"
          >
            <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-white block">
              The Zero-G Result
            </span>
            <h3 className="font-['Syne'] font-bold text-xl text-white">Career Confidence</h3>
            <p className="text-white/45 text-sm leading-[1.7] font-light">
              Ground your career trajectory in empirical data. Obtain a precise spectrum of opportunity built directly upon your verified qualifications.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
