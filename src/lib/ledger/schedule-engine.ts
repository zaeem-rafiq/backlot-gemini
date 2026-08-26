import { Scene, ScriptParse } from "../types/screenplay";
import { SceneBreakdown, ScriptBreakdown } from "../types/breakdown";
import { Schedule, ShootingDay, ScheduleStats, ShootType } from "../types/schedule";

export const COMPLEXITY_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.4,
  4: 1.9,
  5: 2.6,
};

export const BASE_EIGHTHS_PER_DAY = 36; // ≈ 4.5 pages per day
export const SCENE_SETUP_FLOOR_EIGHTHS = 3; // Minimum 3/8 page per scene
export const COMPANY_MOVE_PENALTY_EIGHTHS = 6; // 6/8 page capacity cost for location change

export interface ScheduleOptions {
  baseEighthsPerDay?: number;
  setupFloorEighths?: number;
  companyMovePenalty?: number;
}

export function calculateSceneEffectiveEighths(
  pageEighths: number,
  complexity: number = 2,
  setupFloor: number = SCENE_SETUP_FLOOR_EIGHTHS
): number {
  const flooredEighths = Math.max(pageEighths, setupFloor);
  const multiplier = COMPLEXITY_MULTIPLIERS[complexity] ?? 1.0;
  return Math.round(flooredEighths * multiplier * 10) / 10;
}

export function getSceneShootType(timeOfDay: Scene["timeOfDay"]): ShootType {
  return timeOfDay === "NIGHT" ? "NIGHT" : "DAY";
}

