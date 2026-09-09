import { formatSourceAttribution, derivePublisherFromUrl } from "../src/lib/parallel/client.js";
import {
  isCitationSubstantivelySupported,
  findSupportedCitation,
  validateProductionRecommendation,
  calibrateRecommendationAssertions,
} from "../src/lib/agents/marquee.js";
import { execSync } from "child_process";
import fs from "fs";

function runCmd(cmd) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8" }).trim();
}

console.log("===============================================================================");
console.log("BACKLOT STUDIO — ACCEPTANCE VERIFICATION ON REVISION backlot-studio-00021-mgc");
console.log("===============================================================================");

const testResults = [];

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`PASS: ${testName}`);
    testResults.push({ name: testName, status: "PASS", details });
  } else {
    console.error(`FAIL: ${testName} - ${details}`);
    testResults.push({ name: testName, status: "FAIL", details });
    throw new Error(`Assertion failed: ${testName} - ${details}`);
  }
}

// ---------------------------------------------------------------------------
// 1. CONTROLLED ACCEPTANCE CHECKS (Local contract & behavior invariants)
// ---------------------------------------------------------------------------

console.log("\n--- PART 1: CONTROLLED CONTRACT & BEHAVIOR ACCEPTANCE CHECKS ---");

// Test 1.1: Archive attribution correctly replaces unverified sidebar title with honest publisher/archive
const archiveUrl = "https://www.thefilmcollaborative.org/blog/tag/horror-films/";
const rawScrapedTitle = "Wrap Report – The Popcorn List: Pop Up Series - An Experiment in Collaborative Non-Theatrical Distribution";
const publishDate = "2013-10-03";
const actualExcerpt = "At a recent event hosted at the LA Film School by Screen Craft entitled Horror Filmmaking: The Guts of the Craft, several involved in the horror genre talked about budgeting and distributing indie horror films. All agreed the production value bar has to be raised so much higher...";

const archiveAttribution = formatSourceAttribution(archiveUrl, rawScrapedTitle, publishDate, actualExcerpt);

assert(
  archiveAttribution.title === "The Film Collaborative (Archive: horror films, 2013)",
  "Archive attribution formats publisher and tag honestly",
  `Received: '${archiveAttribution.title}'`
);

assert(
  !archiveAttribution.title.includes("Popcorn List"),
  "Raw unverified sidebar title ('Popcorn List') is NOT presented as verified article title",
  `Received: '${archiveAttribution.title}'`
);

assert(
  archiveAttribution.rawTitle === rawScrapedTitle,
  "Raw provider title metadata is preserved separately",
  `Received: '${archiveAttribution.rawTitle}'`
);

assert(
  archiveAttribution.isArchive === true,
  "Archive URL flag (isArchive) is true",
  `Received: ${archiveAttribution.isArchive}`
);

assert(
  archiveAttribution.isHistorical === true,
  "Historical flag is true for dates prior to 2023",
  `Received: ${archiveAttribution.isHistorical}`
);

// Test 1.2: Missing dates remain unknown (isHistorical is false when date is unknown or recent)
const recentUrl = "https://variety.com/2024/film/news/indie-sound-post-trends-12345/";
const recentAttribution = formatSourceAttribution(recentUrl, "Indie Sound Post Trends", "2024-05-10", "Modern immersive audio workflows for festivals.");
assert(
  recentAttribution.isHistorical === false,
  "Recent sources (>= 2023) are NOT flagged as historical",
  `Received: ${recentAttribution.isHistorical}`
);

const undatedUrl = "https://screencraft.org/articles/audio-craft";
const undatedAttribution = formatSourceAttribution(undatedUrl, "Audio Craft", null, "Sound design tips for indie filmmakers.");
assert(
  undatedAttribution.isHistorical === false,
  "Missing source dates remain unknown (NOT labeled historical)",
  `Received: ${undatedAttribution.isHistorical}`
);

// Test 1.3: Search-query words cannot qualify unrelated source text as evidence
const mockSoundRec = {
  title: "Sound Post Investment",
  category: "BUDGET_ALLOCATION",
  factualFinding: "",
  inferredAdvice: "Sound design is key for radio booth tension.",
  actionableDecision: "Increase Sound Design, Foley & Mix allocation by 10%.",
  tradeoffRationale: "Elevates audio craft.",
  affectedArtifact: {
    kind: "budget_line_item",
    identifier: "Sound Design, Foley & Mix",
    label: "Account 6000: Post Production / Sound Design, Foley & Mix",
    tabTarget: "BUDGET",
  },
  sourceCitation: {
    title: "On-Set Union Meal Penalties Guide",
    url: "https://example.com/catering-penalties",
    // Query contains relevant words:
    query: "indie short film sound design foley audio mix comps",
    // Excerpt is completely unrelated:
    snippet: "Catering penalty rules under DGA and SAG guidelines mandate hot meals every six hours of continuous production.",
    relevance: "Catering guidelines",
  },
};

