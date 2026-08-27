"use client";

import React, { useState } from "react";
import { BoardPlan } from "@/lib/types/storyboard";
import {
  Camera,
  Aperture,
  Video,
  Sparkles,
  Copy,
  Check,
  Eye,
  Crosshair,
  Maximize2,
  Film,
} from "lucide-react";

interface StoryboardGalleryProps {
  boardPlan: BoardPlan;
}

export function StoryboardGallery({ boardPlan }: StoryboardGalleryProps) {
  const [copiedFrameId, setCopiedFrameId] = useState<string | null>(null);

  const handleCopyPrompt = (frameId: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedFrameId(frameId);
    setTimeout(() => setCopiedFrameId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Storyboard Deck Header Banner */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-studio-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Director of Photography Previz & Storyboard Sheet
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-amber-300 border border-studio-700 font-bold">
                  2.39:1 Anamorphic Format
                </span>
              </div>
              <p className="text-xs text-studio-400">
                Camera focal lengths, spatial blocking, lighting diagrams, and keyframe prompt blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-studio-400 uppercase text-[10px]">Aspect Ratio:</span>
            <span className="px-2.5 py-1 rounded bg-[#08090D] border border-studio-700 text-amber-300 font-bold">
              {boardPlan.aspectRatio || "2.39:1"}
            </span>
          </div>
        </div>

        {/* Cinematographer Visual Style Statement */}
        <div className="bg-[#08090D] border border-studio-800 rounded-xl p-5 flex flex-col gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Cinematographer Style Statement
          </span>
          <p className="font-editorial text-xl md:text-2xl text-white italic leading-relaxed">
            &ldquo;{boardPlan.visualStyleStatement}&rdquo;
          </p>
        </div>
      </div>

      {/* 2.39:1 STORYBOARD SHEET FRAMES (Printed Storyboard Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boardPlan.frames.map((frame) => (
          <div
            key={frame.frameId}
            className="bg-[#0F121A] border-2 border-studio-800 hover:border-studio-700 transition rounded-xl overflow-hidden flex flex-col shadow-2xl group"
          >
            {/* 2.39:1 FRAMED LETTERBOX WITH VIEWFINDER GUIDES */}
            <div className="aspect-[2.39/1] w-full bg-[#040508] relative border-b-2 border-studio-800 overflow-hidden flex items-center justify-center">
              {/* Camera Rule-of-Thirds Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Vertical Thirds */}
                <div className="absolute top-0 bottom-0 left-1/3 w-[1px] border-r border-dashed border-white/10" />
                <div className="absolute top-0 bottom-0 left-2/3 w-[1px] border-r border-dashed border-white/10" />
                {/* Horizontal Thirds */}
                <div className="absolute left-0 right-0 top-1/3 h-[1px] border-b border-dashed border-white/10" />
                <div className="absolute left-0 right-0 top-2/3 h-[1px] border-b border-dashed border-white/10" />

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20">
                  <Crosshair className="w-4 h-4" />
                </div>

                {/* Corner Viewfinder Crop Brackets */}
                <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-amber-400/80" />
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-amber-400/80" />
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-amber-400/80" />
                <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-amber-400/80" />
              </div>

              {/* Frame Identification Badges */}
              <div className="absolute top-2.5 left-6 px-2 py-0.5 rounded bg-black/90 backdrop-blur border border-white/15 text-[10px] font-mono text-amber-300 font-bold z-20">
                FRAME {frame.frameId} · SCENE {frame.sceneId}
              </div>

              <div className="absolute top-2.5 right-6 px-2 py-0.5 rounded bg-black/90 backdrop-blur border border-white/15 text-[10px] font-mono text-studio-300 font-bold z-20 flex items-center gap-1">
                <Aperture className="w-3 h-3 text-amber-400" />
                <span>{frame.lensMm}</span>
              </div>

              {/* Rendered Frame Image OR Cinema Previz Wireframe */}
              {frame.imageUrl ? (
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center z-0 max-w-md">
                  <div className="h-10 w-10 rounded-full bg-[#0F121A] border border-studio-700 flex items-center justify-center text-amber-400 shadow-inner">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Previz Shot Board · {frame.shotType}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300">
                      Camera Movement: {frame.movement}
                    </span>
                  </div>
                  <p className="text-[11px] text-studio-300 line-clamp-2 font-screenplay">
                    {frame.description}
                  </p>
                </div>
              )}
            </div>

            {/* PRINTED SHOT DATA SLUG (Beneath the Frame) */}
            <div className="p-5 flex flex-col justify-between gap-4 flex-1">
              <div className="flex flex-col gap-3">
                {/* Shot Specification Badges */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                    {frame.shotType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold uppercase">
                    {frame.movement}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#08090D] text-studio-200 border border-studio-700 font-bold">
                    Lens: {frame.lensMm}
                  </span>
                </div>

                {/* Dramatic Shot Description */}
                <p className="text-xs text-white font-screenplay leading-relaxed bg-[#08090D] border border-studio-800/80 rounded-lg p-3">
                  {frame.description}
                </p>

                {/* Staging & Lighting Technical Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#08090D] border border-studio-800 rounded p-2.5 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-amber-400">Lighting Setup:</span>
                    <span className="text-studio-200 leading-snug">{frame.lighting}</span>
                  </div>
                  <div className="bg-[#08090D] border border-studio-800 rounded p-2.5 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-sky-400">Spatial Blocking:</span>
                    <span className="text-studio-200 leading-snug">{frame.blocking}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Blueprint Bar */}
              <div className="pt-2 border-t border-studio-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-studio-400 truncate">
                  <span className="text-amber-400 font-bold flex-shrink-0">PROMPT:</span>
                  <span className="truncate">{frame.imagePrompt}</span>
                </div>

                <button
                  onClick={() => handleCopyPrompt(frame.frameId, frame.imagePrompt)}
                  aria-label={`Copy generation prompt for Frame ${frame.frameId}`}
                  className="px-3 py-1.5 rounded-lg bg-[#08090D] hover:bg-[#141824] border border-studio-700 text-[10px] font-mono text-studio-200 flex items-center gap-1.5 transition flex-shrink-0 focus-ring cursor-pointer"
                >
                  <span aria-live="polite" className="flex items-center gap-1.5">
                    {copiedFrameId === frame.frameId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
