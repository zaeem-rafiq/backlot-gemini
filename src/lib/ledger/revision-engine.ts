import { ScriptParse, Scene } from "../types/screenplay";
import { ScriptBreakdown, SceneBreakdown } from "../types/breakdown";
import { Schedule } from "../types/schedule";
import { Budget, BudgetCategory, BudgetLineItem } from "../types/budget";
import { BoardPlan } from "../types/storyboard";
import {
  ScriptDiff,
  SceneDiff,
  ScheduleDelta,
  BudgetDelta,
  BudgetLineItemDiff,
  InvalidationManifest,
  RevisionAnalysis,
} from "../types/revision";

export function diffScriptParses(original: ScriptParse, revised: ScriptParse): ScriptDiff {
  const origMap = new Map<number, Scene>();
  for (const s of original.scenes) {
    origMap.set(s.id, s);
  }

  const revMap = new Map<number, Scene>();
  for (const s of revised.scenes) {
    revMap.set(s.id, s);
  }

  const scenesDiff: SceneDiff[] = [];
  const addedSceneIds: number[] = [];
  const removedSceneIds: number[] = [];
  const modifiedSceneIds: number[] = [];
  const unchangedSceneIds: number[] = [];

  let totalPagesDeltaEighths = 0;

  const allOrigCast = new Set<string>();
  for (const s of original.scenes) {
    for (const c of s.characters) allOrigCast.add(c.toUpperCase().trim());
  }

  const allRevCast = new Set<string>();
  for (const s of revised.scenes) {
    for (const c of s.characters) allRevCast.add(c.toUpperCase().trim());
  }

  const allOrigLocs = new Set<string>();
  for (const s of original.scenes) {
    allOrigLocs.add(s.location.toUpperCase().trim());
  }

  const allRevLocs = new Set<string>();
  for (const s of revised.scenes) {
    allRevLocs.add(s.location.toUpperCase().trim());
  }

  // Check revised scenes against original
  for (const revScene of revised.scenes) {
    const origScene = origMap.get(revScene.id);

    if (!origScene) {
      // Added scene
      addedSceneIds.push(revScene.id);
      totalPagesDeltaEighths += revScene.pageEighths;
      scenesDiff.push({
        sceneId: revScene.id,
        changeType: "added",
        revisedScene: revScene,
        changes: [`New scene added: "${revScene.slugline}" (${revScene.pageEighths}/8 pages)`],
        castAdded: revScene.characters,
        castRemoved: [],
        timeOfDayChanged: false,
        locationChanged: false,
        pageEighthsDelta: revScene.pageEighths,
      });
    } else {
      // Compare properties
      const changes: string[] = [];
      const locationChanged = origScene.location.trim().toUpperCase() !== revScene.location.trim().toUpperCase();
      const timeOfDayChanged = origScene.timeOfDay !== revScene.timeOfDay;
      const intExtChanged = origScene.intExt !== revScene.intExt;
      const pageEighthsDelta = revScene.pageEighths - origScene.pageEighths;
      totalPagesDeltaEighths += pageEighthsDelta;

      const origChars = new Set(origScene.characters.map((c) => c.toUpperCase().trim()));
      const revChars = new Set(revScene.characters.map((c) => c.toUpperCase().trim()));

      const castAdded = revScene.characters.filter((c) => !origChars.has(c.toUpperCase().trim()));
      const castRemoved = origScene.characters.filter((c) => !revChars.has(c.toUpperCase().trim()));

      if (locationChanged) {
        changes.push(`Location changed: "${origScene.location}" → "${revScene.location}"`);
      }
      if (timeOfDayChanged) {
        changes.push(`Time of day changed: ${origScene.timeOfDay} → ${revScene.timeOfDay}`);
      }
      if (intExtChanged) {
        changes.push(`Setting changed: ${origScene.intExt} → ${revScene.intExt}`);
      }
      if (pageEighthsDelta !== 0) {
        const sign = pageEighthsDelta > 0 ? "+" : "";
        changes.push(`Page length changed: ${origScene.pageEighths}/8 → ${revScene.pageEighths}/8 (${sign}${pageEighthsDelta}/8)`);
      }
      if (castAdded.length > 0) {
        changes.push(`Cast added: ${castAdded.join(", ")}`);
      }
      if (castRemoved.length > 0) {
        changes.push(`Cast removed: ${castRemoved.join(", ")}`);
      }
      if (origScene.summary.trim() !== revScene.summary.trim() && changes.length === 0) {
        changes.push(`Action and dramatic summary revised`);
      }

      if (changes.length > 0) {
        modifiedSceneIds.push(revScene.id);
        scenesDiff.push({
          sceneId: revScene.id,
          changeType: "modified",
          originalScene: origScene,
          revisedScene: revScene,
          changes,
          castAdded,
          castRemoved,
          timeOfDayChanged,
          locationChanged,
          pageEighthsDelta,
        });
      } else {
        unchangedSceneIds.push(revScene.id);
        scenesDiff.push({
          sceneId: revScene.id,
          changeType: "unchanged",
          originalScene: origScene,
          revisedScene: revScene,
          changes: [],
          castAdded: [],
          castRemoved: [],
          timeOfDayChanged: false,
          locationChanged: false,
          pageEighthsDelta: 0,
        });
      }
    }
  }

  // Check for deleted scenes
  for (const origScene of original.scenes) {
    if (!revMap.has(origScene.id)) {
      removedSceneIds.push(origScene.id);
      totalPagesDeltaEighths -= origScene.pageEighths;
      scenesDiff.push({
        sceneId: origScene.id,
        changeType: "removed",
        originalScene: origScene,
        changes: [`Scene ${origScene.id} ("${origScene.slugline}") removed from script`],
        castAdded: [],
        castRemoved: origScene.characters,
        timeOfDayChanged: false,
        locationChanged: false,
        pageEighthsDelta: -origScene.pageEighths,
      });
    }
  }

  // Sort diffs by sceneId
  scenesDiff.sort((a, b) => a.sceneId - b.sceneId);

  const globalCastAdded = Array.from(allRevCast).filter((c) => !allOrigCast.has(c));
  const globalCastRemoved = Array.from(allOrigCast).filter((c) => !allRevCast.has(c));
  const globalLocsAdded = Array.from(allRevLocs).filter((l) => !allOrigLocs.has(l));
  const globalLocsRemoved = Array.from(allOrigLocs).filter((l) => !allRevLocs.has(l));

  return {
    scenesDiff,
    addedSceneIds,
    removedSceneIds,
    modifiedSceneIds,
    unchangedSceneIds,
    totalPagesDeltaEighths,
    castChanges: {
      added: globalCastAdded,
      removed: globalCastRemoved,
    },
    locationChanges: {
      added: globalLocsAdded,
      removed: globalLocsRemoved,
    },
  };
}

