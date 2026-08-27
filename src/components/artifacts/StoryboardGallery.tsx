"use client";

import React, { useState, useEffect } from "react";
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
  Sun,
  Focus,
  Play,
  Pause,
  Sliders,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface StoryboardGalleryProps {
  boardPlan: BoardPlan;
  staleFrameIds?: string[];
}

type LutProfile = "kodak" | "arri" | "neon" | "bw";

export function StoryboardGallery({ boardPlan, staleFrameIds = [] }: StoryboardGalleryProps) {
  const [copiedFrameId, setCopiedFrameId] = useState<string | null>(null);
  const [activeLut, setActiveLut] = useState<LutProfile>("kodak");
  const [selectedLens, setSelectedLens] = useState<string>("ALL");
  const [lightboxFrame, setLightboxFrame] = useState<typeof boardPlan.frames[0] | null>(null);
  const [isAnimaticPlaying, setIsAnimaticPlaying] = useState(false);
  const [animaticIndex, setAnimaticIndex] = useState(0);

  // Animatic Auto-Advancing Player with Image Pre-buffering
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimaticPlaying && boardPlan.frames.length > 0) {
      // Pre-buffer next frame image
      const nextIdx = (animaticIndex + 1) % boardPlan.frames.length;
      const nextImgUrl = boardPlan.frames[nextIdx]?.imageUrl;
      if (nextImgUrl && typeof window !== "undefined") {
        const prefetch = new Image();
        prefetch.src = nextImgUrl;
      }

      timer = setInterval(() => {
        setAnimaticIndex((prev) => (prev + 1) % boardPlan.frames.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isAnimaticPlaying, animaticIndex, boardPlan.frames]);

  const handleCopyPrompt = (frameId: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedFrameId(frameId);
    setTimeout(() => setCopiedFrameId(null), 2000);
  };

  const getLutClass = (lut: LutProfile) => {
    switch (lut) {
      case "kodak": return "lut-kodak";
      case "arri": return "lut-arri";
      case "neon": return "lut-neon";
      case "bw": return "lut-bw";
      default: return "";
    }
  };

  // Filter frames by lens if selected
  const filteredFrames = selectedLens === "ALL"
    ? boardPlan.frames
    : boardPlan.frames.filter((f) => f.lensMm.toLowerCase().includes(selectedLens.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Storyboard Deck Header Banner */}
      <div className="bg-[#0B0D14] border border-studio-800/90 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-studio-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
                  Director of Photography Previz & Storyboard Studio
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold">
                  2.39:1 Anamorphic Scope
                </span>
              </div>
              <p className="text-xs text-studio-400 font-sans mt-0.5">
                Camera focal lengths, spatial blocking, lighting diagrams, and keyframe prompt blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Animatic Playback Button */}
            <button
              onClick={() => setIsAnimaticPlaying(!isAnimaticPlaying)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition focus-ring cursor-pointer ${
                isAnimaticPlaying
                  ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-[#06080C] text-amber-300 border-amber-500/40 hover:bg-[#121622]"
              }`}
              aria-label={isAnimaticPlaying ? "Pause Animatic Playback" : "Play Storyboard Animatic"}
            >
              {isAnimaticPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isAnimaticPlaying ? "PAUSE ANIMATIC" : "PLAY ANIMATIC"}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-studio-400 uppercase text-[10px] font-bold">Aspect:</span>
              <span className="px-2.5 py-1 rounded-md bg-[#06080C] border border-studio-700 text-amber-300 font-bold font-mono-tabular">
                {boardPlan.aspectRatio || "2.39:1"}
              </span>
            </div>
          </div>
        </div>

        {/* Cinematographer Visual Style Statement */}
        <div className="bg-[#06080C] border border-studio-800/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-inner">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-extrabold">
            <Sparkles className="w-3.5 h-3.5" /> Cinematographer Visual Style Statement
          </span>
          <p className="font-editorial text-xl md:text-2xl text-white italic leading-relaxed">
            &ldquo;{boardPlan.visualStyleStatement}&rdquo;
          </p>
        </div>

        {/* INTERACTIVE CONTROLS BAR: LUT Color Profile & Lens Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-studio-800/60 text-xs font-mono">
          {/* LUT Profile Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-studio-400 font-bold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-violet-400" /> Film Emulation LUT:
            </span>
            <div className="flex items-center gap-1 bg-[#06080C] p-1 rounded-lg border border-studio-800">
              {(
                [
                  { id: "kodak", label: "Kodak 5219" },
                  { id: "arri", label: "Arri 709" },
                  { id: "neon", label: "Neon Noir" },
                  { id: "bw", label: "35mm B&W" },
                ] as const
              ).map((lut) => (
                <button
                  key={lut.id}
                  onClick={() => setActiveLut(lut.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition focus-ring cursor-pointer ${
                    activeLut === lut.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-studio-400 hover:text-white"
                  }`}
                >
                  {lut.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lens Focal Length Filters */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-studio-400 font-bold flex items-center gap-1">
              <Aperture className="w-3 h-3 text-amber-400" /> Lens Filter:
            </span>
            <div className="flex items-center gap-1 bg-[#06080C] p-1 rounded-lg border border-studio-800">
              {["ALL", "21mm", "35mm", "50mm", "85mm"].map((lens) => (
                <button
                  key={lens}
                  onClick={() => setSelectedLens(lens)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition focus-ring cursor-pointer ${
                    selectedLens === lens
                      ? "bg-amber-500 text-black shadow-sm"
                      : "text-studio-400 hover:text-white"
                  }`}
                >
                  {lens}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATIC FEATURED VIEWER (When Playing) */}
      {isAnimaticPlaying && boardPlan.frames[animaticIndex] && (
        <div className="bg-[#0B0D14] border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-document-land">
          <div className="flex items-center justify-between border-b border-studio-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                Live Animatic Stream · Frame {animaticIndex + 1} of {boardPlan.frames.length}
              </span>
            </div>
            <span className="text-xs font-mono text-studio-300 font-bold">
              {boardPlan.frames[animaticIndex].shotType} · {boardPlan.frames[animaticIndex].lensMm}
            </span>
          </div>

          <div className="aspect-[2.39/1] w-full bg-[#020305] relative rounded-xl overflow-hidden flex items-center justify-center border-2 border-studio-700">
            {/* Viewfinder reticle */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30">
                <Crosshair className="w-6 h-6" />
              </div>
            </div>

            {boardPlan.frames[animaticIndex].imageUrl ? (
              <img
                src={boardPlan.frames[animaticIndex].imageUrl}
                alt={boardPlan.frames[animaticIndex].description}
                className={`w-full h-full object-cover transition-all duration-300 ${getLutClass(activeLut)}`}
              />
            ) : (
              <div className="p-8 text-center max-w-xl">
                <span className="text-sm font-mono font-bold uppercase text-white block mb-1">
                  Previz Shot Board · Frame {boardPlan.frames[animaticIndex].frameId}
                </span>
                <p className="text-xs text-studio-300 font-screenplay">
                  {boardPlan.frames[animaticIndex].description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2.39:1 STORYBOARD SHEET FRAMES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFrames.map((frame, fIdx) => (
          <div
            key={frame.frameId}
            className={`bg-[#0B0D14] border-2 transition rounded-2xl overflow-hidden flex flex-col shadow-2xl group ${
              isAnimaticPlaying && animaticIndex === fIdx
                ? "border-amber-400 ring-2 ring-amber-400/40"
                : "border-studio-800 hover:border-studio-700"
            }`}
          >
            {/* 2.39:1 FRAMED LETTERBOX WITH VIEWFINDER GUIDES */}
            <div
              onClick={() => setLightboxFrame(frame)}
              className="aspect-[2.39/1] w-full bg-[#020305] relative border-b-2 border-studio-800 overflow-hidden flex items-center justify-center viewfinder-crosshair cursor-pointer"
            >
              {/* Director's Optical Viewfinder Reticle */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Vertical rule of thirds */}
                <div className="absolute top-0 bottom-0 left-1/3 w-[1px] border-r border-dashed border-white/10" />
                <div className="absolute top-0 bottom-0 left-2/3 w-[1px] border-r border-dashed border-white/10" />
                {/* Horizontal rule of thirds */}
                <div className="absolute left-0 right-0 top-1/3 h-[1px] border-b border-dashed border-white/10" />
                <div className="absolute left-0 right-0 top-2/3 h-[1px] border-b border-dashed border-white/10" />

                {/* Center Optical Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20">
                  <Crosshair className="w-5 h-5" />
                </div>

                {/* Aspect Ratio Watermark */}
                <span className="absolute bottom-2.5 right-4 text-[9px] font-mono tracking-widest text-white/30 font-extrabold">
                  2.39:1 ANAMORPHIC SCOPE
                </span>
              </div>

              {/* Frame Identification Badges */}
              <div className="absolute top-3 left-4 flex items-center gap-2 z-20">
                <div className="px-2.5 py-1 rounded bg-black/90 backdrop-blur border border-white/20 text-[10px] font-mono text-amber-300 font-extrabold shadow-md">
                  FRAME {frame.frameId} · SCENE {frame.sceneId}
                </div>
                {staleFrameIds.includes(frame.frameId) && (
                  <div className="px-2 py-1 rounded bg-amber-500/90 text-black text-[9px] font-mono font-black tracking-wider uppercase shadow-md flex items-center gap-1 animate-pulse">
                    <span>STALE / REVISED</span>
                  </div>
                )}
              </div>

              <div className="absolute top-3 right-4 px-2.5 py-1 rounded bg-black/90 backdrop-blur border border-white/20 text-[10px] font-mono text-studio-200 font-bold z-20 flex items-center gap-1.5 shadow-md">
                <Aperture className="w-3.5 h-3.5 text-amber-400" />
                <span>{frame.lensMm}</span>
              </div>

              {/* Rendered Frame Image OR Cinema Previz Wireframe */}
              {frame.imageUrl ? (
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${getLutClass(activeLut)}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center z-0 max-w-md">
                  <div className="h-10 w-10 rounded-full bg-[#0B0D14] border border-studio-700 flex items-center justify-center text-amber-400 shadow-inner">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Previz Shot Board · {frame.shotType}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      Camera Motion: {frame.movement}
                    </span>
                  </div>
                  <p className="text-[11px] text-studio-300 line-clamp-2 font-screenplay">
                    {frame.description}
                  </p>
                </div>
              )}
            </div>

            {/* PRINTED SHOT DATA SLUG */}
            <div className="p-6 flex flex-col justify-between gap-4 flex-1">
              <div className="flex flex-col gap-3.5">
                {/* Shot Specification Badges */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-extrabold uppercase">
                    {frame.shotType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-extrabold uppercase">
                    {frame.movement}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#06080C] text-studio-200 border border-studio-700 font-bold">
                    Lens: {frame.lensMm}
                  </span>
                </div>

                {/* Dramatic Shot Description */}
                <p className="text-xs text-white font-screenplay leading-relaxed bg-[#06080C] border border-studio-800/80 rounded-xl p-3.5 shadow-inner">
                  {frame.description}
                </p>

                {/* Staging & Lighting Technical Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-mono">
                  <div className="bg-[#06080C] border border-studio-800 rounded-lg p-3 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-amber-400">Lighting Setup:</span>
                    <span className="text-studio-200 leading-snug">{frame.lighting}</span>
                  </div>
                  <div className="bg-[#06080C] border border-studio-800 rounded-lg p-3 flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-sky-400">Spatial Blocking:</span>
                    <span className="text-studio-200 leading-snug">{frame.blocking}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Blueprint Bar */}
              <div className="pt-3 border-t border-studio-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-studio-400 truncate">
                  <span className="text-amber-400 font-bold flex-shrink-0">PROMPT:</span>
                  <span className="truncate">{frame.imagePrompt}</span>
                </div>

                <button
                  onClick={() => handleCopyPrompt(frame.frameId, frame.imagePrompt)}
                  aria-label={`Copy generation prompt for Frame ${frame.frameId}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#06080C] hover:bg-[#141824] border border-studio-700 text-[10px] font-mono text-studio-200 flex items-center gap-1.5 transition flex-shrink-0 focus-ring cursor-pointer shadow-sm"
                >
                  <span aria-live="polite" className="flex items-center gap-1.5">
                    {copiedFrameId === frame.frameId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold">Copy Prompt</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL (Director's Previz Inspection) */}
      {lightboxFrame && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inspect Frame ${lightboxFrame.frameId}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-document-land"
          onClick={() => setLightboxFrame(null)}
        >
          <div
            className="w-full max-w-4xl bg-[#0B0D14] border-2 border-studio-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-studio-800 bg-[#06080C]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                  FRAME {lightboxFrame.frameId}
                </span>
                <span className="text-sm font-mono font-bold text-white uppercase">
                  Scene {lightboxFrame.sceneId} · {lightboxFrame.shotType}
                </span>
              </div>
              <button
                onClick={() => setLightboxFrame(null)}
                className="text-studio-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 focus-ring cursor-pointer"
              >
                ✕ Close (ESC)
              </button>
            </div>

            <div className="aspect-[2.39/1] w-full bg-[#020305] relative overflow-hidden flex items-center justify-center">
              {lightboxFrame.imageUrl ? (
                <img
                  src={lightboxFrame.imageUrl}
                  alt={lightboxFrame.description}
                  className={`w-full h-full object-cover ${getLutClass(activeLut)}`}
                />
              ) : (
                <div className="p-8 text-center max-w-lg">
                  <Film className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-studio-200 font-screenplay">{lightboxFrame.description}</p>
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4 font-mono text-xs bg-[#0B0D14]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#06080C] p-3 rounded-lg border border-studio-800">
                  <span className="text-[10px] text-studio-400 uppercase font-bold block mb-0.5">Focal Length</span>
                  <strong className="text-white">{lightboxFrame.lensMm}</strong>
                </div>
                <div className="bg-[#06080C] p-3 rounded-lg border border-studio-800">
                  <span className="text-[10px] text-studio-400 uppercase font-bold block mb-0.5">Camera Movement</span>
                  <strong className="text-sky-300">{lightboxFrame.movement}</strong>
                </div>
                <div className="bg-[#06080C] p-3 rounded-lg border border-studio-800">
                  <span className="text-[10px] text-studio-400 uppercase font-bold block mb-0.5">Lighting</span>
                  <strong className="text-amber-300">{lightboxFrame.lighting}</strong>
                </div>
                <div className="bg-[#06080C] p-3 rounded-lg border border-studio-800">
                  <span className="text-[10px] text-studio-400 uppercase font-bold block mb-0.5">Spatial Blocking</span>
                  <strong className="text-emerald-300">{lightboxFrame.blocking}</strong>
                </div>
              </div>

              <div className="bg-[#06080C] p-3.5 rounded-lg border border-studio-800 text-[11px] text-studio-300 font-screenplay">
                {lightboxFrame.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

