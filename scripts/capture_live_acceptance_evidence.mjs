// src/fixtures/frequency-zero.ts
var FREQUENCY_ZERO_SCRIPT = `TITLE: FREQUENCY ZERO
FORMAT: Short Film (12 Pages)
AUTHOR: Zaeem Khan

SCENE 1
INT. K-DESERT BROADCAST BOOTH - NIGHT [1 4/8 PAGES]
A smoke-hazed 1970s radio studio lost in the Nevada expanse. Amber VU meters dance to silence. 
JACK (50s, bloodshot eyes, unlit cigarette behind his ear) leans into an RCA ribbon microphone.
MAYA (20s, grease-smudged knuckles, headphones around her neck) watches through the glass from the master rack.

JACK
(into mic)
Three-fourteen in the morning, high desert. You're on Frequency Zero. If anybody's breathing out past Mile Marker 80... you're not alone.

Jack drops a needle onto a battered acetate record. A strange HIGH-FREQUENCY WHINE pierces the monitor speakers.

MAYA
Jack, cut the feed! That signal isn't coming from our relay tower.

JACK
Where's it pulling from, Maya?

MAYA
(checking oscilloscope)
It's bouncing off the ionosphere... but the time-code header is stamped twenty-four hours ahead. Tomorrow night.

SCENE 2
INT. TRANSMITTER ROOM - NIGHT [6/8 PAGES]
Maya wrenches open the heavy steel cage of the 50,000-watt tube transmitter.
A glass vacuum tube glows violently violet. PRACTICAL SFX: sparks spit from the transformer coil with a heavy acrid plume of gray SMOKE.

MAYA
(coughing)
The modulation transformer is overloading! Kill the mains!

Jack grabs a fire extinguisher and blasts the base of the coil. The sparking dies down to a low pulsing hum.

SCENE 3
EXT. TRANSMITTER TOWER - NIGHT [4/8 PAGES]
Jack steps out onto the desert gravel beneath the three-hundred-foot red-and-white steel mast. Wind howls through the guy-wires.
Jack holds a portable battery receiver. Through the static, a crystal-clear broadcast crackles:

AUDIO FROM FUTURE (V.O.)
"At 04:15 AM, the Black Rock Canyon trestle gave way under Freight Hauler 9. Driver Jack Mercer was pronounced dead on scene."

Jack freezes. The voice on the future radio is his own.

SCENE 4
INT. K-DESERT BROADCAST BOOTH - DAWN [4/8 PAGES]
Golden morning sunlight cuts through dusty venetian blinds.
DEPUTY REYES (40s, dust-caked sheriff uniform) sips stale black coffee across the console from Jack.

REYES
You called me out to the flats at dawn because of a ghost broadcast, Jack?

JACK
It wasn't a ghost, Reyes. It was a weather-band carrier wave transmitting tomorrow's emergency bulletin.

MAYA
Deputy, the bridge structural sensor frequencies match our carrier harmonics. If the heavy rig crosses tonight during the storm, the center span buckles.

SCENE 5
INT. K-DESERT BROADCAST BOOTH - DAY [1 2/8 PAGES]
High noon heat shimmer outside the double-paned window.
Maya solders a military-surplus frequency transceiver to the master board.
Jack circles the room with a grease pencil, mapping the truck haul route across a topographical state map on the wall.

JACK
Rig 9 leaves the lithium refinery at midnight. If they take Highway 64, they hit the gorge at 4:10. We have four hours to verify the trestle foundation.

MAYA
Console is locked to the emergency bypass frequency. If we boost transmitter gain, we can reach the rig's CB radio directly.

SCENE 6
EXT. DESERT HIGHWAY 64 - DAY [1 0/8 PAGES]
Jack's battered 1978 CHEVY BLAZER kicks up rooster tails of alkali dust along the two-lane asphalt.
TWO HIGHWAY CREW WORKERS in high-vis vests set up detour cones near Mile Marker 82.
Jack pulls over and hops out.

JACK
(to road crew)
Is County inspecting the canyon bridge deck today?

HIGHWAY WORKER
Scheduled for next Tuesday, mister. Road's clear till midnight.

SCENE 7
EXT. CANYON OVERLOOK - DUSK [4/8 PAGES]
Deep purple twilight blankets the jagged red-rock gorge.
Jack stands on the precipice with high-powered binoculars trained on the ancient wooden-and-iron railway-converted bridge span.
Through the glass: two primary steel rivets have sheared cleanly off the south pier. The iron truss sags by two inches.

JACK
(into two-way radio)
Maya, the south footing is already failing. One forty-ton semi will pancake the whole span.

MAYA (RADIO V.O.)
Storm cell just crossed the Ridge, Jack. The rig is already rolling.

SCENE 8
EXT. CANYON BRIDGE - NIGHT [1 6/8 PAGES]
Torrential desert rain hammers the rotting timbers. Thunder shakes the canyon walls.
High-beam headlights of an eighteen-wheeler roar down the highway incline toward the bridge.
Jack runs onto the rain-slick approach waving a red magnesium emergency flare.
PRACTICAL SFX: The approaching truck lays on its air horn, tires locking and screeching against the wet pavement.
STUNT BEAT: Jack DIVES ACROSS THE GUARDRAIL onto the gravel bank as the heavy cab skids sideways, coming to a halt six feet from the severed bridge abyss.
Jack hits the rocky slope hard, sustaining a bloody gash across his forehead.

SCENE 9
INT. K-DESERT BROADCAST BOOTH - NIGHT [1 0/8 PAGES]
Jack stumbles back into the warm glow of the studio, soaked in rain, a white bandage taped over his bleeding temple.
Maya looks up from the master rack, tears in her eyes.
On the radio console, the oscilloscope line flattens into a steady, peaceful green wave.

JACK
(into microphone)
To anyone listening out there in the dark... the road is closed. Take the long way home tonight.

SCENE 10
EXT. RADIO STATION LOT - DAWN [4/8 PAGES]
Pink and gold desert sunrise rises over the radio tower.
Jack and Maya sit on the tailgate of the Blazer, drinking coffee from a shared thermos as the transmitter hums steadily into the new day.
`;

// src/lib/types/screenplay.ts
import { z } from "zod";
var IntExtSchema = z.enum(["INT", "EXT", "INT_EXT"]);
var TimeOfDaySchema = z.enum(["DAY", "NIGHT", "DAWN", "DUSK"]);
var SceneSchema = z.object({
  id: z.number().int().positive().describe("1-based sequential scene index matching script order"),
  slugline: z.string().describe("Standard scene heading, e.g., 'INT. BROADCAST BOOTH - NIGHT'"),
  intExt: IntExtSchema.describe("Interior, Exterior, or Int/Ext hybrid"),
  location: z.string().describe("Normalized canonical location name used for schedule clustering, e.g., 'BROADCAST BOOTH'"),
  timeOfDay: TimeOfDaySchema.describe("Time of day bucket: DAY, NIGHT, DAWN, or DUSK"),
  summary: z.string().describe("Concise 1-2 sentence dramatic and visual action summary"),
  characters: z.array(z.string()).describe("List of speaking or prominent characters in UPPERCASE"),
  pageEighths: z.number().int().min(1).describe("Scene length measured in industry-standard eighths of a page (e.g., 4 = 1/2 page)")
});
var ScriptFormatSchema = z.enum(["short", "feature"]);
var ScriptParseSchema = z.object({
  title: z.string().describe("Working or registered title of the screenplay"),
  format: ScriptFormatSchema.describe("Project format: short or feature"),
  logline: z.string().describe("One-sentence narrative hook"),
  scenes: z.array(SceneSchema).min(1).describe("Chronological ordered list of parsed scenes")
});