export function calculateScheduleDelta(originalSched: Schedule, revisedSched: Schedule): ScheduleDelta {
  const origShootDays = originalSched.stats.shootDays;
  const revShootDays = revisedSched.stats.shootDays;
  const shootDaysDelta = revShootDays - origShootDays;

  const origMoves = originalSched.stats.companyMoves;
  const revMoves = revisedSched.stats.companyMoves;
  const companyMovesDelta = revMoves - origMoves;

  const origNight = originalSched.stats.nightShoots;
  const revNight = revisedSched.stats.nightShoots;
  const nightDaysDelta = revNight - origNight;

  const impactSummary: string[] = [];

  if (shootDaysDelta !== 0) {
    const sign = shootDaysDelta > 0 ? "+" : "";
    impactSummary.push(`${sign}${shootDaysDelta} Shooting Day(s) (Total: ${revShootDays} days)`);
  } else {
    impactSummary.push(`Shooting duration unchanged (${revShootDays} days)`);
  }

  if (companyMovesDelta !== 0) {
    const sign = companyMovesDelta > 0 ? "+" : "";
    impactSummary.push(`${sign}${companyMovesDelta} Company Move(s) (Total: ${revMoves} moves)`);
  }

  if (nightDaysDelta !== 0) {
    const sign = nightDaysDelta > 0 ? "+" : "";
    impactSummary.push(`${sign}${nightDaysDelta} Night Shoot Day(s) (Total: ${revNight} night calls)`);
  }

  return {
    originalShootDays: origShootDays,
    revisedShootDays: revShootDays,
    shootDaysDelta,
    originalCompanyMoves: origMoves,
    revisedCompanyMoves: revMoves,
    companyMovesDelta,
    originalNightDays: origNight,
    revisedNightDays: revNight,
    nightDaysDelta,
    impactSummary,
  };
}