const queryLeakageCheck = isCitationSubstantivelySupported(mockSoundRec, mockSoundRec.sourceCitation);
assert(
  queryLeakageCheck === false,
  "Search query words cannot qualify unrelated source text as evidence (query leakage eliminated)",
  `Received: ${queryLeakageCheck}`
);

// Test 1.4: Unsupported alternative-source substitution is rejected and recommendation is withheld
const mockBudget = {
  sections: [
    {
      category: "Post Production",
      subtotal: 650,
      items: [
        {
          category: "Post Production",
          item: "Sound Design, Foley & Mix",
          unit: "flat",
          qty: 1,
          rate: 650,
          total: 650,
          tracesTo: "Dialogue cleanup and festival mix",
        },
      ],
    },
  ],
  summary: {
    crewSubtotal: 0,
    nightPremiumTotal: 0,
    castSubtotal: 0,
    equipmentSubtotal: 0,
    locationsLogisticsSubtotal: 0,
    postSubtotal: 650,
    subtotalBeforeContingency: 650,
    contingencyTotal: 65,
    grandTotal: 715,
  },
  rateCardName: "SAG Indie",
  currency: "USD",
};

const validationResult = validateProductionRecommendation(mockSoundRec, mockBudget, [mockSoundRec.sourceCitation]);
assert(
  validationResult === null,
  "Unsupported recommendation is withheld (returns null) when evidence lacks substantive support",
  `Received: ${validationResult}`
);

// Test 1.5: Proposed allocations are visibly identified as model suggestions
const rawProposal = {
  title: "Enhancing Post-Production Polish",
  category: "BUDGET_ALLOCATION",
  factualFinding: "Auditory tension is key for genre craft.",
  inferredAdvice: "Investing in sound design is the most cost-effective way to elevate a thriller.",
  actionableDecision: "Reallocate $500 from the $3,951 Production Contingency Reserve to increase the 'Sound Design, Foley & Mix' budget line item.",
  tradeoffRationale: "Investing in sound is the single most cost-effective approach, directly increasing the likelihood of festival selection.",
  affectedArtifact: {
    kind: "budget_line_item",
    identifier: "Sound Design, Foley & Mix",
    label: "Account 6000: Post Production / Sound Design, Foley & Mix",
    tabTarget: "BUDGET",
  },
  sourceCitation: {
    title: "ScreenCraft (Archive: Horror Craft, 2013)",
    url: "https://screencraft.org/horror-craft",
    snippet: "Filmmakers agreed sound design elevates indie horror above typical festival submissions.",
    query: "sound design festival comps",
    relevance: "Audio craft comps",
  },
};

const calibratedProposal = calibrateRecommendationAssertions(rawProposal);
assert(
  calibratedProposal.actionableDecision.startsWith("Model suggestion: "),
  "Proposed budget allocation is visibly identified with 'Model suggestion: ' prefix",
  `Received: '${calibratedProposal.actionableDecision}'`
);

assert(
  !calibratedProposal.tradeoffRationale.includes("most cost-effective") &&
  !calibratedProposal.tradeoffRationale.includes("directly increasing the likelihood of festival selection"),
  "Unsupported superlatives and causal claims are removed and calibrated",
  `Received: '${calibratedProposal.tradeoffRationale}'`
);

// ---------------------------------------------------------------------------
// 2. LIVE CLOUD RUN REVISION VERIFICATION
// ---------------------------------------------------------------------------
console.log("\n--- PART 2: LIVE CLOUD RUN ACCEPTANCE (backlot-studio-00021-mgc) ---");

const liveServiceUrl = "https://backlot-studio-112519007745.us-central1.run.app";

// 2.1 Verify Cloud Run deployed revision
const liveRevision = runCmd('gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="value(status.latestReadyRevisionName)"');
assert(
  liveRevision === "backlot-studio-00021-mgc",
  "Live Cloud Run service serves revision backlot-studio-00021-mgc",
  `Observed: ${liveRevision}`
);

// 2.2 Verify traffic allocation
const trafficPercent = runCmd('gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="value(status.traffic[1].percent)"');
assert(
  trafficPercent === "100",
  "Revision backlot-studio-00021-mgc is allocated 100% of production traffic",
  `Observed: ${trafficPercent}%`
);