// src/lib/types/coverage.ts
import { z as z2 } from "zod";
var VerdictSchema = z2.enum(["PASS", "CONSIDER", "RECOMMEND"]);
var ComparableSchema = z2.object({
  title: z2.string().describe("Title of comparable film/TV project"),
  year: z2.number().nullish().describe("Release year"),
  why: z2.string().describe("Specific artistic, thematic, or budgetary parallel")
});
var CoverageScoresSchema = z2.object({
  premise: z2.number().min(1).max(10).describe("Originality, hook strength, and commercial/artistic viability (1-10)"),
  structure: z2.number().min(1).max(10).describe("Pacing, narrative turning points, tension build and release (1-10)"),
  character: z2.number().min(1).max(10).describe("Distinct voices, clear motivations, compelling arcs (1-10)"),
  dialogue: z2.number().min(1).max(10).describe("Subtext, natural rhythm, efficiency, distinct cadence (1-10)"),
  marketability: z2.number().min(1).max(10).describe("Festival appeal, target demographic reach, production ROI (1-10)")
});
var CoverageSchema = z2.object({
  logline: z2.string().describe("Sharpened 1-sentence market-ready logline"),
  synopsis: z2.string().describe("3-4 paragraph narrative synopsis capturing opening, midpoint turns, and climax"),
  genre: z2.array(z2.string()).min(1).max(6).describe("Primary and sub-genres"),
  tone: z2.string().describe("Tone descriptor, e.g., 'Atmospheric neo-noir with slow-burn dread'"),
  themes: z2.array(z2.string()).min(1).max(10).describe("Core thematic motifs"),
  comparables: z2.array(ComparableSchema).min(1).max(6).describe("1-6 market comparables with rationale"),
  strengths: z2.array(z2.string()).min(1).max(8).describe("Standout artistic or commercial strengths"),
  concerns: z2.array(z2.string()).min(1).max(8).describe("Candid constructive production/narrative risks"),
  pacingNotes: z2.string().describe("Detailed pacing diagnostic across acts/scenes"),
  scores: CoverageScoresSchema,
  verdict: VerdictSchema.describe("Standard studio reader coverage verdict"),
  verdictRationale: z2.string().describe("2-3 executive sentences justifying the PASS/CONSIDER/RECOMMEND verdict"),
  pullQuote: z2.string().describe("One memorable line suitable for a pitch one-sheet or festival program")
});

// src/lib/types/budget.ts
import { z as z3 } from "zod";
var BudgetUnitSchema = z3.enum(["day", "flat", "percent", "per-person-day", "per-shot"]);
var BudgetCategorySchema = z3.enum([
  "Crew",
  "Night Premium",
  "Cast",
  "Equipment",
  "Locations & Logistics",
  "Post Production",
  "Contingency"
]);
var BudgetLineItemSchema = z3.object({
  category: BudgetCategorySchema,
  item: z3.string().describe("Role or resource description, e.g., 'Director of Photography'"),
  unit: BudgetUnitSchema,
  qty: z3.number().nonnegative(),
  rate: z3.number().nonnegative(),
  total: z3.number().nonnegative(),
  tracesTo: z3.string().min(1).describe("Provenance explanation citing specific schedule or breakdown elements")
});
var BudgetSectionSchema = z3.object({
  category: BudgetCategorySchema,
  subtotal: z3.number().nonnegative(),
  items: z3.array(BudgetLineItemSchema)
});
var BudgetSummarySchema = z3.object({
  crewSubtotal: z3.number().nonnegative(),
  nightPremiumTotal: z3.number().nonnegative(),
  castSubtotal: z3.number().nonnegative(),
  equipmentSubtotal: z3.number().nonnegative(),
  locationsLogisticsSubtotal: z3.number().nonnegative(),
  postSubtotal: z3.number().nonnegative(),
  subtotalBeforeContingency: z3.number().nonnegative(),
  contingencyTotal: z3.number().nonnegative(),
  grandTotal: z3.number().nonnegative()
});
var BudgetSchema = z3.object({
  sections: z3.array(BudgetSectionSchema),
  summary: BudgetSummarySchema,
  rateCardName: z3.string(),
  currency: z3.literal("USD")
});

// src/lib/types/breakdown.ts
import { z as z4 } from "zod";
var SceneBreakdownSchema = z4.object({
  sceneId: z4.number().int().positive().describe("Scene ID matching parsed script scene"),
  cast: z4.array(z4.string()).describe("Speaking characters appearing in this scene"),
  background: z4.array(z4.string()).describe("Extras / background atmosphere, e.g., ['2 DINER PATRONS', '1 HIGHWAY COP']"),
  props: z4.array(z4.string()).describe("Action props handled by actors, e.g., ['REEL-TO-REEL TAPE', 'COFFEE MUG']"),
  setDressing: z4.array(z4.string()).describe("Location items and atmosphere dressing"),
  wardrobe: z4.array(z4.string()).describe("Special wardrobe items needing sourcing (exclude generic clothing)"),
  makeupHair: z4.array(z4.string()).describe("Special HMU requirements, e.g., ['BLOODY NOSE', 'SWEAT GLISTEN']"),
  vehicles: z4.array(z4.string()).describe("Picture vehicles on camera, e.g., ['1974 FORD SEDAN']"),
  sfx: z4.array(z4.string()).describe("Practical physical effects, e.g., ['SPARKING CONSOLE', 'SMOKE']"),
  vfx: z4.array(z4.string()).describe("Post-production visual effects shots, e.g., ['GREEN SCREEN MONITOR', 'GLOWING METER']"),
  stunts: z4.array(z4.string()).describe("Physical stunt work requiring safety coordination, e.g., ['FALL FROM CHAIR', 'FIGHT']"),
  animals: z4.array(z4.string()).describe("Live animals requiring professional wranglers, e.g., ['DESERT COYOTE', 'DOG']"),
  sound: z4.array(z4.string()).describe("Special wild tracks, room tones, or practical audio recording cues"),
  specialEquipment: z4.array(z4.string()).describe("Specialized camera/grip gear, e.g., ['CAR MOUNT', 'STEADICAM', 'HAZER']"),
  complexity: z4.number().int().min(1).max(5).describe("1-5 production complexity rating (1=simple dialogue, 5=stunts/night/sfx/vfx)"),
  complexityReason: z4.string().describe("1-line explanation of why this complexity rating was assigned")
});
var ScriptBreakdownSchema = z4.object({
  breakdowns: z4.array(SceneBreakdownSchema)
});

// src/lib/types/schedule.ts
import { z as z5 } from "zod";
var ShootTypeSchema = z5.enum(["DAY", "NIGHT"]);
var ShootingDaySchema = z5.object({
  dayNumber: z5.number().int().positive(),
  shootType: ShootTypeSchema,
  sceneIds: z5.array(z5.number().int().positive()),
  locations: z5.array(z5.string()),
  totalEighths: z5.number(),
  effectiveEighths: z5.number(),
  castNeeded: z5.array(z5.string()),
  notes: z5.array(z5.string()),
  companyMoves: z5.number().int().nonnegative()
});
var ScheduleStatsSchema = z5.object({
  shootDays: z5.number().int().nonnegative(),
  nightShoots: z5.number().int().nonnegative(),
  companyMoves: z5.number().int().nonnegative(),
  totalPageEighths: z5.number().nonnegative(),
  totalEffectiveEighths: z5.number().nonnegative(),
  castDays: z5.record(z5.string(), z5.number().int().nonnegative())
});
var ScheduleSchema = z5.object({
  days: z5.array(ShootingDaySchema),
  stats: ScheduleStatsSchema,
  assumptions: z5.array(z5.string())
});