export function calculateBudgetDelta(originalBudget: Budget, revisedBudget: Budget): BudgetDelta {
  const origGrandTotal = originalBudget.summary.grandTotal;
  const revGrandTotal = revisedBudget.summary.grandTotal;
  const grandTotalDelta = Math.round((revGrandTotal - origGrandTotal) * 100) / 100;
  const percentChange =
    origGrandTotal > 0 ? Math.round((grandTotalDelta / origGrandTotal) * 1000) / 10 : 0;

  const categoryDeltas: Record<BudgetCategory, number> = {
    Crew: 0,
    "Night Premium": 0,
    Cast: 0,
    Equipment: 0,
    "Locations & Logistics": 0,
    "Post Production": 0,
    Contingency: 0,
  };

  const categories: BudgetCategory[] = [
    "Crew",
    "Night Premium",
    "Cast",
    "Equipment",
    "Locations & Logistics",
    "Post Production",
    "Contingency",
  ];

  for (const cat of categories) {
    const origSec = originalBudget.sections.find((s) => s.category === cat);
    const revSec = revisedBudget.sections.find((s) => s.category === cat);
    const origSub = origSec?.subtotal ?? 0;
    const revSub = revSec?.subtotal ?? 0;
    categoryDeltas[cat] = Math.round((revSub - origSub) * 100) / 100;
  }

  // Index line items
  const origItemsMap = new Map<string, BudgetLineItem>();
  for (const sec of originalBudget.sections) {
    for (const item of sec.items) {
      origItemsMap.set(`${sec.category}::${item.item}`, item);
    }
  }

  const revItemsMap = new Map<string, BudgetLineItem>();
  for (const sec of revisedBudget.sections) {
    for (const item of sec.items) {
      revItemsMap.set(`${sec.category}::${item.item}`, item);
    }
  }

  const lineItemDiffs: BudgetLineItemDiff[] = [];

  // Revised items vs Original
  for (const [key, revItem] of revItemsMap.entries()) {
    const origItem = origItemsMap.get(key);
    if (!origItem) {
      lineItemDiffs.push({
        category: revItem.category,
        item: revItem.item,
        originalTotal: 0,
        revisedTotal: revItem.total,
        deltaTotal: revItem.total,
        tracesTo: revItem.tracesTo,
        status: "added",
      });
    } else {
      const deltaTotal = Math.round((revItem.total - origItem.total) * 100) / 100;
      let status: BudgetLineItemDiff["status"] = "unchanged";
      if (deltaTotal > 0) status = "increased";
      else if (deltaTotal < 0) status = "decreased";

      lineItemDiffs.push({
        category: revItem.category,
        item: revItem.item,
        originalTotal: origItem.total,
        revisedTotal: revItem.total,
        deltaTotal,
        tracesTo: revItem.tracesTo || origItem.tracesTo,
        status,
      });
    }
  }

  // Check for deleted items
  for (const [key, origItem] of origItemsMap.entries()) {
    if (!revItemsMap.has(key)) {
      lineItemDiffs.push({
        category: origItem.category,
        item: origItem.item,
        originalTotal: origItem.total,
        revisedTotal: 0,
        deltaTotal: -origItem.total,
        tracesTo: origItem.tracesTo,
        status: "removed",
      });
    }
  }

  // Primary drivers
  const primaryDrivers: string[] = [];
  for (const cat of categories) {
    const d = categoryDeltas[cat];
    if (Math.abs(d) > 0) {
      const sign = d > 0 ? "+$" : "-$";
      const absVal = Math.abs(d).toLocaleString();
      primaryDrivers.push(`${cat} variance: ${sign}${absVal}`);
    }
  }

  return {
    originalGrandTotal: origGrandTotal,
    revisedGrandTotal: revGrandTotal,
    grandTotalDelta,
    percentChange,
    categoryDeltas,
    lineItemDiffs,
    primaryDrivers,
  };
}

