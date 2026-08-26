"use client";

import React from "react";
import { PitchKit } from "@/lib/types/pitch";
import { Sparkles, Megaphone, Target, Trophy, ExternalLink, Image as ImageIcon, CheckCircle, Search, AlertCircle } from "lucide-react";

interface PitchKitViewProps {
  pitchKit: PitchKit;
  title: string;
}

export function PitchKitView({ pitchKit, title }: PitchKitViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Tagline & Loglines */}
      <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1.5 font-bold">
            <Megaphone className="w-3.5 h-3.5" /> Market Hook & Tagline
          </span>
          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px]">
            Pitch Deck Ready
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight font-serif italic">
          &ldquo;{pitchKit.tagline}&rdquo;
        </h2>

        {/* 3 Calibrated Loglines */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#1E2438]">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase">Calibrated Loglines</span>
          <div className="flex flex-col gap-2">
            {pitchKit.loglines.map((logline, idx) => (
              <div key={idx} className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 text-xs text-[#D0D7F7] flex items-start gap-3">
                <span className="h-5 w-5 rounded bg-[#16192B] text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{logline}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Pitch Paragraph (Cross-Artifact Provenance) */}
      <div className="bg-[#16192B] border border-emerald-500/30 rounded-xl p-6 flex flex-col gap-3 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-bold">
          <Sparkles className="w-4 h-4" /> Greenlight Executive Pitch (Cross-Artifact Quotation)
        </div>
        <p className="text-sm text-[#F5F7FD] leading-relaxed font-medium">
          {pitchKit.pitchParagraph}
        </p>
        <span className="text-[10px] text-[#7E8CD4] font-mono">
          Traces directly to Story Analyst coverage verdict & Line Producer audited ledger subtotal.
        </span>
      </div>

      {/* PARALLEL PARTNER TRACK: Live Market Intelligence Panel */}
      <div className="bg-[#101420] border border-sky-500/30 rounded-xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Parallel Search API — Live Market Grounding
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Runtime Search
                </span>
              </h3>
              <p className="text-[11px] text-[#7E8CD4]">
                Verifiable market citations and distribution intelligence retrieved at runtime
              </p>
            </div>
          </div>
        </div>

        {pitchKit.marketEvidence && pitchKit.marketEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pitchKit.marketEvidence.map((citation, idx) => (
              <a
                key={idx}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#090A0F] border border-[#1E2438] hover:border-sky-500/50 p-4 rounded-xl flex flex-col justify-between gap-3 transition group"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition line-clamp-2">
                      {citation.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5865A8] group-hover:text-sky-400 flex-shrink-0 transition" />
                  </div>
                  <p className="text-[11px] text-[#A8B4EB] leading-relaxed line-clamp-3">
                    {citation.snippet}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1E2438] flex items-center justify-between text-[10px] font-mono text-[#5865A8]">
                  <span className="truncate max-w-[180px]">{new URL(citation.url).hostname}</span>
                  {citation.publishedDate && <span>{citation.publishedDate}</span>}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-5 text-center flex flex-col items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#5865A8]" />
            <p className="text-xs text-[#7E8CD4]">
              Live Parallel Search API queries offline (PARALLEL_API_KEY unconfigured).
            </p>
          </div>
        )}
      </div>

      {/* Target Audiences & Festival Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Audience Positioning */}
        <div className="md:col-span-5 bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-4">
          <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Target Demographic Reach
          </h4>
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Primary Audience</span>
              <p className="text-[#D0D7F7]">{pitchKit.audience.primary}</p>
            </div>
            <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">Secondary / Expansion</span>
              <p className="text-[#D0D7F7]">{pitchKit.audience.secondary}</p>
            </div>
          </div>
        </div>

        {/* Right: Festival Targets */}
        <div className="md:col-span-7 bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Curated Festival Target Strategy
          </h4>
          <div className="flex flex-col gap-2.5">
            {pitchKit.festivalStrategy.map((fest, idx) => (
              <div key={idx} className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{fest.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16192B] text-amber-300 border border-[#2B3152]">
                    {fest.tier}
                  </span>
                </div>
                <p className="text-[11px] text-[#A8B4EB]">{fest.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Poster Art Direction */}
      <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-3">
        <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" /> Key Art & Poster Direction
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#7E8CD4] uppercase">Visual Composition</span>
            <p className="text-[#D0D7F7]">{pitchKit.posterConcept.description}</p>
          </div>
          <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#7E8CD4] uppercase">Generation Prompt (2:3 Vertical)</span>
            <p className="text-[#A8B4EB] font-mono text-[11px] line-clamp-3">{pitchKit.posterConcept.imagePrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