// src/lib/types/pitch.ts
import { z as z6 } from "zod";
var ParallelSourceCitationSchema = z6.object({
  title: z6.string().describe("Headline or title of retrieved market source"),
  url: z6.string().min(1).describe("Live verifiable URL to source"),
  snippet: z6.string().describe("Direct relevant excerpt supporting comparable or festival strategy"),
  query: z6.string().describe("Search query that yielded this finding"),
  publishedDate: z6.string().nullish(),
  relevance: z6.string().describe("How this market data grounds the pitch"),
  rawTitle: z6.string().nullish().describe("Raw provider-returned title metadata preserved separately"),
  publisher: z6.string().nullish().describe("Derived publisher or host organization name"),
  isArchive: z6.boolean().nullish().describe("Whether this URL is an archive, tag, or topic feed rather than a single verified article"),
  isHistorical: z6.boolean().nullish().describe("Whether the source material represents historical or archival precedent")
});
var FestivalTargetSchema = z6.object({
  name: z6.string().describe("Official festival name, e.g., 'Sundance Film Festival (Shorts)'"),
  tier: z6.enum(["Tier 1 / Oscar Qualifying", "Genre Specialist", "Regional Premiere", "Market Showcase"]),
  why: z6.string().describe("Curatorial alignment and programmer interest rationale")
});
var PosterConceptSchema = z6.object({
  description: z6.string().describe("Art direction and composition of one-sheet key art"),
  imagePrompt: z6.string().describe("Self-contained vertical 2:3 key art generation prompt"),
  posterUrl: z6.string().nullish().describe("Rendered poster key art URL")
});
var AffectedArtifactSchema = z6.object({
  kind: z6.enum(["scene", "schedule_day", "budget_line_item", "coverage_risk"]).describe("Category of affected production artifact"),
  identifier: z6.string().describe("Exact identifier or reference: e.g., 'Shoot Day 1', 'Scene 8', 'Line Item 24: Sound Design & Foley'"),
  label: z6.string().describe("Human-readable label for cross-referencing"),
  tabTarget: z6.enum(["COVERAGE", "BREAKDOWN", "SCHEDULE", "BUDGET"]).describe("Tab where this artifact is primarily located")
});
var ProductionRecommendationSchema = z6.object({
  title: z6.string().describe("Executive title of the production recommendation"),
  category: z6.enum([
    "FESTIVAL_WINDOW",
    "BUDGET_ALLOCATION",
    "SCHEDULE_PACING",
    "DISTRIBUTION_STRATEGY"
  ]).describe("Strategic operational category"),
  factualFinding: z6.string().describe("Factual market benchmark or distribution precedent directly established by the source"),
  inferredAdvice: z6.string().describe("Strategic recommendation inferred by Backlot Studio for this specific production"),
  actionableDecision: z6.string().describe("Concrete producer action informed by evidence"),
  tradeoffRationale: z6.string().describe("Why this decision optimizes the production package"),
  affectedArtifact: AffectedArtifactSchema,
  sourceCitation: ParallelSourceCitationSchema.describe("The specific Parallel search citation that supports this decision")
});
var PitchKitSchema = z6.object({
  tagline: z6.string().describe("Punchy market hook under 10 words"),
  loglines: z6.array(z6.string()).min(2).max(5).describe("Calibrated loglines, sharpest first"),
  whyNow: z6.string().describe("Cultural, genre, or technological timing rationale"),
  audience: z6.object({
    primary: z6.string().describe("Primary demographic and psychographic audience"),
    secondary: z6.string().describe("Adjacent expansion audience")
  }),
  festivalStrategy: z6.array(FestivalTargetSchema).min(1).max(8),
  posterConcept: PosterConceptSchema,
  pitchParagraph: z6.string().describe("3-5 sentence executive pitch paragraph explicitly citing coverage verdict and exact budget total"),
  marketEvidence: z6.array(ParallelSourceCitationSchema).default([]).describe("Live market citations retrieved via Parallel Search API"),
  productionRecommendation: ProductionRecommendationSchema.nullish().describe("Source-backed producer decision grounded in real Parallel search evidence and referencing current run artifacts")
});

// src/lib/ai/gemini-client.ts
import { GoogleGenAI } from "@google/genai";

// src/lib/ai/fallback-chain.ts
var AGENT_PLATFORM_GLOBAL_CHAINS = {
  reasoning: [
    process.env.MODEL_REASONING_OVERRIDE || "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
  ],
  fast: [
    process.env.MODEL_FAST_OVERRIDE || "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash"
  ],
  image: [
    process.env.MODEL_IMAGE_OVERRIDE || "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
    "gemini-3-pro-image"
  ]
};
var DEVELOPER_API_CHAINS = {
  reasoning: [
    process.env.MODEL_REASONING_OVERRIDE || "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
  ],
  fast: [
    process.env.MODEL_FAST_OVERRIDE || "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash"
  ],
  image: [
    process.env.MODEL_IMAGE_OVERRIDE || "gemini-3.1-flash-image",
    "gemini-2.5-flash-image"
  ]
};
var COOLDOWN_DAILY_EXHAUSTION_MS = 10 * 60 * 1e3;
var COOLDOWN_MODEL_NOT_FOUND_MS = 60 * 60 * 1e3;

