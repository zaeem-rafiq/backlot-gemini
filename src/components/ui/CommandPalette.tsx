"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Film,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Camera,
  Megaphone,
  BookOpen,
  Printer,
  Radio,
  Sliders,
  X,
  ArrowRight,
  Command,
} from "lucide-react";
import { RunState } from "@/lib/types/events";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: "COVERAGE" | "BREAKDOWN" | "SCHEDULE" | "BUDGET" | "STORYBOARD" | "PITCH_KIT") => void;
  onDispatch: () => void;
  onLoadSample: () => void;
  onToggleScriptDrawer: () => void;
  onToggleWire: () => void;
  runState: RunState | null;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onDispatch,
  onLoadSample,
  onToggleScriptDrawer,
  onToggleWire,
  runState,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build searchable items
  const items: Array<{
    id: string;
    category: "NAVIGATION" | "SCENES" | "LEDGER" | "ACTIONS";
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    action: () => void;
  }> = [
    // Workstation Tabs
    {
      id: "tab-coverage",
      category: "NAVIGATION",
      title: "Story Coverage Dossier",
      subtitle: "Reader memo, rubric metrics, and editorial premise",
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSelectTab("COVERAGE");
        onClose();
      },
    },
    {
      id: "tab-breakdown",
      category: "NAVIGATION",
      title: "1st AD Scene Breakdown",
      subtitle: "13-category Movie Magic element tagging matrix",
      icon: <Layers className="w-4 h-4 text-sky-400" />,
      action: () => {
        onSelectTab("BREAKDOWN");
        onClose();
      },
    },
    {
      id: "tab-schedule",
      category: "NAVIGATION",
      title: "Magnetic Stripboard Schedule",
      subtitle: "Production day strips, company moves, and SAG call sheet",
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab("SCHEDULE");
        onClose();
      },
    },
    {
      id: "tab-budget",
      category: "NAVIGATION",
      title: "Canonical Audited Top Sheet",
      subtitle: "1000–9000 Account ledgers with cross-artifact provenance",
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab("BUDGET");
        onClose();
      },
    },
    {
      id: "tab-storyboard",
      category: "NAVIGATION",
      title: "2.39:1 Anamorphic Previz Studio",
      subtitle: "Optical viewfinder framing, focal lengths, and prompt blueprints",
      icon: <Camera className="w-4 h-4 text-violet-400" />,
      action: () => {
        onSelectTab("STORYBOARD");
        onClose();
      },
    },
    {
      id: "tab-pitch",
      category: "NAVIGATION",
      title: "Packaging & Trade One-Sheet",
      subtitle: "Loglines, elevator pitch, and live Parallel Search citations",
      icon: <Megaphone className="w-4 h-4 text-pink-400" />,
      action: () => {
        onSelectTab("PITCH_KIT");
        onClose();
      },
    },

    // Actions
    {
      id: "action-dispatch",
      category: "ACTIONS",
      title: "Dispatch Studio Multi-Agent Crew",
      subtitle: "Execute live streaming analysis across 6 departments",
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      action: () => {
        onDispatch();
        onClose();
      },
    },
    {
      id: "action-sample",
      category: "ACTIONS",
      title: "Load Sample Production ('FREQUENCY ZERO')",
      subtitle: "Instant zero-quota verified studio package",
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onLoadSample();
        onClose();
      },
    },
    {
      id: "action-script",
      category: "ACTIONS",
      title: "Toggle Screenplay Manuscript Drawer",
      subtitle: "View Courier 12pt industry screenplay",
      icon: <Film className="w-4 h-4 text-studio-300" />,
      action: () => {
        onToggleScriptDrawer();
        onClose();
      },
    },
    {
      id: "action-print",
      category: "ACTIONS",
      title: "Export Studio Greenlight Packet (PDF / Print)",
      subtitle: "Render physical Hollywood studio production binder",
      icon: <Printer className="w-4 h-4 text-studio-300" />,
      action: () => {
        window.print();
        onClose();
      },
    },
  ];

  // Add scenes from scriptParse or breakdown if available
  if (runState?.scriptParse?.scenes) {
    runState.scriptParse.scenes.forEach((scene) => {
      items.push({
        id: `scene-${scene.id}`,
        category: "SCENES",
        title: `Scene ${scene.id}: ${scene.slugline}`,
        subtitle: `${scene.pageEighths}/8 pgs · ${scene.intExt} ${scene.timeOfDay} · ${scene.characters.length} cast`,
        icon: <Film className="w-4 h-4 text-sky-400" />,
        action: () => {
          onSelectTab("BREAKDOWN");
          onClose();
        },
      });
    });
  } else if (runState?.breakdown?.breakdowns) {
    runState.breakdown.breakdowns.forEach((bd) => {
      items.push({
        id: `scene-${bd.sceneId}`,
        category: "SCENES",
        title: `Scene ${bd.sceneId} Breakdown`,
        subtitle: `${bd.cast.length} cast · ${bd.props.length} props · ${bd.vfx.length} vfx`,
        icon: <Film className="w-4 h-4 text-sky-400" />,
        action: () => {
          onSelectTab("BREAKDOWN");
          onClose();
        },
      });
    });
  }

  // Filter items
  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Studio Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-document-land"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0B0D14] border-2 border-studio-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col focus-ring"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-studio-800 bg-[#06080C]">
          <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search scenes, account codes, previz frames, or jump to tabs... (Cmd+K)"
            className="w-full bg-transparent text-white placeholder-studio-500 text-sm font-mono outline-none"
          />
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-studio-400">
            <kbd className="px-2 py-0.5 rounded bg-studio-850 border border-studio-700 text-studio-300">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-studio-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-studio-400 font-mono text-xs">
              No matching studio commands or scenes found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition ${
                    isSelected ? "bg-[#141A28] text-white" : "text-studio-300 hover:bg-[#0E121C]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#06080C] border border-studio-800 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-studio-900 text-studio-400 border border-studio-800 font-bold uppercase">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-studio-400 truncate font-sans">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 flex-shrink-0 transition ${
                      isSelected ? "text-amber-400 opacity-100 translate-x-0.5" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-[#06080C] border-t border-studio-800/80 flex items-center justify-between text-[10px] font-mono text-studio-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-studio-850 border border-studio-700">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-studio-850 border border-studio-700">↵</kbd> Select</span>
          </div>
          <span className="text-amber-400 font-bold">Studio Command Deck</span>
        </div>
      </div>
    </div>
  );
}