export function computeInvalidationManifest(
  diff: ScriptDiff,
  originalBoard?: BoardPlan
): InvalidationManifest {
  const staleSceneIds = [...diff.modifiedSceneIds, ...diff.removedSceneIds];
  const reasonBySceneId: Record<string, string> = {};

  for (const d of diff.scenesDiff) {
    if (d.changeType === "modified" || d.changeType === "removed") {
      reasonBySceneId[String(d.sceneId)] = d.changes.join("; ");
    }
  }

  const staleFrameIds: string[] = [];
  const reusableFrameIds: string[] = [];

  if (originalBoard?.frames) {
    for (const frame of originalBoard.frames) {
      if (staleSceneIds.includes(frame.sceneId)) {
        staleFrameIds.push(frame.frameId);
      } else {
        reusableFrameIds.push(frame.frameId);
      }
    }
  }

  return {
    staleSceneIds,
    staleFrameIds,
    reusableFrameIds,
    reasonBySceneId,
  };
}

export function analyzeScriptRevision(
  originalScript: ScriptParse,
  revisedScript: ScriptParse,
  originalSched: Schedule,
  revisedSched: Schedule,
  originalBudget: Budget,
  revisedBudget: Budget,
  originalBoard?: BoardPlan
): RevisionAnalysis {
  const scriptDiff = diffScriptParses(originalScript, revisedScript);
  const scheduleDelta = calculateScheduleDelta(originalSched, revisedSched);
  const budgetDelta = calculateBudgetDelta(originalBudget, revisedBudget);
  const invalidationManifest = computeInvalidationManifest(scriptDiff, originalBoard);

  return {
    scriptDiff,
    scheduleDelta,
    budgetDelta,
    invalidationManifest,
    timestamp: new Date().toISOString(),
  };
}

export interface SceneTextChunk {
  sceneId: number;
  header: string;
  body: string;
  normalizedText: string;
}

export function segmentScreenplayText(text: string): Map<number, SceneTextChunk> {
  const chunks = new Map<number, SceneTextChunk>();
  const lines = text.split("\n");
  let currentSceneId: number | null = null;
  let currentHeader = "";
  let currentBodyLines: string[] = [];
  let autoSceneCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const sceneMatch = trimmed.match(/^SCENE\s+(\d+)/i);
    const headingMatch = trimmed.match(/^(?:INT\.|EXT\.|INT_EXT\.|INT\.\/EXT\.|INT\/EXT)\s+/i);

    if (sceneMatch) {
      if (currentSceneId !== null) {
        const body = currentBodyLines.join("\n").trim();
        chunks.set(currentSceneId, {
          sceneId: currentSceneId,
          header: currentHeader,
          body,
          normalizedText: `${currentHeader}\n${body}`.trim(),
        });
      }
      currentSceneId = parseInt(sceneMatch[1], 10);
      currentHeader = "";
      currentBodyLines = [];
    } else if (headingMatch) {
      if (currentSceneId === null || currentHeader !== "") {
        if (currentSceneId !== null && currentHeader !== "") {
          const body = currentBodyLines.join("\n").trim();
          chunks.set(currentSceneId, {
            sceneId: currentSceneId,
            header: currentHeader,
            body,
            normalizedText: `${currentHeader}\n${body}`.trim(),
          });
          currentSceneId = autoSceneCounter++;
          currentHeader = trimmed;
          currentBodyLines = [];
        } else {
          currentHeader = trimmed;
        }
      } else {
        currentHeader = trimmed;
      }
    } else if (currentSceneId !== null) {
      currentBodyLines.push(line);
    }
  }

  if (currentSceneId !== null) {
    const body = currentBodyLines.join("\n").trim();
    chunks.set(currentSceneId, {
      sceneId: currentSceneId,
      header: currentHeader,
      body,
      normalizedText: `${currentHeader}\n${body}`.trim(),
    });
  }

  return chunks;
}

