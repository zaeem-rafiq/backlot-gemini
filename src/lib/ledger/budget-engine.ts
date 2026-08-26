import { Schedule } from "../types/schedule";
import { ScriptBreakdown, SceneBreakdown } from "../types/breakdown";
import {
  Budget,
  BudgetLineItem,
  BudgetSection,
  BudgetSummary,
} from "../types/budget";
import { DEFAULT_INDIE_RATE_CARD, RateCard } from "./rate-card";

export function buildBudget(
  schedule: Schedule,
  breakdown?: ScriptBreakdown,
  rateCard: RateCard = DEFAULT_INDIE_RATE_CARD
): Budget {
  const shootDays = schedule.stats.shootDays;
  const nightShoots = schedule.stats.nightShoots;
  const breakdownMap = new Map<number, SceneBreakdown>();

  if (breakdown?.breakdowns) {
    for (const b of breakdown.breakdowns) {
      breakdownMap.set(b.sceneId, b);
    }
  }

  // 1. Helper to find shoot days containing scenes with specific elements
  function getDaysWithScenesMatching(predicate: (b: SceneBreakdown) => boolean): {
    matchingDaysCount: number;
    matchingSceneIds: number[];
  } {
    const matchingSceneIds: number[] = [];
    if (breakdown?.breakdowns) {
      for (const b of breakdown.breakdowns) {
        if (predicate(b)) {
          matchingSceneIds.push(b.sceneId);
        }
      }
    }

    if (matchingSceneIds.length === 0) {
      return { matchingDaysCount: 0, matchingSceneIds: [] };
    }

    const matchingDays = schedule.days.filter((day) =>
      day.sceneIds.some((id) => matchingSceneIds.includes(id))
    );

    return {
      matchingDaysCount: matchingDays.length,
      matchingSceneIds,
    };
  }

  // Crew section
  const crewItems: BudgetLineItem[] = [];

  // Core crew
  crewItems.push({
    category: "Crew",
    item: "Director of Photography",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.directorOfPhotography,
    total: shootDays * rateCard.crewDaily.directorOfPhotography,
    tracesTo: `Director of Photography booked for ${shootDays} shoot day(s)`,
  });

  crewItems.push({
    category: "Crew",
    item: "1st Assistant Camera",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.firstAssistantCamera,
    total: shootDays * rateCard.crewDaily.firstAssistantCamera,
    tracesTo: `1st Assistant Camera booked for ${shootDays} shoot day(s)`,
  });

  crewItems.push({
    category: "Crew",
    item: "Gaffer",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.gaffer,
    total: shootDays * rateCard.crewDaily.gaffer,
    tracesTo: `Gaffer booked for ${shootDays} shoot day(s)`,
  });

  crewItems.push({
    category: "Crew",
    item: "Key Grip",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.keyGrip,
    total: shootDays * rateCard.crewDaily.keyGrip,
    tracesTo: `Key Grip booked for ${shootDays} shoot day(s)`,
  });

  crewItems.push({
    category: "Crew",
    item: "Production Sound Mixer",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.soundMixer,
    total: shootDays * rateCard.crewDaily.soundMixer,
    tracesTo: `Location Sound Mixer booked for ${shootDays} shoot day(s)`,
  });

  crewItems.push({
    category: "Crew",
    item: "1st Assistant Director",
    unit: "day",
    qty: shootDays,
    rate: rateCard.crewDaily.firstAssistantDirector,
    total: shootDays * rateCard.crewDaily.firstAssistantDirector,
    tracesTo: `1st Assistant Director booked for ${shootDays} shoot day(s)`,
  });

  const totalPaDays = shootDays * rateCard.crewDaily.paCount;
  crewItems.push({
    category: "Crew",
    item: "Production Assistants",
    unit: "day",
    qty: totalPaDays,
    rate: rateCard.crewDaily.productionAssistant,
    total: totalPaDays * rateCard.crewDaily.productionAssistant,
    tracesTo: `${rateCard.crewDaily.paCount} Production Assistant(s) booked across ${shootDays} shoot day(s)`,
  });

  // Conditional crew
  const stuntCheck = getDaysWithScenesMatching((b) => b.stunts.length > 0);
  if (stuntCheck.matchingDaysCount > 0) {
    crewItems.push({
      category: "Crew",
      item: "Stunt Coordinator",
      unit: "day",
      qty: stuntCheck.matchingDaysCount,
      rate: rateCard.crewDaily.stuntCoordinator,
      total: stuntCheck.matchingDaysCount * rateCard.crewDaily.stuntCoordinator,
      tracesTo: `Stunt Coordinator booked for ${stuntCheck.matchingDaysCount} day(s) ← stunts flagged in scene(s): ${stuntCheck.matchingSceneIds.join(", ")}`,
    });
  }

  const sfxCheck = getDaysWithScenesMatching((b) => b.sfx.length > 0);
  if (sfxCheck.matchingDaysCount > 0) {
    crewItems.push({
      category: "Crew",
      item: "Practical SFX Technician",
      unit: "day",
      qty: sfxCheck.matchingDaysCount,
      rate: rateCard.crewDaily.sfxTech,
      total: sfxCheck.matchingDaysCount * rateCard.crewDaily.sfxTech,
      tracesTo: `Practical SFX Tech booked for ${sfxCheck.matchingDaysCount} day(s) ← practical SFX flagged in scene(s): ${sfxCheck.matchingSceneIds.join(", ")}`,
    });
  }

  const animalCheck = getDaysWithScenesMatching((b) => b.animals.length > 0);
  if (animalCheck.matchingDaysCount > 0) {
    crewItems.push({
      category: "Crew",
      item: "Animal Wrangler",
      unit: "day",
      qty: animalCheck.matchingDaysCount,
      rate: rateCard.crewDaily.animalWrangler,
      total: animalCheck.matchingDaysCount * rateCard.crewDaily.animalWrangler,
      tracesTo: `Animal Wrangler booked for ${animalCheck.matchingDaysCount} day(s) ← live animals flagged in scene(s): ${animalCheck.matchingSceneIds.join(", ")}`,
    });
  }

  const hmuCheck = getDaysWithScenesMatching((b) => b.makeupHair.length > 0);
  if (hmuCheck.matchingDaysCount > 0) {
    crewItems.push({
      category: "Crew",
      item: "Key Hair & Makeup Artist",
      unit: "day",
      qty: hmuCheck.matchingDaysCount,
      rate: rateCard.crewDaily.hairMakeup,
      total: hmuCheck.matchingDaysCount * rateCard.crewDaily.hairMakeup,
      tracesTo: `Specialist HMU booked for ${hmuCheck.matchingDaysCount} day(s) ← special makeup/hair flagged in scene(s): ${hmuCheck.matchingSceneIds.join(", ")}`,
    });
  }

  const crewSubtotal = crewItems.reduce((acc, i) => acc + i.total, 0);

  // 2. Night Premium section
  const nightItems: BudgetLineItem[] = [];
  let nightPremiumTotal = 0;

  if (nightShoots > 0) {
    // Base daily crew cost
    const baseDailyCrewCost =
      rateCard.crewDaily.directorOfPhotography +
      rateCard.crewDaily.firstAssistantCamera +
      rateCard.crewDaily.gaffer +
      rateCard.crewDaily.keyGrip +
      rateCard.crewDaily.soundMixer +
      rateCard.crewDaily.firstAssistantDirector +
      rateCard.crewDaily.productionAssistant * rateCard.crewDaily.paCount;

    // Calculate exact crew cost on each night day
    let totalNightLaborBase = 0;
    const nightDays = schedule.days.filter((d) => d.shootType === "NIGHT");

    for (const nDay of nightDays) {
      let dayLabor = baseDailyCrewCost;
      if (stuntCheck.matchingSceneIds.some((id) => nDay.sceneIds.includes(id))) {
        dayLabor += rateCard.crewDaily.stuntCoordinator;
      }
      if (sfxCheck.matchingSceneIds.some((id) => nDay.sceneIds.includes(id))) {
        dayLabor += rateCard.crewDaily.sfxTech;
      }
      if (animalCheck.matchingSceneIds.some((id) => nDay.sceneIds.includes(id))) {
        dayLabor += rateCard.crewDaily.animalWrangler;
      }
      if (hmuCheck.matchingSceneIds.some((id) => nDay.sceneIds.includes(id))) {
        dayLabor += rateCard.crewDaily.hairMakeup;
      }
      totalNightLaborBase += dayLabor;
    }

    nightPremiumTotal = Math.round(totalNightLaborBase * rateCard.nightCrewPremiumRate);
    nightItems.push({
      category: "Night Premium",
      item: "Night Shoot Crew Labor Premium (15%)",
      unit: "percent",
      qty: nightShoots,
      rate: rateCard.nightCrewPremiumRate * 100,
      total: nightPremiumTotal,
      tracesTo: `15% night turnaround premium on $${totalNightLaborBase.toLocaleString()} labor across ${nightShoots} night shoot day(s)`,
    });
  }

  // 3. Cast section
  const castItems: BudgetLineItem[] = [];
  for (const [character, days] of Object.entries(schedule.stats.castDays)) {
    castItems.push({
      category: "Cast",
      item: `Cast: ${character}`,
      unit: "day",
      qty: days,
      rate: rateCard.castDaily.speakingPerformer,
      total: days * rateCard.castDaily.speakingPerformer,
      tracesTo: `Principal cast booking for ${character} across ${days} scheduled shoot day(s)`,
    });
  }

  // Background extras
  let totalBackgroundCount = 0;
  const bgSceneIds: number[] = [];
  if (breakdown?.breakdowns) {
    for (const b of breakdown.breakdowns) {
      if (b.background.length > 0) {
        totalBackgroundCount += b.background.length;
        bgSceneIds.push(b.sceneId);
      }
    }
  }

  if (totalBackgroundCount > 0) {
    castItems.push({
      category: "Cast",
      item: "Background Performers",
      unit: "per-person-day",
      qty: totalBackgroundCount,
      rate: rateCard.castDaily.backgroundPerformer,
      total: totalBackgroundCount * rateCard.castDaily.backgroundPerformer,
      tracesTo: `${totalBackgroundCount} background performer booking(s) across scene(s): ${bgSceneIds.join(", ")}`,
    });
  }

  const castSubtotal = castItems.reduce((acc, i) => acc + i.total, 0);

  // 4. Equipment section
  const equipmentItems: BudgetLineItem[] = [
    {
      category: "Equipment",
      item: "Camera Package (Cinema Body + Primes)",
      unit: "day",
      qty: shootDays,
      rate: rateCard.equipmentDaily.cameraPackage,
      total: shootDays * rateCard.equipmentDaily.cameraPackage,
      tracesTo: `Cinema camera and prime lens rental package for ${shootDays} shoot day(s)`,
    },
    {
      category: "Equipment",
      item: "Lighting & Grip Truck Package",
      unit: "day",
      qty: shootDays,
      rate: rateCard.equipmentDaily.lightingGripPackage,
      total: shootDays * rateCard.equipmentDaily.lightingGripPackage,
      tracesTo: `Indie lighting & grip package for ${shootDays} shoot day(s)`,
    },
    {
      category: "Equipment",
      item: "Field Audio Sound Package",
      unit: "day",
      qty: shootDays,
      rate: rateCard.equipmentDaily.soundPackage,
      total: shootDays * rateCard.equipmentDaily.soundPackage,
      tracesTo: `Multi-track field recorder, boom, and wireless lav kit for ${shootDays} shoot day(s)`,
    },
  ];
  const equipmentSubtotal = equipmentItems.reduce((acc, i) => acc + i.total, 0);

  // 5. Locations & Logistics section
  const totalLocationDays = schedule.days.reduce((acc, d) => acc + d.locations.length, 0);
  const locationItems: BudgetLineItem[] = [
    {
      category: "Locations & Logistics",
      item: "Location Permits & Site Fees",
      unit: "day",
      qty: totalLocationDays,
      rate: rateCard.locationsLogistics.locationPerDay,
      total: totalLocationDays * rateCard.locationsLogistics.locationPerDay,
      tracesTo: `Permit and site access fees for ${totalLocationDays} location-day(s) across ${shootDays} shoot day(s)`,
    },
  ];

  // Meals calculation: (Core Crew (8) + Conditional Crew + Cast on day) * $22/day
  let totalPersonDays = 0;
  const coreCrewSize = 8; // DP, AC, Gaffer, Grip, Sound, AD, 2 PAs
  for (const day of schedule.days) {
    let dayCrew = coreCrewSize;
    if (stuntCheck.matchingSceneIds.some((id) => day.sceneIds.includes(id))) dayCrew++;
    if (sfxCheck.matchingSceneIds.some((id) => day.sceneIds.includes(id))) dayCrew++;
    if (animalCheck.matchingSceneIds.some((id) => day.sceneIds.includes(id))) dayCrew++;
    if (hmuCheck.matchingSceneIds.some((id) => day.sceneIds.includes(id))) dayCrew++;

    const dayCast = day.castNeeded.length;
    totalPersonDays += dayCrew + dayCast;
  }

  locationItems.push({
    category: "Locations & Logistics",
    item: "Catering & Craft Services",
    unit: "per-person-day",
    qty: totalPersonDays,
    rate: rateCard.locationsLogistics.mealPerPersonPerDay,
    total: totalPersonDays * rateCard.locationsLogistics.mealPerPersonPerDay,
    tracesTo: `Daily hot meals and craft services ($${rateCard.locationsLogistics.mealPerPersonPerDay}/person/day) for ${totalPersonDays} total person-day(s)`,
  });

  if (schedule.stats.companyMoves > 0) {
    locationItems.push({
      category: "Locations & Logistics",
      item: "Company Move Transit & Fuel",
      unit: "flat",
      qty: schedule.stats.companyMoves,
      rate: rateCard.locationsLogistics.transportPerCompanyMove,
      total: schedule.stats.companyMoves * rateCard.locationsLogistics.transportPerCompanyMove,
      tracesTo: `Equipment truck & crew shuttle transit allowance for ${schedule.stats.companyMoves} scheduled company move(s)`,
    });
  }

  locationItems.push({
    category: "Locations & Logistics",
    item: "Production General Liability & Gear Insurance",
    unit: "flat",
    qty: 1,
    rate: rateCard.locationsLogistics.productionInsuranceFlat,
    total: rateCard.locationsLogistics.productionInsuranceFlat,
    tracesTo: "Short film general liability, third-party property damage, & equipment float insurance policy",
  });

  const locationsLogisticsSubtotal = locationItems.reduce((acc, i) => acc + i.total, 0);

  // 6. Post Production section
  const postItems: BudgetLineItem[] = [
    {
      category: "Post Production",
      item: "Picture Editor",
      unit: "flat",
      qty: 1,
      rate: rateCard.postProduction.editorFlat,
      total: rateCard.postProduction.editorFlat,
      tracesTo: "Picture edit assembly, rough cut revisions, and final picture lock (flat)",
    },
    {
      category: "Post Production",
      item: "Color Grading & Mastering",
      unit: "flat",
      qty: 1,
      rate: rateCard.postProduction.colorGradeFlat,
      total: rateCard.postProduction.colorGradeFlat,
      tracesTo: "Digital color grade, show LUT development, and conform mastering (flat)",
    },
    {
      category: "Post Production",
      item: "Sound Design, Foley & Mix",
      unit: "flat",
      qty: 1,
      rate: rateCard.postProduction.soundMixFlat,
      total: rateCard.postProduction.soundMixFlat,
      tracesTo: "Dialogue cleanup, custom sound design, Foley, and 5.1/stereo festival mix (flat)",
    },
    {
      category: "Post Production",
      item: "Score & Music Licensing",
      unit: "flat",
      qty: 1,
      rate: rateCard.postProduction.musicLicensingFlat,
      total: rateCard.postProduction.musicLicensingFlat,
      tracesTo: "Composer honorarium & indie festival sync/master rights licensing reserve (flat)",
    },
  ];

  // VFX shots count
  let vfxShotsCount = 0;
  const vfxSceneIds: number[] = [];
  if (breakdown?.breakdowns) {
    for (const b of breakdown.breakdowns) {
      if (b.vfx.length > 0) {
        vfxShotsCount += b.vfx.length;
        vfxSceneIds.push(b.sceneId);
      }
    }
  }

  if (vfxShotsCount > 0) {
    postItems.push({
      category: "Post Production",
      item: "Visual Effects (VFX) Compositing",
      unit: "per-shot",
      qty: vfxShotsCount,
      rate: rateCard.postProduction.vfxPerShot,
      total: vfxShotsCount * rateCard.postProduction.vfxPerShot,
      tracesTo: `VFX cleanup & compositing ($${rateCard.postProduction.vfxPerShot}/shot) for ${vfxShotsCount} shot(s) in scene(s): ${vfxSceneIds.join(", ")}`,
    });
  }

  const postSubtotal = postItems.reduce((acc, i) => acc + i.total, 0);

  // 7. Subtotals & Contingency
  const subtotalBeforeContingency =
    crewSubtotal +
    nightPremiumTotal +
    castSubtotal +
    equipmentSubtotal +
    locationsLogisticsSubtotal +
    postSubtotal;

  const contingencyTotal = Math.round(subtotalBeforeContingency * rateCard.contingencyRate);
  const grandTotal = subtotalBeforeContingency + contingencyTotal;

  const contingencyItems: BudgetLineItem[] = [
    {
      category: "Contingency",
      item: "Production Contingency Reserve (10%)",
      unit: "percent",
      qty: 1,
      rate: rateCard.contingencyRate * 100,
      total: contingencyTotal,
      tracesTo: `10% standard production contingency reserve against unforeseen weather, overtime, or material overages`,
    },
  ];

  const sections: BudgetSection[] = [
    { category: "Crew", subtotal: crewSubtotal, items: crewItems },
    ...(nightShoots > 0
      ? [{ category: "Night Premium" as const, subtotal: nightPremiumTotal, items: nightItems }]
      : []),
    { category: "Cast", subtotal: castSubtotal, items: castItems },
    { category: "Equipment", subtotal: equipmentSubtotal, items: equipmentItems },
    {
      category: "Locations & Logistics",
      subtotal: locationsLogisticsSubtotal,
      items: locationItems,
    },
    { category: "Post Production", subtotal: postSubtotal, items: postItems },
    { category: "Contingency", subtotal: contingencyTotal, items: contingencyItems },
  ];

  const summary: BudgetSummary = {
    crewSubtotal,
    nightPremiumTotal,
    castSubtotal,
    equipmentSubtotal,
    locationsLogisticsSubtotal,
    postSubtotal,
    subtotalBeforeContingency,
    contingencyTotal,
    grandTotal,
  };

  return {
    sections,
    summary,
    rateCardName: rateCard.name,
    currency: "USD",
  };
}