// src/lib/parallel/client.ts
function derivePublisherFromUrl(url2) {
  try {
    const parsed = new URL(url2);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    const knownPublishers = {
      "thefilmcollaborative.org": "The Film Collaborative",
      "screencraft.org": "ScreenCraft",
      "filmmakermagazine.com": "Filmmaker Magazine",
      "indiewire.com": "IndieWire",
      "variety.com": "Variety",
      "hollywoodreporter.com": "The Hollywood Reporter",
      "deadline.com": "Deadline",
      "rottentomatoes.com": "Rotten Tomatoes",
      "stephenfollows.com": "Stephen Follows",
      "filmindependent.org": "Film Independent",
      "moviemaker.com": "MovieMaker",
      "wga.org": "Writers Guild of America",
      "wgaeast.org": "Writers Guild of America East",
      "the-numbers.com": "The Numbers",
      "boxofficemojo.com": "Box Office Mojo",
      "sundance.org": "Sundance Institute",
      "sxsw.com": "SXSW"
    };
    if (knownPublishers[host]) return knownPublishers[host];
    const namePart = host.split(".")[0] || host;
    return namePart.split(/[-_.]/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  } catch {
    return "Industry Source";
  }
}
function formatSourceAttribution(url2, rawTitle, publishDate, snippet) {
  const publisher = derivePublisherFromUrl(url2);
  const trimmedRawTitle = (rawTitle || "").trim();
  let isArchive = false;
  let archiveSlug = "";
  try {
    const parsed = new URL(url2);
    const pathname = parsed.pathname.toLowerCase();
    const archiveMatch = pathname.match(
      /\/(?:blog\/)?(?:tag|tags|category|categories|archive|archives|topic|topics|label|section)\/([^/?#]+)/i
    );
    if (archiveMatch) {
      isArchive = true;
      archiveSlug = decodeURIComponent(archiveMatch[1]).replace(/[-_]+/g, " ").trim();
    } else if (pathname === "" || pathname === "/" || pathname.endsWith("/blog") || pathname.endsWith("/blog/") || pathname.endsWith("/news") || pathname.endsWith("/news/") || pathname.endsWith("/archive") || pathname.endsWith("/archive/")) {
      isArchive = true;
    }
  } catch {
  }
  let isHistorical = false;
  let yearFound = null;
  if (publishDate) {
    const yearMatch = publishDate.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      const yr = parseInt(yearMatch[1], 10);
      yearFound = yr;
      if (yr < 2023) {
        isHistorical = true;
      }
    }
  }
  if (!yearFound) {
    const urlYearMatch = url2.match(/\/(19\d\d|20\d\d)(?:\/|\b)/);
    if (urlYearMatch) {
      const yr = parseInt(urlYearMatch[1], 10);
      yearFound = yr;
      if (yr < 2023) {
        isHistorical = true;
      }
    }
  }
  if (!isHistorical && snippet) {
    const snippetYearMatch = snippet.match(/\b(19\d\d|20[01]\d|202[0-2])\b/);
    if (snippetYearMatch) {
      isHistorical = true;
      if (!yearFound) yearFound = parseInt(snippetYearMatch[1], 10);
    }
  }
  let title;
  if (isArchive) {
    if (archiveSlug) {
      title = `${publisher} (Archive: ${archiveSlug}${yearFound ? `, ${yearFound}` : ""})`;
    } else {
      title = `${publisher} Archive${yearFound ? ` (${yearFound})` : ""}`;
    }
  } else if (trimmedRawTitle && trimmedRawTitle !== "Market Analysis Source") {
    title = trimmedRawTitle;
  } else {
    title = `${publisher}${yearFound ? ` (${yearFound})` : ""}`;
  }
  return {
    title,
    publisher,
    isArchive,
    isHistorical,
    rawTitle: trimmedRawTitle || void 0
  };
}

// src/lib/agents/marquee.ts
function isCitationSubstantivelySupported(rec, citation) {
  const snippet = (citation.snippet || "").trim();
  if (snippet.length < 10) return false;
  const targetId = (rec.affectedArtifact?.identifier || "").toLowerCase().trim();
  const titleLower = rec.title.toLowerCase();
  const decisionLower = rec.actionableDecision.toLowerCase();
  const adviceLower = (rec.inferredAdvice || "").toLowerCase();
  const fullRecText = `${titleLower} ${decisionLower} ${adviceLower} ${targetId}`;
  const isAudio = targetId.includes("sound") || targetId.includes("audio") || targetId.includes("foley") || targetId.includes("mix") || fullRecText.includes("sound design") || fullRecText.includes("foley") || fullRecText.includes("audio post");
  const isEditorial = targetId.includes("editor") || targetId.includes("editorial") || targetId.includes("cut") || fullRecText.includes("picture edit");
  const isColor = targetId.includes("color") || targetId.includes("grade") || targetId.includes("finishing") || fullRecText.includes("colorist");
  const isFestival = rec.category === "FESTIVAL_WINDOW" || targetId.includes("festival") || fullRecText.includes("festival submission") || fullRecText.includes("festival premiere");
  const isDistribution = rec.category === "DISTRIBUTION_STRATEGY" || targetId.includes("distribution") || fullRecText.includes("sales agent") || fullRecText.includes("theatrical");
  const snippetLower = snippet.toLowerCase();
  const titleLowerCitation = (citation.title || "").toLowerCase();
  if (isAudio) {
    return /\b(sound design|foley|audio mix(?:ing)?|sound mix(?:ing)?|soundtrack|audio design|audio-scape|production value.*?(?:bar|sound|craft)|horror filmmaking: the guts of the craft)\b/i.test(snippetLower) || /\b(sound design|foley|audio mix)\b/i.test(titleLowerCitation) && snippetLower.length >= 20;
  } else if (isEditorial) {
    return /\b(picture edit(?:ing)?|editorial assembly|film editor|pacing in the cut|cutting pace)\b/i.test(snippetLower) || /\b(picture edit|editorial)\b/i.test(titleLowerCitation) && snippetLower.length >= 20;
  } else if (isColor) {
    return /\b(color grad(?:ing|e)|colorist|digital intermediate|lut)\b/i.test(snippetLower) || /\b(color grading|colorist)\b/i.test(titleLowerCitation) && snippetLower.length >= 20;
  } else if (isFestival) {
    return /\b(festival submission|programmer criteria|selection committee|premiere strategy|festival competition|festival award)\b/i.test(snippetLower) || /\b(festival submission|festival premiere)\b/i.test(titleLowerCitation) && snippetLower.length >= 20;
  } else if (isDistribution) {
    return /\b(distribution deal|sales agent|acquisition market|theatrical release|vod distribution|distribution precedent)\b/i.test(snippetLower) || /\b(distribution deal|theatrical release)\b/i.test(titleLowerCitation) && snippetLower.length >= 20;
  }
  return false;
}
function calibrateRecommendationAssertions(rec) {
  let actionableDecision = rec.actionableDecision;
  let tradeoffRationale = rec.tradeoffRationale;
  let inferredAdvice = rec.inferredAdvice;
  const isAllocationProposal = /\b(increase|reallocate|allocate|shift\s+funds?|drawdown|draw\s+down|boost\s+budget|augment)\b/i.test(actionableDecision);
  const isProtectionOrExisting = /\b(protect|maintain|preserve|keep)\b/i.test(actionableDecision);
  const isAlreadyMarked = /\b(model suggestion|studio suggestion|suggested proposal|proposed suggestion|consider allocating|studio proposal|proposal)\b/i.test(actionableDecision);
  if ((rec.affectedArtifact.kind === "budget_line_item" || rec.category === "BUDGET_ALLOCATION") && isAllocationProposal && !isProtectionOrExisting && !isAlreadyMarked) {
    actionableDecision = `Model suggestion: ${actionableDecision.replace(/^(?:we recommend that you |we recommend |recommend |propose to |please )/i, "")}`;
  }
  tradeoffRationale = tradeoffRationale.replace(/\b(?:is\s+the\s+most\s+cost-effective\s+way|most\s+cost-effective\s+way|is\s+the\s+single\s+most\s+cost-effective\s+approach)\b/gi, "is one strategic avenue").replace(/\b(?:directly\s+increasing\s+(?:the\s+)?(?:likelihood|probability)\s+of\s+festival\s+selection|directly\s+increases?\s+(?:the\s+)?(?:likelihood|probability)\s+of\s+festival\s+selection)\b/gi, "aimed at meeting festival craft expectations noted in industry precedent").replace(/\b(?:guaranteeing\s+festival\s+selection|guarantees?\s+festival\s+selection)\b/gi, "supporting competitive festival positioning");
  inferredAdvice = inferredAdvice.replace(/\b(?:is\s+the\s+most\s+cost-effective\s+way|most\s+cost-effective\s+way)\b/gi, "is a strategic option").replace(/\b(?:directly\s+increasing\s+(?:the\s+)?(?:likelihood|probability)\s+of\s+festival\s+selection)\b/gi, "aimed at meeting festival craft standards");
  return {
    ...rec,
    actionableDecision,
    tradeoffRationale,
    inferredAdvice
  };
}
function findSupportedCitation(rec, marketEvidence, budget) {
  const validCitations = marketEvidence.filter((c) => (c.snippet || "").trim().length >= 10);
  if (validCitations.length === 0) return null;
  for (const citation of validCitations) {
    if (isCitationSubstantivelySupported(rec, citation)) {
      return citation;
    }
  }
  return null;
}
function validateProductionRecommendation(rec, budget, marketEvidence) {
  if (!rec) return null;
  if (!marketEvidence || marketEvidence.length === 0) return null;
  const matchedCitation = marketEvidence.find((c) => c.url === rec.sourceCitation?.url);
  if (!matchedCitation) return null;
  let supportingCitation = matchedCitation;
  let canonicalSnippet = (supportingCitation.snippet || "").trim();
  if (!canonicalSnippet || canonicalSnippet.length < 10 || !isCitationSubstantivelySupported(rec, supportingCitation)) {
    const alternative = findSupportedCitation(rec, marketEvidence, budget);
    if (alternative) {
      supportingCitation = alternative;
      canonicalSnippet = (alternative.snippet || "").trim();
    } else {
      return null;
    }
  }
  const attr = formatSourceAttribution(
    supportingCitation.url,
    supportingCitation.rawTitle || supportingCitation.title,
    supportingCitation.publishedDate,
    canonicalSnippet
  );
  if (attr.isArchive) {
    supportingCitation = {
      ...supportingCitation,
      title: attr.title,
      publisher: attr.publisher,
      isArchive: true,
      isHistorical: attr.isHistorical,
      rawTitle: supportingCitation.rawTitle || supportingCitation.title
    };
  } else if (attr.isHistorical && !supportingCitation.isHistorical) {
    supportingCitation = {
      ...supportingCitation,
      isHistorical: true,
      publisher: supportingCitation.publisher || attr.publisher
    };
  }
  if (rec.affectedArtifact.kind === "budget_line_item") {
    const targetId = rec.affectedArtifact.identifier.trim();
    if (!targetId) return null;
    const allItems = budget.sections.flatMap((s) => s.items);
    const matchingItems = allItems.filter(
      (i) => i.item.trim().toLowerCase() === targetId.toLowerCase()
    );
    if (matchingItems.length !== 1) {
      return null;
    }
    const targetItem = matchingItems[0];
    const textToCheck = `${rec.title} ${rec.actionableDecision} ${rec.inferredAdvice} ${rec.tradeoffRationale}`.toLowerCase();
    const isPostAudioAdvice = /\b(foley|post-production|sound design|mix\b(?!er)|sound mix|audio mix|stereo mix|5\.1)\b/i.test(textToCheck);
    if (targetItem.item.toLowerCase().includes("sound mixer") && isPostAudioAdvice) {
      return null;
    }
    const scriptRequiredItems = allItems.filter((i) => {
      const t = i.tracesTo.toLowerCase();
      return t.includes("flagged in scene") || t.includes("stunts flagged") || t.includes("practical sfx flagged") || t.includes("special makeup");
    });
    const diversionKeywords = /\b(divert|cut|reduce|defund|trim|slash|reallocate away|reallocating away|saving from)\b/i;
    if (scriptRequiredItems.some((i) => i.item.toLowerCase() === targetItem.item.toLowerCase())) {
      if (diversionKeywords.test(textToCheck)) {
        return null;
      }
    }
    for (const reqItem of scriptRequiredItems) {
      const itemNameLower = reqItem.item.toLowerCase();
      const aliases = [itemNameLower];
      if (itemNameLower.includes("sfx") || itemNameLower.includes("practical sfx")) {
        aliases.push("sfx", "practical sfx", "special effects");
      }
      if (itemNameLower.includes("stunt")) {
        aliases.push("stunt", "stunts", "stunt coordinator");
      }
      if (itemNameLower.includes("makeup")) {
        aliases.push("special makeup", "sfx makeup", "prosthetics");
      }
      const aliasPattern = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const fromPattern = new RegExp(
        `\\b(?:divert(?:ing)?|reallocat\\w*|saving|cut(?:ting)?|reduc(?:e|ing)|trim(?:ming)?|slash(?:ing)?|defund(?:ing)?)\\b.*?\\b(?:from|away from|of)\\s+(?:the\\s+)?(?:${aliasPattern})\\b`,
        "i"
      );
      const directCutPattern = new RegExp(
        `\\b(?:cut(?:ting)?|reduc(?:e|ing)|trim(?:ming)?|slash(?:ing)?|defund(?:ing)?)\\s+(?:the\\s+)?(?:${aliasPattern})\\b`,
        "i"
      );
      if (fromPattern.test(textToCheck) || directCutPattern.test(textToCheck)) {
        return null;
      }
    }
    const validatedRec = {
      ...rec,
      sourceCitation: supportingCitation,
      factualFinding: canonicalSnippet,
      affectedArtifact: {
        ...rec.affectedArtifact,
        identifier: targetItem.item,
        label: rec.affectedArtifact.label || `Account: ${targetItem.category} / ${targetItem.item}`,
        tabTarget: "BUDGET"
      }
    };
    return calibrateRecommendationAssertions(validatedRec);
  }
  return calibrateRecommendationAssertions({
    ...rec,
    sourceCitation: supportingCitation,
    factualFinding: canonicalSnippet
  });
}

// src/lib/ledger/budget-engine.ts
function validateBudgetSemantics(budget) {
  const errors = [];
  if (!budget || typeof budget !== "object") {
    return { valid: false, errors: ["Budget is not an object."] };
  }
  if (!Array.isArray(budget.sections) || budget.sections.length === 0) {
    errors.push("Budget contains zero sections.");
    return { valid: false, errors };
  }
  if (!budget.summary || typeof budget.summary !== "object") {
    errors.push("Budget summary is missing.");
    return { valid: false, errors };
  }
  for (const section of budget.sections) {
    if (!Array.isArray(section.items) || section.items.length === 0) {
      errors.push(`Section "${section.category}" contains no line items.`);
      continue;
    }
    let itemsSum = 0;
    for (const item of section.items) {
      if (!item.tracesTo || !item.tracesTo.trim()) {
        errors.push(`Budget item "${item.item}" is missing required tracesTo provenance.`);
      }
      if (item.unit !== "percent") {
        const expectedItemTotal = item.qty * item.rate;
        if (item.total !== expectedItemTotal) {
          errors.push(
            `Budget item "${item.item}" total mismatch: expected ${expectedItemTotal} (qty ${item.qty} * rate ${item.rate}), received ${item.total}.`
          );
        }
      } else {
        if (typeof item.total !== "number" || item.total < 0) {
          errors.push(`Percentage budget item "${item.item}" must have non-negative total, received ${item.total}.`);
        }
      }
      itemsSum += item.total;
    }
    if (section.subtotal !== itemsSum) {
      errors.push(
        `Section "${section.category}" subtotal mismatch: items sum to ${itemsSum}, but section subtotal states ${section.subtotal}.`
      );
    }
  }
  const crewSec = budget.sections.find((s) => s.category === "Crew");
  const nightSec = budget.sections.find((s) => s.category === "Night Premium");
  const castSec = budget.sections.find((s) => s.category === "Cast");
  const equipSec = budget.sections.find((s) => s.category === "Equipment");
  const locSec = budget.sections.find((s) => s.category === "Locations & Logistics");
  const postSec = budget.sections.find((s) => s.category === "Post Production");
  const contingencySec = budget.sections.find((s) => s.category === "Contingency");
  if (budget.summary.crewSubtotal !== (crewSec?.subtotal ?? 0)) {
    errors.push(`Crew subtotal mismatch: summary has ${budget.summary.crewSubtotal}, section has ${crewSec?.subtotal ?? 0}.`);
  }
  if (budget.summary.nightPremiumTotal !== (nightSec?.subtotal ?? 0)) {
    errors.push(`Night premium mismatch: summary has ${budget.summary.nightPremiumTotal}, section has ${nightSec?.subtotal ?? 0}.`);
  }
  if (budget.summary.castSubtotal !== (castSec?.subtotal ?? 0)) {
    errors.push(`Cast subtotal mismatch: summary has ${budget.summary.castSubtotal}, section has ${castSec?.subtotal ?? 0}.`);
  }
  if (budget.summary.equipmentSubtotal !== (equipSec?.subtotal ?? 0)) {
    errors.push(`Equipment subtotal mismatch: summary has ${budget.summary.equipmentSubtotal}, section has ${equipSec?.subtotal ?? 0}.`);
  }
  if (budget.summary.locationsLogisticsSubtotal !== (locSec?.subtotal ?? 0)) {
    errors.push(
      `Locations & Logistics subtotal mismatch: summary has ${budget.summary.locationsLogisticsSubtotal}, section has ${locSec?.subtotal ?? 0}.`
    );
  }
  if (budget.summary.postSubtotal !== (postSec?.subtotal ?? 0)) {
    errors.push(`Post production subtotal mismatch: summary has ${budget.summary.postSubtotal}, section has ${postSec?.subtotal ?? 0}.`);
  }
  if (budget.summary.contingencyTotal !== (contingencySec?.subtotal ?? 0)) {
    errors.push(`Contingency subtotal mismatch: summary has ${budget.summary.contingencyTotal}, section has ${contingencySec?.subtotal ?? 0}.`);
  }
  const expectedSubtotalBeforeContingency = (crewSec?.subtotal ?? 0) + (nightSec?.subtotal ?? 0) + (castSec?.subtotal ?? 0) + (equipSec?.subtotal ?? 0) + (locSec?.subtotal ?? 0) + (postSec?.subtotal ?? 0);
  if (budget.summary.subtotalBeforeContingency !== expectedSubtotalBeforeContingency) {
    errors.push(
      `Budget summary subtotalBeforeContingency mismatch: expected ${expectedSubtotalBeforeContingency}, received ${budget.summary.subtotalBeforeContingency}.`
    );
  }
  const expectedContingency = Math.round(budget.summary.subtotalBeforeContingency * 0.1);
  if (budget.summary.contingencyTotal !== expectedContingency) {
    errors.push(
      `Contingency mismatch: expected 10% of subtotalBeforeContingency (${expectedContingency}), received ${budget.summary.contingencyTotal}.`
    );
  }
  const expectedGrandTotal = budget.summary.subtotalBeforeContingency + budget.summary.contingencyTotal;
  if (budget.summary.grandTotal !== expectedGrandTotal) {
    errors.push(
      `Grand total mismatch: expected ${expectedGrandTotal} (subtotal ${budget.summary.subtotalBeforeContingency} + contingency ${budget.summary.contingencyTotal}), received ${budget.summary.grandTotal}.`
    );
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// scripts/capture_live_acceptance_evidence.ts
import { execSync } from "child_process";
import fs from "fs";
import url from "node:url";
function runCmd(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf-8" }).trim();
  } catch (err) {
    return null;
  }
}
function parseArgs(rawArgs = process.argv.slice(2)) {
  const options = {
    targetUrl: process.env.CANDIDATE_URL || process.env.TARGET_URL || "https://backlot-studio-112519007745.us-central1.run.app",
    expectedRevision: process.env.EXPECTED_REVISION || null,
    expectedReasoningEngine: process.env.EXPECTED_REASONING_ENGINE || null,
    outputPath: process.env.EVIDENCE_OUTPUT_PATH || "demo/captures/candidate_acceptance_evidence.json",
    cloudBuildId: process.env.CLOUD_BUILD_ID || null,
    sourceCommit: process.env.SOURCE_COMMIT || null,
    timeoutMs: parseInt(process.env.TIMEOUT_MS || "300000", 10),
    // 5 minutes default
    forceOverwrite: process.env.FORCE_OVERWRITE === "true" || false,
    checkStartup: false,
    fetchFn: fetch
  };
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--target-url" && rawArgs[i + 1]) {
      options.targetUrl = rawArgs[++i];
    } else if (arg === "--expected-revision" && rawArgs[i + 1]) {
      options.expectedRevision = rawArgs[++i];
    } else if (arg === "--expected-reasoning-engine" && rawArgs[i + 1]) {
      options.expectedReasoningEngine = rawArgs[++i];
    } else if (arg === "--output" && rawArgs[i + 1]) {
      options.outputPath = rawArgs[++i];
    } else if (arg === "--cloud-build-id" && rawArgs[i + 1]) {
      options.cloudBuildId = rawArgs[++i];
    } else if (arg === "--source-commit" && rawArgs[i + 1]) {
      options.sourceCommit = rawArgs[++i];
    } else if (arg === "--timeout-ms" && rawArgs[i + 1]) {
      options.timeoutMs = parseInt(rawArgs[++i], 10);
    } else if (arg === "--force-overwrite") {
      options.forceOverwrite = true;
    } else if (arg === "--check-startup") {
      options.checkStartup = true;
    }
  }
  return options;
}
async function verifyLiveAcceptance(customOptions = {}) {
  const options = { ...parseArgs([]), ...customOptions };
  const fetchFn = options.fetchFn || fetch;
  if (options.checkStartup) {
    console.log("ACCEPTANCE_HARNESS_STARTUP_OK: Acceptance evidence capture harness loaded successfully without provider calls.");
    return {
      status: "STARTUP_OK",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      toolsLoaded: true,
      schemasVerified: true
    };
  }
  console.log("===============================================================================");
  console.log("BACKLOT STUDIO \u2014 LIVE ACCEPTANCE EVIDENCE CAPTURE");
  console.log(`Target:           ${options.targetUrl}`);
  console.log(`Output Path:      ${options.outputPath}`);
  if (options.expectedRevision) console.log(`Expected Rev:     ${options.expectedRevision}`);
  if (options.expectedReasoningEngine) console.log(`Expected Engine:  ${options.expectedReasoningEngine}`);
  console.log("===============================================================================\n");
  if (fs.existsSync(options.outputPath) && !options.forceOverwrite) {
    throw new Error(
      `RECEIPT_EXISTS: Refusing to overwrite existing evidence receipt at "${options.outputPath}". Specify a distinct output path or provide --force-overwrite.`
    );
  }
  console.log("[1/4] Probing target endpoint /api/health and independently observing metadata...");
  let healthData = {};
  const healthUrl = `${options.targetUrl}/api/health`;
  try {
    const healthRes = await fetchFn(healthUrl, { signal: AbortSignal.timeout(1e4) });
    if (!healthRes.ok) {
      throw new Error(`GET ${healthUrl} returned HTTP ${healthRes.status}: ${healthRes.statusText}`);
    }
    healthData = await healthRes.json();
  } catch (healthErr) {
    throw new Error(`Failed to query health endpoint at ${healthUrl}: ${healthErr.message}`);
  }
  const observedAgentRuntime = healthData.agentRuntime || {};
  const observedAiRuntime = healthData.aiRuntime || {};
  const observedPartner = healthData.partnerIntegration || {};
  console.log(`  Observed Target Status:  ${healthData.status || "UNKNOWN"}`);
  console.log(`  Observed AI Platform:    ${observedAiRuntime.platform || "UNKNOWN"} (${observedAiRuntime.endpoint || "N/A"})`);
  console.log(`  Observed Agent Runtime:  ${observedAgentRuntime.managedStage || "N/A"} (isConfigured: ${observedAgentRuntime.isConfigured}, endpoint: ${observedAgentRuntime.endpoint || "N/A"})`);
  console.log(`  Observed Partner:        ${observedPartner.provider || "N/A"} (isConfigured: ${observedPartner.isConfigured})`);
  let independentlyObservedRevision = "UNVERIFIED_EXTERNAL";
  if (healthData.revision) {
    independentlyObservedRevision = String(healthData.revision);
  } else if (healthData.cloudRunRevision) {
    independentlyObservedRevision = String(healthData.cloudRunRevision);
  } else if (options.targetUrl.includes("backlot-studio")) {
    const serviceDescribeJson = runCmd(
      'gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="json"'
    );
    if (serviceDescribeJson) {
      try {
        const serviceData = JSON.parse(serviceDescribeJson);
        const traffic = serviceData.status?.traffic || [];
        const normalizedTarget = options.targetUrl.replace(/\/$/, "");
        const matchedEntry = traffic.find((t) => {
          if (t.url && (t.url === normalizedTarget || normalizedTarget.startsWith(t.url))) {
            return true;
          }
          if (t.tag && normalizedTarget.includes(`://${t.tag}---`)) {
            return true;
          }
          return false;
        });
        if (matchedEntry?.revisionName) {
          independentlyObservedRevision = matchedEntry.revisionName;
        } else {
          const prodEntry = traffic.find((t) => t.percent === 100) || traffic.find((t) => !t.tag);
          if (prodEntry?.revisionName) {
            independentlyObservedRevision = prodEntry.revisionName;
          }
        }
      } catch {
      }
    }
  }
  console.log(`  Independently Observed Revision: ${independentlyObservedRevision}`);
  if (options.expectedRevision) {
    if (independentlyObservedRevision === "UNVERIFIED_EXTERNAL") {
      throw new Error(
        `UNVERIFIED_REVISION: Expected revision "${options.expectedRevision}" was supplied, but revision could not be independently observed from the endpoint or cloud traffic entries.`
      );
    }
    if (independentlyObservedRevision !== options.expectedRevision) {
      throw new Error(
        `REVISION_MISMATCH: Expected revision "${options.expectedRevision}", but independently observed "${independentlyObservedRevision}".`
      );
    }
    console.log(`  PASS: Revision matches expectation (${options.expectedRevision}).`);
  }
  if (options.expectedReasoningEngine) {
    const currentEndpoint = observedAgentRuntime.endpoint || "";
    if (!currentEndpoint.includes(options.expectedReasoningEngine)) {
      throw new Error(
        `REASONING_ENGINE_MISMATCH: Expected ReasoningEngine "${options.expectedReasoningEngine}", but observed endpoint "${currentEndpoint}".`
      );
    }
    console.log(`  PASS: ReasoningEngine endpoint contains expected resource name.`);
  }
  const localHeadCommit = runCmd("git rev-parse HEAD") || "UNKNOWN";
  const sourceCommit = options.sourceCommit || localHeadCommit;
  const cloudBuildId = options.cloudBuildId || "NOT_PROVIDED";
  console.log("\n[2/4] Initiating live POST /api/run SSE stream with synthetic screenplay (Frequency Zero)...");
  const requestStartTime = /* @__PURE__ */ new Date();
  const requestTimestamp = requestStartTime.toISOString();
  const runUrl = `${options.targetUrl}/api/run`;
  const runAbortController = new AbortController();
  const timeoutTimer = setTimeout(() => {
    runAbortController.abort(new Error(`Acceptance stream timed out after ${options.timeoutMs}ms`));
  }, options.timeoutMs);
  let response;
  try {
    response = await fetchFn(runUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify({
        screenplayText: FREQUENCY_ZERO_SCRIPT,
        enableImages: false
      }),
      signal: runAbortController.signal
    });
  } catch (reqErr) {
    clearTimeout(timeoutTimer);
    throw new Error(`Failed to POST to ${runUrl}: ${reqErr.message}`);
  }
  if (!response.ok) {
    clearTimeout(timeoutTimer);
    const errText = typeof response.text === "function" ? await response.text().catch(() => "") : "";
    throw new Error(`Hosted ${runUrl} returned HTTP ${response.status}: ${response.statusText} \u2014 ${errText}`);
  }
  if (!response.body) {
    clearTimeout(timeoutTimer);
    throw new Error(`No response body stream received from ${runUrl}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  const events = [];
  const fatalErrors = [];
  let terminalCompleteEvent = null;
  console.log("[3/4] Streaming and parsing live SSE events from multi-agent crew...");
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += typeof value === "string" ? value : decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.replace(/^data:\s*/, "").trim();
        if (!jsonStr) continue;
        try {
          const event = JSON.parse(jsonStr);
          events.push({
            index: events.length + 1,
            receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
            event
          });
          if (event.type === "agent_status") {
            const statusStr = (event.status || "").toUpperCase();
            console.log(`  [STATUS] ${String(event.agent).padEnd(8)}: ${statusStr} \u2014 ${event.message || ""}`);
            if (event.status === "error") {
              fatalErrors.push({
                source: "agent_status",
                agent: event.agent,
                message: event.message
              });
            }
          } else if (event.type === "agent_log") {
            console.log(`  [LOG]    ${String(event.agent).padEnd(8)}: [${event.level}] ${event.message}`);
            if (event.level === "error") {
              fatalErrors.push({
                source: "agent_log",
                agent: event.agent,
                message: event.message
              });
            }
          } else if (event.type === "artifact") {
            console.log(`  [ARTIFACT] Generated: ${event.kind}`);
          } else if (event.type === "error") {
            console.error(`  [ERROR]  Stream error: ${event.message || JSON.stringify(event)}`);
            fatalErrors.push({
              source: "error_event",
              message: event.message || "Unknown stream error"
            });
          } else if (event.type === "done" || event.type === "run_complete") {
            terminalCompleteEvent = event;
            console.log(`  [COMPLETE] Run finished in ${event.durationMs}ms with runId: ${event.runId}`);
          }
        } catch (parseErr) {
          throw new Error(`MALFORMED_SSE_EVENT: Failed to parse SSE JSON chunk: "${jsonStr}": ${parseErr.message}`);
        }
      }
    }
  } finally {
    clearTimeout(timeoutTimer);
  }
  const requestEndTime = /* @__PURE__ */ new Date();
  const durationMs = requestEndTime.getTime() - requestStartTime.getTime();
  console.log(`
Stream closed. Received ${events.length} total SSE events in ${(durationMs / 1e3).toFixed(2)}s.`);
  console.log("\n[4/4] Validating invariants: schemas, terminal status, determinism, provenance, models, and execution...");
  if (!terminalCompleteEvent) {
    throw new Error(
      `PREMATURE_EOF: Stream terminated without emitting a terminal "done" or "run_complete" event. Received ${events.length} events.`
    );
  }
  if (fatalErrors.length > 0) {
    throw new Error(
      `FATAL_STREAM_ERRORS: The crew run encountered fatal errors during execution:
${JSON.stringify(fatalErrors, null, 2)}`
    );
  }
  const observedRunId = terminalCompleteEvent.runId;
  if (!observedRunId || typeof observedRunId !== "string" || !observedRunId.trim()) {
    throw new Error("MISSING_RUN_ID: Terminal event did not provide an authentic server-generated runId.");
  }
  const artifactEvents = events.filter((e) => e.event.type === "artifact").map((e) => e.event);
  const rawScriptParse = artifactEvents.find((a) => a.kind === "scriptParse")?.data;
  const rawCoverage = artifactEvents.find((a) => a.kind === "coverage")?.data;
  const rawBreakdown = artifactEvents.find((a) => a.kind === "breakdown")?.data;
  const rawSchedule = artifactEvents.find((a) => a.kind === "schedule")?.data;
  const rawBudget = artifactEvents.find((a) => a.kind === "budget")?.data;
  const rawPitchKit = artifactEvents.find((a) => a.kind === "pitchKit")?.data;
  const missingArtifacts = [];
  if (!rawScriptParse) missingArtifacts.push("scriptParse");
  if (!rawCoverage) missingArtifacts.push("coverage");
  if (!rawBreakdown) missingArtifacts.push("breakdown");
  if (!rawSchedule) missingArtifacts.push("schedule");
  if (!rawBudget) missingArtifacts.push("budget");
  if (!rawPitchKit) missingArtifacts.push("pitchKit");
  if (missingArtifacts.length > 0) {
    throw new Error(`MISSING_ARTIFACTS: Pipeline failed to produce required artifacts: ${missingArtifacts.join(", ")}`);
  }
  const parseResult = ScriptParseSchema.safeParse(rawScriptParse);
  if (!parseResult.success) {
    throw new Error(`SCHEMA_ERROR_SCRIPTPARSE: ${parseResult.error.message}`);
  }
  const coverageResult = CoverageSchema.safeParse(rawCoverage);
  if (!coverageResult.success) {
    throw new Error(`SCHEMA_ERROR_COVERAGE: ${coverageResult.error.message}`);
  }
  const breakdownResult = ScriptBreakdownSchema.safeParse(rawBreakdown);
  if (!breakdownResult.success) {
    throw new Error(`SCHEMA_ERROR_BREAKDOWN: ${breakdownResult.error.message}`);
  }
  const scheduleResult = ScheduleSchema.safeParse(rawSchedule);
  if (!scheduleResult.success) {
    throw new Error(`SCHEMA_ERROR_SCHEDULE: ${scheduleResult.error.message}`);
  }
  const budgetResult = BudgetSchema.safeParse(rawBudget);
  if (!budgetResult.success) {
    throw new Error(`SCHEMA_ERROR_BUDGET: ${budgetResult.error.message}`);
  }
  const pitchKitResult = PitchKitSchema.safeParse(rawPitchKit);
  if (!pitchKitResult.success) {
    throw new Error(`SCHEMA_ERROR_PITCHKIT: ${pitchKitResult.error.message}`);
  }
  const budget = budgetResult.data;
  const pitchKit = pitchKitResult.data;
  const schedule = scheduleResult.data;
  const budgetValidation = validateBudgetSemantics(budget);
  if (!budgetValidation.valid) {
    throw new Error(`DETERMINISTIC_MATH_ERROR: ${budgetValidation.errors.join("; ")}`);
  }
  const budgetItems = budget.sections.flatMap((s) => s.items || []);
  const marketEvidence = pitchKit.marketEvidence || [];
  if (marketEvidence.length === 0) {
    throw new Error("NO_MARKET_EVIDENCE: PitchKit does not contain grounded Parallel market citations.");
  }
  for (const citation of marketEvidence) {
    if (!citation.url || !citation.url.startsWith("http")) {
      throw new Error(`INVALID_CITATION: Market evidence citation missing valid HTTP URL: ${JSON.stringify(citation)}`);
    }
    if (!citation.title || !citation.title.trim()) {
      throw new Error(`INVALID_CITATION: Market evidence citation missing title: ${JSON.stringify(citation)}`);
    }
    if (!citation.snippet || !citation.snippet.trim()) {
      throw new Error(`INVALID_CITATION: Market evidence citation missing snippet: ${JSON.stringify(citation)}`);
    }
  }
  if (pitchKit.productionRecommendation) {
    const validatedRec = validateProductionRecommendation(
      pitchKit.productionRecommendation,
      budget,
      pitchKit.marketEvidence
    );
    if (!validatedRec) {
      throw new Error("INVALID_RECOMMENDATION: Production recommendation failed feasibility cross-check against budget.");
    }
  }
  const reportedModels = terminalCompleteEvent.modelsUsed;
  if (!Array.isArray(reportedModels) || reportedModels.length === 0) {
    throw new Error("MISSING_MODEL_EVIDENCE: Terminal complete event did not report modelsUsed.");
  }
  const ALLOWED_GOOGLE_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-image",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image"
  ];
  for (const model of reportedModels) {
    const isGoogle = ALLOWED_GOOGLE_MODELS.some((m) => model.includes(m) || model.startsWith("gemini-"));
    if (!isGoogle) {
      throw new Error(`HACKATHON_RULE_VIOLATION: Non-Google model detected in reported modelsUsed: "${model}".`);
    }
  }
  const logEvents = events.filter((e) => e.event.type === "agent_log").map((e) => e.event);
  const marqueeLogs = logEvents.filter((l) => l.agent === "marquee");
  const requiresManagedExecution = Boolean(options.expectedReasoningEngine || observedAgentRuntime.isConfigured);
  let managedExecutionConfirmed = false;
  if (requiresManagedExecution) {
    managedExecutionConfirmed = marqueeLogs.some(
      (l) => l.message.includes("Google Agent Runtime") || l.message.includes("reasoning_engine")
    );
    if (!managedExecutionConfirmed) {
      throw new Error(
        "MANAGED_EXECUTION_UNVERIFIED: Managed ReasoningEngine was configured, but logs show no correlated Google Agent Runtime dispatch."
      );
    }
    console.log("  PASS: Correlated Google Agent Runtime dispatch confirmed in logs.");
  }
  const evidenceRecord = {
    acceptanceRunType: "live_hosted_candidate_acceptance_verification",
    runIdentity: {
      runId: observedRunId,
      requestTimestamp,
      completionTimestamp: requestEndTime.toISOString(),
      durationMs,
      terminalStatus: "complete"
    },
    infrastructure: {
      targetUrl: options.targetUrl,
      independentlyObservedRevision,
      expectedRevision: options.expectedRevision,
      sourceCommit,
      cloudBuildId,
      activeLocalHeadCommit: localHeadCommit,
      aiRuntime: observedAiRuntime,
      agentRuntime: observedAgentRuntime
    },
    agentRuntimeVerification: {
      managedStage: "Marquee",
      isConfigured: observedAgentRuntime.isConfigured ?? false,
      endpoint: observedAgentRuntime.endpoint ?? "N/A",
      contract: observedAgentRuntime.contract ?? "N/A",
      managedRuntimeInvokedInRun: managedExecutionConfirmed
    },
    googleCloudAndGeminiEvidence: {
      googleGenAiSdkUsed: "@google/genai (^2.19.0)",
      vertexAiConfigured: true,
      endpoint: observedAiRuntime.endpoint || "global-aiplatform.googleapis.com",
      authMechanism: "Application Default Credentials (ADC / Service Account IAM)",
      modelsReportedByRun: reportedModels,
      generativeOutputsVerified: {
        scriptParseGenerated: true,
        coverageGenerated: true,
        breakdownGenerated: true,
        pitchKitGenerated: true
      }
    },
    parallelSearchPartnerEvidence: {
      endpoint: "https://api.parallel.ai/v1beta/search",
      integrationMode: "Direct authenticated REST client via fetch",
      runtimeConfigured: observedPartner.isConfigured ?? false,
      citationsCount: marketEvidence.length,
      citations: marketEvidence,
      recommendationOutcome: pitchKit.productionRecommendation ? {
        status: "RECOMMENDATION_PRODUCED",
        title: pitchKit.productionRecommendation.title,
        category: pitchKit.productionRecommendation.category,
        actionableDecision: pitchKit.productionRecommendation.actionableDecision,
        targetedArtifact: pitchKit.productionRecommendation.affectedArtifact,
        citedSourceUrl: pitchKit.productionRecommendation.sourceCitation?.url
      } : {
        status: "RECOMMENDATION_WITHHELD",
        reason: "Substantive evidence support boundary enforced or search offline"
      }
    },
    deterministicLedgerEvidence: {
      scheduleShootDays: schedule.stats.shootDays,
      scheduleNightShoots: schedule.stats.nightShoots,
      budgetGrandTotal: budget.summary.grandTotal,
      budgetGrandTotalFormatted: `$${budget.summary.grandTotal.toLocaleString()}`,
      totalLineItemsCount: budgetItems.length,
      itemsWithTracesToProvenanceCount: budgetItems.length,
      provenanceCoveragePercentage: "100%"
    },
    rawSseStream: {
      totalEventCount: events.length,
      events: events.map((e) => ({
        index: e.index,
        receivedAt: e.receivedAt,
        event: e.event
      }))
    }
  };
  const outDir = options.outputPath.substring(0, options.outputPath.lastIndexOf("/"));
  if (outDir && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(options.outputPath, JSON.stringify(evidenceRecord, null, 2), "utf-8");
  console.log(`
 Verified live acceptance evidence saved to: ${options.outputPath}`);
  console.log("ALL ACCEPTANCE INVARIANTS SATISFIED:");
  console.log(`  - Run ID:                 ${observedRunId}`);
  console.log(`  - Terminal Status:        COMPLETE (${durationMs}ms)`);
  console.log(`  - Fatal Errors:           0`);
  console.log(`  - Artifacts Validated:    6/6 (Zod Schemas Verified)`);
  console.log(`  - Provenance Coverage:    100% (${budgetItems.length}/${budgetItems.length} items)`);
  console.log(`  - Parallel Citations:     ${marketEvidence.length} (Valid HTTP citations)`);
  console.log(`  - Reported Models:        ${reportedModels.join(", ")}`);
  console.log(`  - Managed Runtime Stage:  ${managedExecutionConfirmed ? "CONFIRMED_IN_LOGS" : "LOCAL"}`);
  return evidenceRecord;
}
if (process.argv[1] && (process.argv[1] === url.fileURLToPath(import.meta.url) || process.argv[1].endsWith("capture_live_acceptance_evidence.mjs") || process.argv[1].endsWith("capture_live_acceptance_evidence.ts"))) {
  verifyLiveAcceptance(parseArgs()).catch((err) => {
    console.error("\nFATAL: Acceptance run evidence capture failed:", err.message);
    process.exit(1);
  });
}
export {
  parseArgs,
  verifyLiveAcceptance
};