export function pinUnchangedScenes(
  originalText: string,
  revisedText: string,
  originalParse: ScriptParse,
  originalBreakdown?: ScriptBreakdown,
  reanalyzedParse?: ScriptParse,
  reanalyzedBreakdown?: ScriptBreakdown
): {
  pinnedParse: ScriptParse;
  pinnedBreakdown?: ScriptBreakdown;
  pinnedSceneIds: number[];
  editedSceneIds: number[];
} {
  const origChunks = segmentScreenplayText(originalText);
  const revChunks = segmentScreenplayText(revisedText);

  const pinnedSceneIds: number[] = [];
  const editedSceneIds: number[] = [];

  const origSceneMap = new Map<number, Scene>();
  for (const s of originalParse.scenes) {
    origSceneMap.set(s.id, s);
  }

  const origBreakdownMap = new Map<number, SceneBreakdown>();
  if (originalBreakdown?.breakdowns) {
    for (const b of originalBreakdown.breakdowns) {
      origBreakdownMap.set(b.sceneId, b);
    }
  }

  const reanalyzedSceneMap = new Map<number, Scene>();
  if (reanalyzedParse?.scenes) {
    for (const s of reanalyzedParse.scenes) {
      reanalyzedSceneMap.set(s.id, s);
    }
  }

  const reanalyzedBreakdownMap = new Map<number, SceneBreakdown>();
  if (reanalyzedBreakdown?.breakdowns) {
    for (const b of reanalyzedBreakdown.breakdowns) {
      reanalyzedBreakdownMap.set(b.sceneId, b);
    }
  }

  const finalScenes: Scene[] = [];
  const finalBreakdowns: SceneBreakdown[] = [];

  // Determine all scenes present in revised screenplay
  const revisedSceneIds = Array.from(revChunks.keys()).sort((a, b) => a - b);
  const fallbackSceneIds = reanalyzedParse?.scenes.map((s) => s.id) || [];
  const allTargetSceneIds = revisedSceneIds.length > 0 ? revisedSceneIds : fallbackSceneIds;

  for (const sceneId of allTargetSceneIds) {
    const origChunk = origChunks.get(sceneId);
    const revChunk = revChunks.get(sceneId);

    const isIdentical =
      origChunk &&
      revChunk &&
      origChunk.normalizedText === revChunk.normalizedText &&
      origSceneMap.has(sceneId);

    if (isIdentical) {
      // 100% Verbatim Pin from prior run
      pinnedSceneIds.push(sceneId);
      const pinnedScene = origSceneMap.get(sceneId)!;
      finalScenes.push(pinnedScene);

      const pinnedBd = origBreakdownMap.get(sceneId);
      if (pinnedBd) {
        finalBreakdowns.push(pinnedBd);
      }
    } else {
      // Genuinely edited or new scene -> use reanalyzed
      editedSceneIds.push(sceneId);
      const reanalyzedScene = reanalyzedSceneMap.get(sceneId) || origSceneMap.get(sceneId);
      if (reanalyzedScene) {
        finalScenes.push(reanalyzedScene);
      }

      const reanalyzedBd = reanalyzedBreakdownMap.get(sceneId) || origBreakdownMap.get(sceneId);
      if (reanalyzedBd) {
        finalBreakdowns.push(reanalyzedBd);
      }
    }
  }

  return {
    pinnedParse: {
      title: reanalyzedParse?.title || originalParse.title,
      format: reanalyzedParse?.format || originalParse.format,
      logline: reanalyzedParse?.logline || originalParse.logline,
      scenes: finalScenes,
    },
    pinnedBreakdown: finalBreakdowns.length > 0 ? { breakdowns: finalBreakdowns } : undefined,
    pinnedSceneIds,
    editedSceneIds,
  };
}
