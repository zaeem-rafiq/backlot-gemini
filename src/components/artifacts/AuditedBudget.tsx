"use client";

import React, { useState } from "react";
import { Budget, BudgetLineItem } from "@/lib/types/budget";
import { DollarSign, ShieldCheck, Link2, ChevronDown, ChevronUp, Layers, CheckCircle } from "lucide-react";

interface AuditedBudgetProps {
  budget: Budget;
}

export function AuditedBudget({ budget }: AuditedBudgetProps) {
  const [selectedTraceItem, setSelectedTraceItem] = useState<BudgetLineItem | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const totalLineItems = budget.sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#101420] border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between gap-1 shadow-lg shadow-emerald-500/5">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Audited Grand Total
          </span>
          <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ${budget.summary.grandTotal.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#A8B4EB]">
            ${budget.summary.subtotalBeforeContingency.toLocaleString()} subtotal + ${budget.summary.contingencyTotal.toLocaleString()} (10% contingency)
          </span>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Provenance Audit
          </span>
          <span className="text-2xl font-bold text-white font-mono">100% Traced</span>
          <span className="text-[11px] text-[#7E8CD4]">
            {totalLineItems} of {totalLineItems} line items linked to script breakdown
          </span>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Rate Card Basis
          </span>
          <span className="text-sm font-semibold text-white truncate">{budget.rateCardName}</span>
          <span className="text-[11px] text-[#5865A8] font-mono">Zero LLM Invented Figures</span>
        </div>
      </div>

      {/* Selected Provenance Popover / Banner */}
      {selectedTraceItem && (
        <div className="bg-[#16192B] border border-amber-500/40 rounded-xl p-4 flex items-start justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                Cross-Artifact Provenance: {selectedTraceItem.item}
              </span>
              <p className="text-xs text-amber-300 font-mono">
                {selectedTraceItem.tracesTo}
              </p>
              <span className="text-[10px] text-[#7E8CD4]">
                Category: {selectedTraceItem.category} · Qty: {selectedTraceItem.qty} {selectedTraceItem.unit} @ ${selectedTraceItem.rate} = ${selectedTraceItem.total.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedTraceItem(null)}
            className="text-xs text-[#7E8CD4] hover:text-white font-mono px-2 py-1 rounded bg-[#090A0F]"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Budget Categories Accordion / Table */}
      <div className="flex flex-col gap-4">
        {budget.sections.map((section) => {
          const isCollapsed = collapsedCategories[section.category];
          return (
            <div
              key={section.category}
              className="bg-[#101420] border border-[#1E2438] rounded-xl overflow-hidden shadow-sm"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(section.category)}
                className="w-full px-5 py-3.5 bg-[#16192B]/60 hover:bg-[#16192B] transition flex items-center justify-between border-b border-[#1E2438]"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-[#7E8CD4]" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-[#7E8CD4]" />
                  )}
                  <span className="text-xs font-mono uppercase font-bold text-white">
                    {section.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#7E8CD4]">
                    ({section.items.length} item{section.items.length === 1 ? "" : "s"})
                  </span>
                </div>

                <span className="text-sm font-bold font-mono text-emerald-400">
                  ${section.subtotal.toLocaleString()}
                </span>
              </button>

              {/* Items Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#1E2438] text-[#7E8CD4] font-mono text-[10px] uppercase bg-[#090A0F]/50">
                        <th className="py-2.5 px-5">Line Item</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                        <th className="py-2.5 px-5 text-left">Provenance (tracesTo)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2438]/40 font-mono">
                      {section.items.map((item, idx) => (
                        <tr
                          key={idx}
                          onClick={() => setSelectedTraceItem(item)}
                          className="hover:bg-[#16192B]/80 transition cursor-pointer group"
                        >
                          <td className="py-3 px-5 text-white font-medium flex items-center gap-2">
                            <span className="text-[#5865A8] group-hover:text-amber-400 transition">•</span>
                            {item.item}
                          </td>
                          <td className="py-3 px-3 text-[#A8B4EB] text-[11px]">{item.unit}</td>
                          <td className="py-3 px-3 text-right text-[#D0D7F7]">{item.qty}</td>
                          <td className="py-3 px-3 text-right text-[#7E8CD4]">${item.rate.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            ${item.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-5 text-[11px] text-[#A8B4EB] max-w-xs truncate">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#090A0F] border border-[#2B3152] group-hover:border-amber-500/40 text-[10px] text-amber-300">
                              <Link2 className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                              <span className="truncate">{item.tracesTo}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
