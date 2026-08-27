"use client";

import React from "react";
import { Coverage } from "@/lib/types/coverage";
import {
  Sparkles,
  Award,
  Compass,
  TrendingUp,
  FileText,
  ShieldCheck,
  Quote,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface CoverageDossierProps {
  coverage: Coverage;
  title: string;
}

export function CoverageDossier({ coverage, title }: CoverageDossierProps) {
  const getVerdictStamp = (verdict: Coverage["verdict"]) => {
    switch (verdict) {
      case "RECOMMEND":
        return {
          stampClass: "stamp-recommend",
          textClass: "text-emerald-400",
          label: "RECOMMEND",
          subtext: "PRIORITY ACQUISITION / GREENLIGHT",
        };
      case "CONSIDER":
        return {
          stampClass: "stamp-consider",
          textClass: "text-amber-400",
          label: "CONSIDER",
          subtext: "STRONG PREMISE / APPROVED FOR PRE-PROD",
        };
      case "PASS":
        return {
          stampClass: "stamp-pass",
          textClass: "text-rose-400",
          label: "PASS",
          subtext: "REVISE & RESUBMIT",
        };
    }
  };

  const stamp = getVerdictStamp(coverage.verdict);

  const getScoreDescriptor = (score: number) => {
    if (score >= 9) return { label: "EXCEPTIONAL", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 8) return { label: "EXCELLENT", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 7) return { label: "STRONG", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
    if (score >= 6) return { label: "ABOVE AVERAGE", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
    return { label: "NEEDS WORK", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  };

  const dimensions = [
    { label: "Premise & Originality", score: coverage.scores.premise, note: "High-concept speculative hook with high-tension time dilation" },
    { label: "Narrative Structure", score: coverage.scores.structure, note: "Three-act short architecture with tight escalation to climax" },
    { label: "Character Arc & Voice", score: coverage.scores.character, note: "Grounded protagonist motivation with clear professional stakes" },
    { label: "Dialogue & Subtext", score: coverage.scores.dialogue, note: "Atmospheric on-air banter with realistic technical terminology" },
    { label: "Marketability & ROI", score: coverage.scores.marketability, note: "Strong genre appeal with lean, producible physical footprint" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Studio Memo Document Container */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        {/* Memo Header & Metadata */}
        <div className="border-b border-studio-800 pb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-studio-400 uppercase">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Studio Story Analysis & Coverage Dossier</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-studio-300 border border-studio-700">
              Department Ref: COV-2026-08
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-studio-400">Project Title</span>
              <span className="font-bold text-white uppercase">{title}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-studio-400">Story Analyst</span>
              <span className="font-bold text-amber-300">Ink (Story Dept)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-studio-400">Format & Pages</span>
              <span className="text-studio-200">Short Film (12 Pgs)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-studio-400">Primary Genre</span>
              <span className="text-studio-200">{coverage.genre.join(" / ")}</span>
            </div>
          </div>
        </div>

        {/* HERO SECTION: Typographic Ink Stamp + Large Editorial Pull Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#08090D] border border-studio-800 rounded-xl p-6 relative">
          {/* Stamped Verdict (Authentic Rubber Stamp Effect) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4">
            <div
              className={`stamp-verdict ${stamp.stampClass} px-6 py-4 rounded-lg transform -rotate-2 sm:-rotate-3 transition-transform hover:rotate-0 flex flex-col items-center gap-1 cursor-default`}
            >
              <span className="text-[10px] font-mono font-extrabold tracking-widest opacity-80">
                STUDIO READER VERDICT
              </span>
              <span className="text-3xl md:text-4xl font-extrabold tracking-wider font-mono">
                {stamp.label}
              </span>
              <span className="text-[9px] font-mono font-bold tracking-tight opacity-90 border-t border-current pt-1 mt-0.5">
                {stamp.subtext}
              </span>
            </div>
          </div>

          {/* Large Editorial Pull Quote */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase">
              <Quote className="w-4 h-4 text-amber-400" /> Story Analyst Verdict Statement
            </div>
            <p className="font-editorial text-2xl md:text-3xl text-white italic leading-snug tracking-tight">
              &ldquo;{coverage.pullQuote}&rdquo;
            </p>
            <p className="text-xs text-studio-300 leading-relaxed font-sans pt-1 border-t border-studio-800">
              <strong className="text-white font-mono uppercase text-[11px]">Analysis Summary: </strong>
              {coverage.verdictRationale}
            </p>
          </div>
        </div>

        {/* CRITIC'S ASSESSMENT MATRIX (Dimension Ratings) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Critic&apos;s Diagnostic Score Matrix (Calibrated 1–10)
            </h3>
            <span className="text-[10px] font-mono text-studio-400">Industry Calibrated Studio Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dimensions.map((dim, idx) => {
              const desc = getScoreDescriptor(dim.score);
              return (
                <div
                  key={idx}
                  className="bg-[#08090D] border border-studio-800 rounded-lg p-3.5 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white font-mono">{dim.label}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${desc.color}`}
                    >
                      {desc.label}
                    </span>
                  </div>

                  {/* Critic Discrete Score Track */}
                  <div
                    role="meter"
                    aria-label={`${dim.label} score ${dim.score} out of 10`}
                    aria-valuenow={dim.score}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    className="flex items-center gap-1.5 font-mono"
                  >
                    <span className="text-lg font-bold text-white font-mono-tabular">
                      {dim.score}
                      <span className="text-xs text-studio-400 font-normal">/10</span>
                    </span>
                    <div className="flex-1 flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, bIdx) => (
                        <div
                          key={bIdx}
                          className={`h-2 flex-1 rounded-sm transition ${
                            bIdx < dim.score
                              ? dim.score >= 8
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                              : "bg-studio-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-studio-300 leading-snug">{dim.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Synopsis & Tone */}
        <div className="bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" /> Narrative Synopsis & Logline Breakdown
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold mr-1">Tone:</span>
              <span className="px-2 py-0.5 rounded bg-[#0F121A] border border-studio-700 text-[11px] font-mono text-studio-200">
                {coverage.tone}
              </span>
            </div>
          </div>
          <p className="text-xs text-studio-200 leading-relaxed font-sans">
            {coverage.synopsis}
          </p>
        </div>

        {/* Market Comparables & Standout Considerations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Market Comps */}
          <div className="bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Studio Market Comparables
            </h4>
            <div className="flex flex-col gap-2.5">
              {coverage.comparables.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{comp.title}</span>
                    {comp.year && (
                      <span className="text-[10px] font-mono text-studio-400 font-mono-tabular">
                        ({comp.year})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-studio-300 leading-relaxed">{comp.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Strengths & Considerations */}
          <div className="bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Standout Strengths & Production Notes
            </h4>
            <div className="flex flex-col gap-2 font-sans text-xs">
              {coverage.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-studio-200">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </div>
              ))}
              {coverage.concerns.map((con, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-200">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{con}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