export function buildSchedule(
  scriptParse: ScriptParse,
  breakdown?: ScriptBreakdown,
  options: ScheduleOptions = {}
): Schedule {
  const baseCapacity = options.baseEighthsPerDay ?? BASE_EIGHTHS_PER_DAY;
  const setupFloor = options.setupFloorEighths ?? SCENE_SETUP_FLOOR_EIGHTHS;
  const movePenalty = options.companyMovePenalty ?? COMPANY_MOVE_PENALTY_EIGHTHS;

  const breakdownMap = new Map<number, SceneBreakdown>();
  if (breakdown?.breakdowns) {
    for (const b of breakdown.breakdowns) {
      breakdownMap.set(b.sceneId, b);
    }
  }

  // 1. Prepare scene descriptors
  interface ScheduledSceneItem {
    scene: Scene;
    breakdown?: SceneBreakdown;
    shootType: ShootType;
    effectiveEighths: number;
    notes: string[];
  }

  const items: ScheduledSceneItem[] = scriptParse.scenes.map((scene) => {
    const bd = breakdownMap.get(scene.id);
    const complexity = bd?.complexity ?? 2;
    const effectiveEighths = calculateSceneEffectiveEighths(scene.pageEighths, complexity, setupFloor);
    const notes: string[] = [];

    if (scene.timeOfDay === "DAWN") {
      notes.push(`Scene ${scene.id}: Golden Hour (Dawn) shooting window required.`);
    } else if (scene.timeOfDay === "DUSK") {
      notes.push(`Scene ${scene.id}: Golden Hour (Dusk) shooting window required.`);
    }

    if (bd) {
      if (bd.stunts.length > 0) {
        notes.push(`Scene ${scene.id} Stunt: ${bd.stunts.join(", ")} (Stunt Coordinator on set).`);
      }
      if (bd.sfx.length > 0) {
        notes.push(`Scene ${scene.id} SFX: ${bd.sfx.join(", ")} (Practical SFX Tech required).`);
      }
      if (bd.animals.length > 0) {
        notes.push(`Scene ${scene.id} Animals: ${bd.animals.join(", ")} (Animal Wrangler required).`);
      }
      if (bd.makeupHair.length > 0) {
        notes.push(`Scene ${scene.id} HMU: ${bd.makeupHair.join(", ")} (Special HMU prep required).`);
      }
    }

    return {
      scene,
      breakdown: bd,
      shootType: getSceneShootType(scene.timeOfDay),
      effectiveEighths,
      notes,
    };
  });

  // 2. Group scenes into blocks by (Location, ShootType), Day shoots first, preserving location discovery order
  const dayItems = items.filter((i) => i.shootType === "DAY");
  const nightItems = items.filter((i) => i.shootType === "NIGHT");

  function groupIntoBlocks(itemsList: ScheduledSceneItem[]): Array<{ location: string; shootType: ShootType; items: ScheduledSceneItem[] }> {
    const blocks: Array<{ location: string; shootType: ShootType; items: ScheduledSceneItem[] }> = [];
    const locationMap = new Map<string, ScheduledSceneItem[]>();

    for (const item of itemsList) {
      const loc = item.scene.location;
      if (!locationMap.has(loc)) {
        locationMap.set(loc, []);
      }
      locationMap.get(loc)!.push(item);
    }

    for (const [location, locItems] of locationMap.entries()) {
      if (locItems.length > 0) {
        blocks.push({
          location,
          shootType: locItems[0].shootType,
          items: locItems,
        });
      }
    }

    return blocks;
  }

  const orderedBlocks = [...groupIntoBlocks(dayItems), ...groupIntoBlocks(nightItems)];

  // 3. Bin-pack blocks into shooting days
  const shootingDays: ShootingDay[] = [];
  let currentDayNumber = 1;

  interface ActiveDayState {
    dayNumber: number;
    shootType: ShootType;
    sceneIds: number[];
    locations: string[];
    totalEighths: number;
    effectiveEighths: number;
    castNeeded: Set<string>;
    notes: Set<string>;
    companyMoves: number;
  }

  let activeDay: ActiveDayState | null = null;

  for (const block of orderedBlocks) {
    for (const item of block.items) {
      if (!activeDay) {
        activeDay = {
          dayNumber: currentDayNumber,
          shootType: item.shootType,
          sceneIds: [item.scene.id],
          locations: [item.scene.location],
          totalEighths: item.scene.pageEighths,
          effectiveEighths: item.effectiveEighths,
          castNeeded: new Set(item.scene.characters),
          notes: new Set(item.notes),
          companyMoves: 0,
        };
        continue;
      }

      // If shootType changes (e.g. Day to Night), always start a new day to preserve turnaround
      if (activeDay.shootType !== item.shootType) {
        shootingDays.push({
          dayNumber: activeDay.dayNumber,
          shootType: activeDay.shootType,
          sceneIds: activeDay.sceneIds,
          locations: activeDay.locations,
          totalEighths: activeDay.totalEighths,
          effectiveEighths: Math.round(activeDay.effectiveEighths * 10) / 10,
          castNeeded: Array.from(activeDay.castNeeded),
          notes: Array.from(activeDay.notes),
          companyMoves: activeDay.companyMoves,
        });

        currentDayNumber++;
        activeDay = {
          dayNumber: currentDayNumber,
          shootType: item.shootType,
          sceneIds: [item.scene.id],
          locations: [item.scene.location],
          totalEighths: item.scene.pageEighths,
          effectiveEighths: item.effectiveEighths,
          castNeeded: new Set(item.scene.characters),
          notes: new Set(item.notes),
          companyMoves: 0,
        };
        continue;
      }

      const isSameLocation = activeDay.locations.includes(item.scene.location);
      const moveCost = isSameLocation ? 0 : movePenalty;
      const prospectiveCapacity = activeDay.effectiveEighths + moveCost + item.effectiveEighths;

      if (prospectiveCapacity <= baseCapacity) {
        // Fits in current day
        activeDay.sceneIds.push(item.scene.id);
        if (!isSameLocation) {
          activeDay.locations.push(item.scene.location);
          activeDay.companyMoves += 1;
          activeDay.effectiveEighths += moveCost;
        }
        activeDay.totalEighths += item.scene.pageEighths;
        activeDay.effectiveEighths += item.effectiveEighths;
        item.scene.characters.forEach((c) => activeDay!.castNeeded.add(c));
        item.notes.forEach((n) => activeDay!.notes.add(n));
      } else {
        // Exceeds day capacity, seal active day and start next day
        shootingDays.push({
          dayNumber: activeDay.dayNumber,
          shootType: activeDay.shootType,
          sceneIds: activeDay.sceneIds,
          locations: activeDay.locations,
          totalEighths: activeDay.totalEighths,
          effectiveEighths: Math.round(activeDay.effectiveEighths * 10) / 10,
          castNeeded: Array.from(activeDay.castNeeded),
          notes: Array.from(activeDay.notes),
          companyMoves: activeDay.companyMoves,
        });

        currentDayNumber++;
        activeDay = {
          dayNumber: currentDayNumber,
          shootType: item.shootType,
          sceneIds: [item.scene.id],
          locations: [item.scene.location],
          totalEighths: item.scene.pageEighths,
          effectiveEighths: item.effectiveEighths,
          castNeeded: new Set(item.scene.characters),
          notes: new Set(item.notes),
          companyMoves: 0,
        };
      }
    }
  }

  if (activeDay) {
    shootingDays.push({
      dayNumber: activeDay.dayNumber,
      shootType: activeDay.shootType,
      sceneIds: activeDay.sceneIds,
      locations: activeDay.locations,
      totalEighths: activeDay.totalEighths,
      effectiveEighths: Math.round(activeDay.effectiveEighths * 10) / 10,
      castNeeded: Array.from(activeDay.castNeeded),
      notes: Array.from(activeDay.notes),
      companyMoves: activeDay.companyMoves,
    });
  }

  // 4. Calculate stats
  const shootDays = shootingDays.length;
  const nightShoots = shootingDays.filter((d) => d.shootType === "NIGHT").length;
  const companyMoves = shootingDays.reduce((acc, d) => acc + d.companyMoves, 0);
  const totalPageEighths = scriptParse.scenes.reduce((acc, s) => acc + s.pageEighths, 0);
  const totalEffectiveEighths = shootingDays.reduce((acc, d) => acc + d.effectiveEighths, 0);

  const castDays: Record<string, number> = {};
  for (const day of shootingDays) {
    for (const castMember of day.castNeeded) {
      castDays[castMember] = (castDays[castMember] || 0) + 1;
    }
  }

  const stats: ScheduleStats = {
    shootDays,
    nightShoots,
    companyMoves,
    totalPageEighths,
    totalEffectiveEighths: Math.round(totalEffectiveEighths * 10) / 10,
    castDays,
  };

  const assumptions = [
    `Base daily capacity: ${baseCapacity}/8 pages (≈${(baseCapacity / 8).toFixed(1)} pages/day) for non-union indie short.`,
    `Scene setup/strike floor: minimum ${setupFloor}/8 page per scene applied before complexity multipliers.`,
    `Complexity multipliers applied: 1-2=1.0x, 3=1.4x, 4=1.9x, 5=2.6x.`,
    `Company moves inside a day incur a ${movePenalty}/8 page (${(movePenalty / 8).toFixed(2)} hr equivalent) capacity deduction.`,
    `Turnaround protection: All DAY shoots scheduled before NIGHT shoots to prevent crew fatigue.`,
    `Golden hour windows (DAWN/DUSK) scheduled inside day blocks without incurring night crew premiums.`,
  ];

  return {
    days: shootingDays,
    stats,
    assumptions,
  };
}
