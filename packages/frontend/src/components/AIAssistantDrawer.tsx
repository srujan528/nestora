'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  HiSparkles,
  HiXMark,
  HiMapPin,
  HiCalculator,
  HiCheckCircle,
  HiExclamationTriangle,
  HiArrowRight,
  HiPaperAirplane,
  HiArrowPath,
  HiArrowLeft,
} from 'react-icons/hi2';
import { useTRPC } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollegeId?: number;
}

export function AIAssistantDrawer({ isOpen, onClose, selectedCollegeId }: AIAssistantDrawerProps) {
  const trpc = useTRPC();
  const locale = useLocale();
  const [promptInput, setPromptInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    ...trpc.ai.getRecommendation.queryOptions({
      prompt: activeQuery,
      collegeId: selectedCollegeId,
    }),
    enabled: Boolean(activeQuery && activeQuery.length >= 2),
  });

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;
    setActiveQuery(promptInput.trim());
  };

  const handlePresetClick = (presetText: string) => {
    setPromptInput(presetText);
    setActiveQuery(presetText);
  };

  const presets = [
    'Find me a PG near DU North Campus under ₹10,000 with AC and veg food',
    'Which PG has the best food and mess menu?',
    'Show me PGs with shortest walking commute',
    'Is this PG trustworthy and verified?',
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1 font-bold text-xs"
              title="Go back to search"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Go Back</span>
            </button>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-slate-950 shadow-md">
              <HiSparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Nestora AI Decision Support</span>
              </h2>
              <p className="text-xs text-slate-400">
                Grounded accommodation intelligence & match scoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>Close (✕)</span>
          </button>
        </div>

        {/* Query Input Section */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask Nestora AI (e.g. PG near college under ₹10k with AC & food)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !promptInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isLoading ? <HiArrowPath className="w-4 h-4 text-white animate-spin" /> : <HiPaperAirplane className="w-4 h-4 text-white" />}
              <span className="text-white">Ask AI</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 transition-colors text-left truncate max-w-full"
              >
                💡 {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <HiSparkles className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-medium">Orchestrating Multi-Agent Pipeline...</p>
              <p className="text-xs text-slate-500">Dispatching Profiler, Matcher, Commute, Food, and Cost Agents...</p>
            </div>
          )}

          {isError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              ⚠️ Recommendation pipeline error. Please re-submit your prompt query.
            </div>
          )}

          {data && data.recommendations && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-slate-950 border border-indigo-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <HiSparkles className="w-4 h-4" /> AI Grounded Synthesis
                  </span>
                  <span className="text-slate-400 font-normal">
                    Agents Executed: [{data.requiredAgentsToRun.join(', ')}]
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {data.recommendations.summaryExplanation}
                </p>
              </div>

              {/* Candidates List */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 px-1">
                  Ranked Accommodation Matches ({data.recommendations.rankedCandidates.length})
                </h3>

                {data.recommendations.rankedCandidates.map((cand: any) => (
                  <div
                    key={cand.pgId}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 hover:border-indigo-600/60 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">
                            #{cand.rank}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {cand.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <HiMapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{cand.distanceKm} km ({cand.commuteMins} min {cand.commuteMode.toLowerCase()})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm inline-block">
                          {cand.matchScore}% Match
                        </span>
                        <p className="text-xs font-extrabold text-amber-300 mt-1">
                          ₹{cand.trueMonthlyCost.toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                        </p>
                      </div>
                    </div>

                    {/* DEMO Tag Banner */}
                    {cand.isDemoData && (
                      <div className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <HiExclamationTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>DEMO LISTING (SEED DATA) — Created for platform preview</span>
                      </div>
                    )}

                    {/* Verified Badge */}
                    {cand.isVerified && !cand.isDemoData && (
                      <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified Listing — Inspected by Nestora Admin Team</span>
                      </div>
                    )}

                    {/* Key Reasons & Advantages */}
                    {cand.reasons.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Match Reasons</span>
                        <ul className="space-y-0.5 text-slate-300">
                          {cand.reasons.map((r: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-indigo-400">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Trade-offs & Warnings */}
                    {cand.tradeoffs.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-400">Trade-offs to Consider</span>
                        <ul className="space-y-0.5 text-slate-300">
                          {cand.tradeoffs.map((t: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-amber-400">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Evidence: PG #{cand.evidenceReferences?.pgId}
                      </span>
                      <Link
                        href={`/pg/${cand.pgId}`}
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <HiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeQuery && (
            <div className="py-16 text-center space-y-3 text-slate-500">
              <HiSparkles className="w-10 h-10 text-indigo-500/50 mx-auto" />
              <p className="text-sm font-medium text-slate-400">Ready to assist your PG search</p>
              <p className="text-xs max-w-md mx-auto">
                Type your preferences or click one of the prompt suggestions above to execute the LangGraph multi-agent recommendation engine.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
