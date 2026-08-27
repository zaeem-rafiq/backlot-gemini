"use client";

import React, { useState, useEffect, memo } from "react";
import { Clock } from "lucide-react";

export const TimecodeDisplay = memo(function TimecodeDisplay() {
  const [timecode, setTimecode] = useState<string>("01:00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 24)).padStart(2, "0");
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 41); // ~24 fps broadcast ticker
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 bg-[#040508] border border-studio-800/90 rounded-md px-3 py-1 font-mono">
      <div className="flex items-center gap-1.5 text-[10px] uppercase text-studio-400 font-bold">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>TC</span>
      </div>
      <span className="text-xs font-mono-tabular font-bold tracking-widest text-amber-300">
        {timecode}
      </span>
      <span className="text-[9px] px-1 py-0.2 rounded bg-studio-850 text-studio-400 font-bold">
        24 FPS
      </span>
    </div>
  );
});
