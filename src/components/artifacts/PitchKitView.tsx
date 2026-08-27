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
  TrendingUp,
  Award,
} from "lucide-react";

interface PitchKitViewProps {
  pitchKit: PitchKit;
  title: string;
}

export function PitchKitView({ pitchKit, title }: PitchKitViewProps) {
  const [copiedOneSheet, setCopiedOneSheet] = React.useState(false);

  const handleCopyOneSheet = () => {
    const text = `PROJECT GREENLIGHT ONE-SHEET: ${title}\n\nTAGLINE: "${pitchKit.tagline}"\n\nLOGLINES:\n${pitchKit.loglines.map((l, i) => `${i + 1}. ${l}`).join("\n")}\n\nEXECUTIVE PITCH:\n${pitchKit.pitchParagraph}\n\nTARGET AUDIENCE:\nPrimary: ${pitchKit.audience.primary}\nSecondary: ${pitchKit.audience.secondary}\n\nFESTIVAL TARGETS:\n${pitchKit.festivalStrategy.map((f) => `- ${f.name} (${f.tier}): ${f.why}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedOneSheet(true);
    setTimeout(() => setCopiedOneSheet(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Studio Packaging Deck Header */}
      <div className="bg-[#0B0D14] border border-studio-800/90 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-8 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-studio-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/5 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold shadow-inner">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
                  Studio Packaging & Trade Market Greenlight Deck
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-bold">
                  Distribution Ready
                </span>
              </div>
              <p className="text-xs text-studio-400 font-sans mt-0.5">
                Calibrated pitch loglines, executive elevator pitch, and live Parallel Search market signals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Copy One-Sheet button */}
            <button
              onClick={handleCopyOneSheet}
              className="px-3 py-1.5 rounded-lg bg-[#06080C] hover:bg-[#141824] border border-studio-700 text-studio-200 text-xs font-mono font-bold transition focus-ring cursor-pointer flex items-center gap-1.5"
            >
              {copiedOneSheet ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Quote className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedOneSheet ? "COPIED ONE-SHEET" : "COPY ONE-SHEET"}</span>
            </button>

            {/* Print / PDF Export button */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-mono font-extrabold transition focus-ring cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Award className="w-3.5 h-3.5 fill-current" />
              <span>EXPORT STUDIO PDF</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-studio-400 uppercase text-[10px] font-bold">Project:</span>
              <span className="px-3 py-1 rounded-md bg-[#06080C] border border-studio-700 text-white font-bold uppercase">
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* HERO TAGLINE & CALIBRATED LOGLINES */}
        <div className="bg-[#06080C] border border-studio-800/90 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-inner">
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-extrabold flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" /> Core Market Hook & Trade Tagline
            </span>
            <h3 className="font-editorial text-2xl md:text-3xl lg:text-4xl text-white italic leading-tight">
              &ldquo;{pitchKit.tagline}&rdquo;
            </h3>
          </div>

          {/* 3 Calibrated Loglines */}
          <div className="flex flex-col gap-3 pt-4 border-t border-studio-800/80">
            <span className="text-[10px] font-mono uppercase text-studio-400 tracking-wider font-bold">
              Calibrated Pitch Loglines (One-Sheet, Festival Entry & Trade Press)
            </span>
            <div className="flex flex-col gap-2.5">
              {pitchKit.loglines.map((logline, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0D14] border border-studio-800 rounded-xl p-4 text-xs text-studio-200 flex items-start gap-3.5 shadow-sm"
                >
                  <span className="h-6 w-6 rounded bg-[#06080C] text-amber-300 font-mono font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-studio-700 shadow-inner">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans text-xs md:text-sm">{logline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GREENLIGHT EXECUTIVE PITCH (Cross-Artifact Synthesis) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#0B0D14] to-[#06080C] border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-extrabold tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Greenlight Executive Elevator Pitch
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/40 font-bold">
              Cross-Artifact Synthesis
            </span>
          </div>
          <p className="text-sm md:text-base text-white leading-relaxed font-sans font-medium">
            {pitchKit.pitchParagraph}
          </p>
          <span className="text-[10px] font-mono text-studio-400 pt-2 border-t border-studio-800/80">
            Synthesizes Ink (Story Analyst) reader coverage verdict & Ledger (1st AD) audited budget subtotal.
          </span>
        </div>

        {/* PARALLEL PARTNER TRACK: Live Market Grounding & Distribution Intelligence */}
        <div className="bg-[#06080C] border-2 border-sky-500/40 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-studio-800/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  Parallel Search API — Real-Time Market Intelligence
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-extrabold">
                    Official Hackathon Partner
                  </span>
                </h4>
                <p className="text-[11px] text-studio-400 font-sans mt-0.5">
                  Verifiable runtime web search signals grounding box-office comps, festival deadlines, and critical reception
                </p>
              </div>
            </div>
          </div>

          {pitchKit.marketEvidence && pitchKit.marketEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="bg-[#0B0D14] border border-studio-800 hover:border-sky-500/60 p-5 rounded-xl flex flex-col justify-between gap-3.5 transition group focus-ring cursor-pointer shadow-sm hover:shadow-sky-500/5"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-extrabold text-white group-hover:text-sky-300 transition line-clamp-2 font-mono">
                          {citation.title}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-studio-500 group-hover:text-sky-400 flex-shrink-0 transition mt-0.5" />
                      </div>
                      <p className="text-[11px] text-studio-300 leading-relaxed line-clamp-3 font-sans">
                        {citation.snippet}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-studio-800/80 flex items-center justify-between text-[10px] font-mono text-studio-400">
                      <span className="truncate max-w-[160px] text-sky-300 font-bold">
                        {hostname}
                      </span>
                      {citation.publishedDate && <span>{citation.publishedDate}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-6 text-center flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-studio-500" />
              <p className="text-xs text-studio-400 font-mono">
                Live Parallel Search API queries offline (PARALLEL_API_KEY unconfigured).
              </p>
            </div>
          )}
        </div>

        {/* Target Demographics & Festival Targets */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Audience Positioning */}
          <div className="md:col-span-5 bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-studio-800/80 pb-3">
              <Target className="w-4 h-4 text-amber-400" /> Target Demographic Reach
            </h4>
            <div className="flex flex-col gap-3 text-xs font-sans">
              <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-extrabold tracking-wider">
                  Primary Core Audience
                </span>
                <p className="text-studio-200 leading-relaxed">{pitchKit.audience.primary}</p>
              </div>
              <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-extrabold tracking-wider">
                  Secondary / Expansion Audience
                </span>
                <p className="text-studio-200 leading-relaxed">{pitchKit.audience.secondary}</p>
              </div>
            </div>
          </div>

          {/* Right: Festival Targets */}
          <div className="md:col-span-7 bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-studio-800/80 pb-3">
              <Trophy className="w-4 h-4 text-amber-400" /> Curated Festival Target Strategy
            </h4>
            <div className="flex flex-col gap-3">
              {pitchKit.festivalStrategy.map((fest, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0D14] border border-studio-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white font-mono uppercase tracking-wide">{fest.name}</span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-extrabold">
                      {fest.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-studio-300 font-sans leading-relaxed">{fest.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Art & One-Sheet Poster */}
        <div className="bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-studio-800/80 pb-3 flex-wrap gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> Key Art & One-Sheet Key Visual
            </h4>
            <span className="text-[10px] font-mono text-studio-400">
              Format: 2:3 Vertical Theatrical One-Sheet
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Poster Render or Previz */}
            <div className="md:col-span-5 flex justify-center">
              {pitchKit.posterConcept.posterUrl ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-studio-700 bg-[#020305] aspect-[2/3] w-full max-w-[320px] shadow-2xl group">
                  <img
                    src={pitchKit.posterConcept.posterUrl}
                    alt={`Theatrical poster for ${title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-xs font-mono font-bold text-white uppercase">{title}</span>
                    <span className="text-[10px] font-mono text-amber-300 italic">&ldquo;{pitchKit.tagline}&rdquo;</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[2/3] w-full max-w-[320px] bg-[#0B0D14] border-2 border-dashed border-studio-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                  <Film className="w-8 h-8 text-amber-400/60" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    Key Art Previz
                  </span>
                  <p className="text-[11px] text-studio-400 font-sans">
                    Image generation offline. Previz prompt blueprint ready for render.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Composition Notes & Prompt Blueprint */}
            <div className="md:col-span-7 flex flex-col gap-4 text-xs font-mono">
              <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-5 flex flex-col gap-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                  Visual Composition & Framing
                </span>
                <p className="text-studio-200 font-sans leading-relaxed text-xs sm:text-sm">
                  {pitchKit.posterConcept.description}
                </p>
              </div>

              <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-5 flex flex-col gap-2">
                <span className="text-[10px] text-studio-400 uppercase font-bold tracking-wider">
                  Prompt Blueprint Specification
                </span>
                <p className="text-amber-300 font-mono text-[11px] leading-relaxed select-all">
                  {pitchKit.posterConcept.imagePrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
