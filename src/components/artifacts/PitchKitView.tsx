"use client";

import React from "react";
import { PitchKit } from "@/lib/types/pitch";
import {
  Sparkles,
  Megaphone,
  Target,
  Trophy,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle,
  Search,
  AlertCircle,
  Film,
  Globe,
  Quote,
} from "lucide-react";

interface PitchKitViewProps {
  pitchKit: PitchKit;
  title: string;
}

export function PitchKitView({ pitchKit, title }: PitchKitViewProps) {
  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Studio Packaging Deck Header */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-studio-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Studio Packaging & Trade Market Deck
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-studio-300 border border-studio-700 font-bold">
                  Distribution Ready
                </span>
              </div>
              <p className="text-xs text-studio-400">
                Loglines, greenlight executive elevator pitch, and live Parallel Search market signals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-studio-400 uppercase text-[10px]">Project:</span>
            <span className="px-2.5 py-1 rounded bg-[#08090D] border border-studio-700 text-white font-bold uppercase">
              {title}
            </span>
          </div>
        </div>

        {/* HERO TAGLINE & 3 CALIBRATED LOGLINES */}
        <div className="bg-[#08090D] border border-studio-800 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" /> Core Market Hook & Tagline
            </span>
            <h3 className="font-editorial text-2xl md:text-3xl text-white italic leading-tight">
              &ldquo;{pitchKit.tagline}&rdquo;
            </h3>
          </div>

          {/* 3 Calibrated Loglines */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-studio-800">
            <span className="text-[10px] font-mono uppercase text-studio-400 tracking-wider">
              Calibrated Pitch Loglines (One-Sheet, Festival Entry & Trade Press)
            </span>
            <div className="flex flex-col gap-2">
              {pitchKit.loglines.map((logline, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F121A] border border-studio-800/80 rounded-lg p-3 text-xs text-studio-200 flex items-start gap-3"
                >
                  <span className="h-5 w-5 rounded bg-[#08090D] text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 border border-studio-700">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans">{logline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GREENLIGHT EXECUTIVE PITCH (Cross-Artifact Quotation) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#0F121A] to-[#08090D] border-2 border-emerald-500/40 rounded-xl p-6 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-bold">
              <Sparkles className="w-4 h-4" /> Greenlight Executive Elevator Pitch
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
              Cross-Artifact Synthesis
            </span>
          </div>
          <p className="text-sm text-white leading-relaxed font-sans font-medium">
            {pitchKit.pitchParagraph}
          </p>
          <span className="text-[10px] font-mono text-studio-400 pt-1 border-t border-studio-800">
            Traces directly to Story Analyst coverage verdict & Line Producer audited ledger subtotal.
          </span>
        </div>

        {/* PARALLEL PARTNER TRACK: Live Market Grounding & Distribution Intelligence */}
        <div className="bg-[#08090D] border-2 border-sky-500/40 rounded-xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-studio-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  Parallel Search API — Real-Time Market Intelligence
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                    Official Hackathon Partner
                  </span>
                </h4>
                <p className="text-[11px] text-studio-400">
                  Verifiable runtime web search signals grounding box-office comps, festival deadlines, and critical reception
                </p>
              </div>
            </div>
          </div>

          {pitchKit.marketEvidence && pitchKit.marketEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pitchKit.marketEvidence.map((citation, idx) => {
                let hostname = "source";
                try {
                  hostname = new URL(citation.url).hostname;
                } catch {
                  hostname = citation.url.replace(/^https?:\/\//, "").split("/")[0] || "source";
                }

                return (
                  <a
                    key={idx}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read market comp citation: ${citation.title} (opens in new tab)`}
                    className="bg-[#0F121A] border border-studio-800 hover:border-sky-500/50 p-4 rounded-xl flex flex-col justify-between gap-3 transition group focus-ring cursor-pointer"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300 transition line-clamp-2">
                          {citation.title}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-studio-500 group-hover:text-sky-400 flex-shrink-0 transition" />
                      </div>
                      <p className="text-[11px] text-studio-300 leading-relaxed line-clamp-3 font-sans">
                        {citation.snippet}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono text-studio-400">
                      <span className="truncate max-w-[160px] text-sky-300">
                        {hostname}
                      </span>
                      {citation.publishedDate && <span>{citation.publishedDate}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0F121A] border border-studio-800 rounded-lg p-5 text-center flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-studio-500" />
              <p className="text-xs text-studio-400">
                Live Parallel Search API queries offline (PARALLEL_API_KEY unconfigured).
              </p>
            </div>
          )}
        </div>

        {/* Target Demographics & Festival Targets */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Audience Positioning */}
          <div className="md:col-span-5 bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> Target Demographic Reach
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-sans">
              <div className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Primary Core Audience
                </span>
                <p className="text-studio-200">{pitchKit.audience.primary}</p>
              </div>
              <div className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                  Secondary / Expansion Audience
                </span>
                <p className="text-studio-200">{pitchKit.audience.secondary}</p>
              </div>
            </div>
          </div>

          {/* Right: Festival Targets */}
          <div className="md:col-span-7 bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Curated Festival Target Strategy
            </h4>
            <div className="flex flex-col gap-2.5">
              {pitchKit.festivalStrategy.map((fest, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fest.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-amber-300 border border-studio-700 font-bold">
                      {fest.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-studio-300 font-sans leading-relaxed">{fest.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Art & Poster Direction */}
        <div className="bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" /> Key Art & Poster Direction
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-[10px] text-studio-400 uppercase font-bold">
                Visual Composition (2:3 Vertical)
              </span>
              <p className="text-studio-200 font-sans">{pitchKit.posterConcept.description}</p>
            </div>
            <div className="bg-[#0F121A] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-[10px] text-studio-400 uppercase font-bold">
                Image Generation Prompt Blueprint
              </span>
              <p className="text-amber-300 font-mono text-[11px] line-clamp-3">
                {pitchKit.posterConcept.imagePrompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
