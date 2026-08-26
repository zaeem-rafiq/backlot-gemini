"use client";

import React, { useState } from "react";
import { BoardPlan } from "@/lib/types/storyboard";
import { Camera, Aperture, Video, Sparkles, Copy, Check, Eye } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      {/* Visual Grammar Header */}
      <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" /> Cinematographer Visual Style Statement
          </h3>
          <span className="px-2.5 py-1 rounded bg-[#16192B] border border-[#2B3152] text-[10px] font-mono text-amber-300">
            Aspect Ratio: {boardPlan.aspectRatio || "2.39:1"}
          </span>
        </div>
        <p className="text-xs text-[#D0D7F7] leading-relaxed italic font-serif">
          &ldquo;{boardPlan.visualStyleStatement}&rdquo;
        </p>
      </div>

      {/* Storyboard Frames Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boardPlan.frames.map((frame) => (
          <div
            key={frame.frameId}
            className="bg-[#101420] border border-[#1E2438] hover:border-[#2B3152] transition rounded-xl overflow-hidden flex flex-col shadow-lg"
          >
            {/* Visual Frame Render or Previz Placeholder */}
            <div className="aspect-[2.39/1] w-full bg-[#090A0F] border-b border-[#1E2438] relative flex flex-col items-center justify-center p-4 text-center overflow-hidden group">
              {frame.imageUrl ? (
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-[#5865A8] p-4">
                  <div className="h-9 w-9 rounded-full bg-[#16192B] border border-[#2B3152] flex items-center justify-center text-amber-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-[#7E8CD4]">
                    Previz Card · {frame.shotType} ({frame.movement})
                  </span>
                  <p className="text-[10px] text-[#A8B4EB] line-clamp-2 max-w-sm">
                    {frame.description}
                  </p>
                </div>
              )}

              {/* Frame Badge Overlay */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono text-amber-400 font-bold">
                FRAME {frame.frameId} · SCENE {frame.sceneId}
              </div>
            </div>

            {/* Shot Specifications */}
            <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
              <div className="flex flex-col gap-2">
                {/* Specs Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {frame.shotType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {frame.movement}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#16192B] text-[#D0D7F7] border border-[#2B3152]">
                    <Aperture className="w-2.5 h-2.5 inline mr-1" />
                    {frame.lensMm}
                  </span>
                </div>

                <p className="text-xs text-[#F5F7FD] leading-relaxed">
                  {frame.description}
                </p>

                {/* Staging & Lighting */}
                <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5 text-[#A8B4EB]">
                    <span className="text-amber-400 font-mono text-[10px] uppercase flex-shrink-0">Lighting:</span>
                    <span>{frame.lighting}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[#A8B4EB]">
                    <span className="text-sky-400 font-mono text-[10px] uppercase flex-shrink-0">Blocking:</span>
                    <span>{frame.blocking}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="pt-2 border-t border-[#1E2438] flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-[#5865A8] truncate">
                  Prompt: {frame.imagePrompt.slice(0, 50)}...
                </span>
                <button
                  onClick={() => handleCopyPrompt(frame.frameId, frame.imagePrompt)}
                  className="px-2.5 py-1 rounded bg-[#16192B] hover:bg-[#2B3152] text-[10px] font-mono text-[#D0D7F7] flex items-center gap-1 transition flex-shrink-0"
                >
                  {copiedFrameId === frame.frameId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#7E8CD4]" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