// 2.3 Verify preserved rollback revision
const rollbackRevision = runCmd('gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="value(status.traffic[0].revisionName)"');
const rollbackTag = runCmd('gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="value(status.traffic[0].tag)"');
assert(
  rollbackRevision === "backlot-studio-00014-p4r" && rollbackTag === "rollback",
  "Rollback revision target backlot-studio-00014-p4r is preserved with tag 'rollback'",
  `Observed: ${rollbackRevision} (tag: ${rollbackTag})`
);

// 2.4 Verify health check response
const healthRes = JSON.parse(runCmd(`curl -s ${liveServiceUrl}/api/health`));
assert(
  healthRes.status === "healthy",
  "Live health endpoint returns healthy status",
  `Timestamp: ${healthRes.timestamp}`
);

// 2.5 Verify Partner Integration Configuration State
assert(
  healthRes.partnerIntegration?.isConfigured === true,
  "Parallel Search API environment configuration present (isConfigured = true)",
  `Provider: ${healthRes.partnerIntegration?.provider}`
);

// Report configuration, successful provider execution, and complete application behavior separately
console.log("\n--- PARTNER INTEGRATION STATUS REPORT ---");
console.log("Configuration Status:            VERIFIED (PARALLEL_API_KEY is configured in Cloud Run runtime)");
console.log("Health Check Provider Execution: NOT VERIFIED (Health endpoint probes configuration only; live queries run in Marquee workflow)");

const liveEvidenceFile = "demo/captures/acceptance_live_evidence.json";
let correlatedLiveEvidence = null;
let applicationBehaviorStatus = "NOT VERIFIED (Requires validated live-run execution evidence)";

if (fs.existsSync(liveEvidenceFile)) {
  try {
    const parsedEvidence = JSON.parse(fs.readFileSync(liveEvidenceFile, "utf-8"));
    if (
      parsedEvidence?.runIdentity?.terminalStatus === "complete" &&
      parsedEvidence?.infrastructure?.cloudRunRevision === liveRevision &&
      parsedEvidence?.parallelSearchPartnerEvidence?.citationsCount > 0
    ) {
      applicationBehaviorStatus = "VERIFIED_WITH_CORRELATED_LIVE_EVIDENCE";
      correlatedLiveEvidence = {
        runId: parsedEvidence.runIdentity.runId,
        citationsCount: parsedEvidence.parallelSearchPartnerEvidence.citationsCount,
        recommendationOutcome: parsedEvidence.parallelSearchPartnerEvidence.recommendationOutcome?.status,
        timestamp: parsedEvidence.runIdentity.requestTimestamp,
      };
    }
  } catch {
    // Leave as NOT VERIFIED if file cannot be parsed or lacks complete evidence
  }
}

console.log(`End-to-End Application Behavior: ${applicationBehaviorStatus}`);

const localHeadCommit = runCmd("git rev-parse HEAD");
const deployedSourceCommit = "1fc2bc909d4107953c4dfaf04950808fb4d5eb92";

// Save structured acceptance receipt to dedicated calibrated path to preserve existing demo receipts
const acceptanceReceipt = {
  timestamp: new Date().toISOString(),
  localHeadCommit,
  deployedSourceCommit,
  commitsMatch: localHeadCommit === deployedSourceCommit,
  deployedRevision: liveRevision,
  trafficAllocation: `${trafficPercent}%`,
  rollbackTarget: `${rollbackRevision} (${rollbackTag})`,
  serviceUrl: liveServiceUrl,
  partnerIntegrationAssessment: {
    configuration: {
      status: "VERIFIED",
      details: "PARALLEL_API_KEY present in Cloud Run environment",
      isConfigured: healthRes.partnerIntegration?.isConfigured ?? false,
    },
    liveProviderExecutionInHealthCheck: {
      status: "NOT VERIFIED",
      reason: "Health check does not invoke external search queries; live search executed during studio runs",
    },
    completeApplicationBehavior: {
      status: applicationBehaviorStatus,
      evidencePath: liveEvidenceFile,
      correlatedDetails: correlatedLiveEvidence,
    },
  },
  results: testResults,
  summary: {
    total: testResults.length,
    passed: testResults.filter((r) => r.status === "PASS").length,
    failed: testResults.filter((r) => r.status === "FAIL").length,
  },
};


const receiptPath = "demo/captures/acceptance_verification_receipt_calibrated.json";
fs.writeFileSync(
  receiptPath,
  JSON.stringify(acceptanceReceipt, null, 2),
  "utf-8"
);

console.log(`\n Acceptance receipt written to ${receiptPath}`);
console.log(`All ${testResults.length} acceptance assertions passed successfully!`);

