import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync, spawn } from "node:child_process";
import { verifyLiveAcceptance } from "../capture_live_acceptance_evidence.mjs";
import sampleRun from "../../src/fixtures/sample-run.json";
import { buildBudget } from "../../src/lib/ledger/budget-engine";
import { buildSchedule } from "../../src/lib/ledger/schedule-engine";
import { FREQUENCY_ZERO_PARSED } from "../../src/fixtures/frequency-zero";
import { DEFAULT_INDIE_RATE_CARD } from "../../src/lib/ledger/rate-card";


describe("Offline Acceptance & Release Script Verification", () => {
  let server: http.Server;
  let serverPort: number;
  let baseUrl: string;
  let sseChunksToEmit: string[] = [];
  let healthResponse: Record<string, unknown> = {};
  const testOutputDir = path.join(process.cwd(), "dist", "test-evidence");

  beforeEach(async () => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }

    // Default healthy mock server
    healthResponse = {
      status: "healthy",
      revision: "backlot-studio-00025-simulated",
      aiRuntime: {
        platform: "Vertex AI (Gemini Enterprise Agent Platform)",
        endpoint: "global-aiplatform.googleapis.com",
      },
      agentRuntime: {
        managedStage: "Marquee",
        isConfigured: true,
        endpoint: "https://us-central1-aiplatform.googleapis.com/v1/projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123456789:query",
      },
      partnerIntegration: {
        provider: "Parallel Search API",
        isConfigured: true,
      },
    };

    server = http.createServer((req, res) => {
      if (req.url === "/api/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(healthResponse));
        return;
      }

      if (req.url === "/api/run" && req.method === "POST") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        });

        for (const chunk of sseChunksToEmit) {
          res.write(chunk);
        }
        res.end();
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as { port: number };
        serverPort = addr.port;
        baseUrl = `http://127.0.0.1:${serverPort}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  // Valid schema-compliant fixture generator
  function createValidStreamEvents(overrides: {
    omitArtifacts?: string[];
    tamperBudgetMath?: boolean;
    omitProvenance?: boolean;
    invalidCitation?: boolean;
    nonGoogleModel?: boolean;
    omitDoneEvent?: boolean;
    fatalError?: boolean;
    runId?: string;
    customBudget?: any;
  } = {}) {
    const runId = overrides.runId ?? "run_simulated_acceptance_001";
    const events: any[] = [];

    events.push({
      type: "agent_status",
      agent: "ink",
      status: "running",
      message: "Parsing script...",
    });

    events.push({
      type: "agent_log",
      agent: "marquee",
      level: "info",
      message: "Calling Google Agent Runtime for Marquee stage...",
    });

    if (overrides.fatalError) {
      events.push({
        type: "error",
        message: "Fatal pipeline crash simulated",
      });
    }

    const scriptParse = {
      title: "FREQUENCY ZERO",
      format: "short",
      logline: "A late-night broadcaster hears a mysterious signal.",
      scenes: [
        {
          id: 1,
          slugline: "INT. BROADCAST BOOTH - NIGHT",
          intExt: "INT",
          location: "BROADCAST BOOTH",
          timeOfDay: "NIGHT",
          summary: "Jack cues an acetate record into silence.",
          characters: ["JACK", "MAYA"],
          pageEighths: 12,
        },
      ],
    };

    const coverage = {
      logline: "A late-night broadcaster hears a mysterious signal.",
      synopsis: "Jack hosts a midnight show in the Nevada desert when an impossible radio frequency begins broadcasting.",
      genre: ["Sci-Fi", "Mystery"],
      tone: "Atmospheric slow-burn tension",
      themes: ["Isolation", "Obsession"],
      comparables: [
        {
          title: "The Vast of Night",
          year: 2019,
          why: "Single-night retro radio station broadcast encountering anomalous frequencies.",
        },
      ],
      strengths: ["Strong atmospheric tension and sound design reliance"],
      concerns: ["Limited physical location scope"],
      pacingNotes: "Pacing tightens progressively across 12 pages.",
      scores: {
        premise: 9,
        structure: 8,
        character: 8,
        dialogue: 9,
        marketability: 7,
      },
      verdict: "CONSIDER",
      verdictRationale: "Exceptional low-cost festival candidate.",
      pullQuote: "If anybody is breathing out past Mile Marker 80... you are not alone.",
    };

    const breakdown = {
      breakdowns: [
        {
          sceneId: 1,
          cast: ["JACK", "MAYA"],
          background: [],
          props: ["Acetate record", "RCA Ribbon Microphone"],
          setDressing: ["Amber VU meters", "Monitor speakers"],
          wardrobe: ["Grease-smudged shirt", "Headphones"],
          makeupHair: ["Bloodshot eyes"],
          vehicles: [],
          sfx: ["High-frequency audio whine"],
          vfx: [],
          stunts: [],
          animals: [],
          sound: ["Needle drop crackle"],
          specialEquipment: ["Ribbon mic boom"],
          complexity: 2,
          complexityReason: "Night radio booth interior with specialized vintage props and practical audio.",
        },
      ],
    };

    const schedule = {
      days: [
        {
          dayNumber: 1,
          shootType: "NIGHT",
          sceneIds: [1],
          locations: ["BROADCAST BOOTH"],
          totalEighths: 12,
          effectiveEighths: 12,
          castNeeded: ["JACK", "MAYA"],
          notes: ["Night exterior wrap by 4am"],
          companyMoves: 0,
        },
      ],
      stats: {
        shootDays: 1,
        nightShoots: 1,
        companyMoves: 0,
        totalPageEighths: 12,
        totalEffectiveEighths: 12,
        castDays: { JACK: 1, MAYA: 1 },
      },
      assumptions: ["Single location studio shoot"],
    };

    const defaultBudget = {
      sections: [
        {
          category: "Cast",
          subtotal: 1000,
          items: [
            {
              category: "Cast",
              item: "Lead Actor (Jack)",
              unit: "day",
              qty: 1,
              rate: 1000,
              total: overrides.tamperBudgetMath ? 99999 : 1000,
              tracesTo: overrides.omitProvenance ? "" : "Scene 1 (Cast: Jack)",
            },
          ],
        },
        {
          category: "Contingency",
          subtotal: 100,
          items: [
            {
              category: "Contingency",
              item: "Production Contingency Reserve (10%)",
              unit: "percent",
              qty: 1,
              rate: 10,
              total: 100,
              tracesTo: "10% standard production contingency reserve",
            },
          ],
        },
      ],
      summary: {
        crewSubtotal: 0,
        nightPremiumTotal: 0,
        castSubtotal: 1000,
        equipmentSubtotal: 0,
        locationsLogisticsSubtotal: 0,
        postSubtotal: 0,
        subtotalBeforeContingency: 1000,
        contingencyTotal: 100,
        grandTotal: overrides.tamperBudgetMath ? 99999 : 1100,
      },
      rateCardName: "Indie Tier 1",
      currency: "USD",
    };

    const budget = overrides.customBudget || defaultBudget;

    const pitchKit = {
      tagline: "Out past Mile Marker 80, you are not alone.",
      loglines: [
        "A late-night desert DJ catches a transmission that changes everything.",
        "An isolated radio host broadcasts a signal from an impossible source.",
      ],
      whyNow: "Growing market demand for grounded retro sci-fi thrillers.",
      audience: {
        primary: "Indie sci-fi and horror enthusiasts (18-35)",
        secondary: "Radio drama and analog nostalgia listeners",
      },
      festivalStrategy: [
        {
          name: "Sundance Film Festival (Shorts)",
          tier: "Tier 1 / Oscar Qualifying",
          why: "Strong curatorial appetite for atmospheric genre short films.",
        },
      ],
      posterConcept: {
        description: "An isolated radio tower glowing under a starry Nevada sky.",
        imagePrompt: "Vintage 1970s film still of an amber-lit broadcast booth with vu meters.",
      },
      pitchParagraph: "FREQUENCY ZERO received a CONSIDER verdict from studio coverage with a tight $1,100 budget.",
      marketEvidence: [
        {
          title: "Late Night Radio Drama Trends",
          url: overrides.invalidCitation ? "not_a_valid_url" : "https://industry-trends.com/radio-thrillers",
          snippet: "Independent psychological thrillers set in single locations showed 40% higher ROI.",
          query: "retro radio sci fi film festival ROI",
          relevance: "Supports single-location format and high festival viability.",
          publisher: "Film Market Daily",
          publishedDate: "2026-01-15",
        },
      ],
      productionRecommendation: null,
    };

    const artifacts: Record<string, any> = {
      scriptParse,
      coverage,
      breakdown,
      schedule,
      budget,
      pitchKit,
    };

    for (const [kind, data] of Object.entries(artifacts)) {
      if (overrides.omitArtifacts?.includes(kind)) continue;
      events.push({
        type: "artifact",
        kind,
        data,
      });
    }

    if (!overrides.omitDoneEvent) {
      events.push({
        type: "done",
        runId,
        durationMs: 1450,
        modelsUsed: overrides.nonGoogleModel ? ["gpt-4o"] : ["gemini-3.5-flash", "gemini-3.1-flash-lite"],
      });
    }

    return events.map((e) => `data: ${JSON.stringify(e)}\n\n`);
  }

  // --- REJECTION CHECKS ---

  it("rejects premature EOF when stream terminates without terminal done event", async () => {
    sseChunksToEmit = createValidStreamEvents({ omitDoneEvent: true });
    const outputPath = path.join(testOutputDir, "premature_eof.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("PREMATURE_EOF");
  });

  it("rejects fatal stream errors when pipeline encounters error events", async () => {
    sseChunksToEmit = createValidStreamEvents({ fatalError: true });
    const outputPath = path.join(testOutputDir, "fatal_error.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("FATAL_STREAM_ERRORS");
  });

  it("rejects incomplete artifact production when an artifact is missing", async () => {
    sseChunksToEmit = createValidStreamEvents({ omitArtifacts: ["pitchKit"] });
    const outputPath = path.join(testOutputDir, "missing_artifact.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("MISSING_ARTIFACTS");
  });

  it("rejects budget items missing tracesTo cross-artifact provenance", async () => {
    sseChunksToEmit = createValidStreamEvents({ omitProvenance: true });
    const outputPath = path.join(testOutputDir, "missing_provenance.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow(/tracesTo|MISSING_PROVENANCE/);
  });

  it("rejects deterministic budget arithmetic errors / tampering", async () => {
    sseChunksToEmit = createValidStreamEvents({ tamperBudgetMath: true });
    const outputPath = path.join(testOutputDir, "tampered_math.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("DETERMINISTIC_MATH_ERROR");
  });

  it("rejects invalid citations in Parallel market evidence", async () => {
    sseChunksToEmit = createValidStreamEvents({ invalidCitation: true });
    const outputPath = path.join(testOutputDir, "invalid_citation.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("INVALID_CITATION");
  });

  it("rejects non-Google models reported in modelsUsed (Hackathon rule §7.B)", async () => {
    sseChunksToEmit = createValidStreamEvents({ nonGoogleModel: true });
    const outputPath = path.join(testOutputDir, "non_google.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("HACKATHON_RULE_VIOLATION");
  });

  it("rejects revision mismatch when independently observed revision differs from expectation", async () => {
    sseChunksToEmit = createValidStreamEvents();
    const outputPath = path.join(testOutputDir, "rev_mismatch.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        expectedRevision: "backlot-studio-00099-expected",
        outputPath,
      })
    ).rejects.toThrow("REVISION_MISMATCH");
  });

  it("rejects ReasoningEngine endpoint mismatch when observed endpoint differs from expectation", async () => {
    sseChunksToEmit = createValidStreamEvents();
    const outputPath = path.join(testOutputDir, "re_mismatch.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        expectedReasoningEngine: "reasoningEngines/999999999",
        outputPath,
      })
    ).rejects.toThrow("REASONING_ENGINE_MISMATCH");
  });

  it("refuses to overwrite existing receipt file without explicit force flag", async () => {
    sseChunksToEmit = createValidStreamEvents();
    const outputPath = path.join(testOutputDir, "existing_receipt.json");
    fs.writeFileSync(outputPath, JSON.stringify({ prior: "data" }), "utf-8");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
        forceOverwrite: false,
      })
    ).rejects.toThrow("RECEIPT_EXISTS");
  });

  // --- VALID ACCEPTANCE CASE ---

  it("accepts a valid simulated case and outputs verified structured evidence", async () => {
    sseChunksToEmit = createValidStreamEvents({
      runId: "run_simulated_acceptance_valid_123",
    });
    const outputPath = path.join(testOutputDir, "valid_evidence.json");

    const record = await verifyLiveAcceptance({
      targetUrl: baseUrl,
      expectedRevision: "backlot-studio-00025-simulated",
      expectedReasoningEngine: "reasoningEngines/123456789",
      outputPath,
      sourceCommit: "simulated_commit_abc123",
      cloudBuildId: "build-sim-456",
    });

    expect(record).toBeDefined();
    expect(record.runIdentity.runId).toBe("run_simulated_acceptance_valid_123");
    expect(record.runIdentity.terminalStatus).toBe("complete");
    expect(record.infrastructure.independentlyObservedRevision).toBe("backlot-studio-00025-simulated");
    expect(record.agentRuntimeVerification.managedRuntimeInvokedInRun).toBe(true);
    expect(record.deterministicLedgerEvidence.provenanceCoveragePercentage).toBe("100%");
    expect(record.parallelSearchPartnerEvidence.citationsCount).toBe(1);
    expect(record.googleCloudAndGeminiEvidence.modelsReportedByRun).toContain("gemini-3.5-flash");

    // Verify file written to disk
    expect(fs.existsSync(outputPath)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    expect(saved.runIdentity.runId).toBe("run_simulated_acceptance_valid_123");
    expect(saved.rawSseStream.totalEventCount).toBeGreaterThan(0);
    expect(saved.rawSseStream.events.length).toBe(saved.rawSseStream.totalEventCount);
  });

  it("executes startup verification check (--check-startup) without network or provider calls", async () => {
    const startupResult = await verifyLiveAcceptance({ checkStartup: true });
    expect(startupResult).toBeDefined();
    expect(startupResult.status).toBe("STARTUP_OK");
    expect(startupResult.toolsLoaded).toBe(true);

    // Verify running directly with node process exits with 0 and prints startup message
    const output = execSync("node scripts/capture_live_acceptance_evidence.mjs --check-startup", {
      encoding: "utf-8",
    });
    expect(output).toContain("ACCEPTANCE_HARNESS_STARTUP_OK");
  });

  it("validates realistic ledger semantics using the authentic sample-run.json budget fixture", async () => {
    sseChunksToEmit = createValidStreamEvents({
      runId: "run_sample_run_budget_123",
      customBudget: sampleRun.budget,
    });
    const outputPath = path.join(testOutputDir, "sample_run_budget_evidence.json");

    const record = await verifyLiveAcceptance({
      targetUrl: baseUrl,
      expectedRevision: "backlot-studio-00025-simulated",
      outputPath,
    });

    expect(record).toBeDefined();
    expect(record.deterministicLedgerEvidence.budgetGrandTotal).toBe(sampleRun.budget.summary.grandTotal);
    expect(record.deterministicLedgerEvidence.budgetGrandTotalFormatted).toBe(
      `$${sampleRun.budget.summary.grandTotal.toLocaleString()}`
    );
  });

  it("validates realistic ledger semantics using a ledger-generated budget (buildBudget)", async () => {
    const sampleBreakdown = {
      breakdowns: [
        {
          sceneId: 1,
          cast: ["JACK", "MAYA"],
          background: [],
          props: ["MICROPHONE"],
          setDressing: [],
          wardrobe: [],
          makeupHair: [],
          vehicles: [],
          sfx: [],
          vfx: [],
          stunts: [],
          animals: [],
          sound: [],
          specialEquipment: [],
          complexity: 2,
          complexityReason: "Standard booth dialogue",
        },
      ],
    };
    const ledgerSchedule = buildSchedule(FREQUENCY_ZERO_PARSED, sampleBreakdown);
    const ledgerBudget = buildBudget(ledgerSchedule, sampleBreakdown, DEFAULT_INDIE_RATE_CARD);

    sseChunksToEmit = createValidStreamEvents({
      runId: "run_ledger_budget_456",
      customBudget: ledgerBudget,
    });
    const outputPath = path.join(testOutputDir, "ledger_budget_evidence.json");

    const record = await verifyLiveAcceptance({
      targetUrl: baseUrl,
      expectedRevision: "backlot-studio-00025-simulated",
      outputPath,
    });

    expect(record).toBeDefined();
    expect(record.deterministicLedgerEvidence.budgetGrandTotal).toBe(ledgerBudget.summary.grandTotal);
  });

  it("rejects budget with double-counted contingency", async () => {
    const tamperedBudget = JSON.parse(JSON.stringify(sampleRun.budget));
    tamperedBudget.summary.subtotalBeforeContingency += tamperedBudget.summary.contingencyTotal;

    sseChunksToEmit = createValidStreamEvents({
      customBudget: tamperedBudget,
    });
    const outputPath = path.join(testOutputDir, "double_counted_contingency.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        outputPath,
      })
    ).rejects.toThrow("DETERMINISTIC_MATH_ERROR");
  });

  it("rejects UNVERIFIED_EXTERNAL when expectedRevision is supplied but revision cannot be observed", async () => {
    healthResponse = {
      status: "healthy",
      aiRuntime: { platform: "Vertex AI" },
      agentRuntime: { isConfigured: true },
      partnerIntegration: { isConfigured: true },
    };
    sseChunksToEmit = createValidStreamEvents();
    const outputPath = path.join(testOutputDir, "unverified_rev.json");

    await expect(
      verifyLiveAcceptance({
        targetUrl: baseUrl,
        expectedRevision: "backlot-studio-00025-expected",
        outputPath,
      })
    ).rejects.toThrow("UNVERIFIED_REVISION");
  });
});

describe("Source Snapshot Isolation & Freezing Invariants", () => {
  it("creates source snapshot including dirty & untracked release files while excluding demo media without deleting it", () => {
    const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), "backlot-repo-test-"));
    try {
      execSync("git init -b main", { cwd: tempRepoDir, stdio: "pipe" });
      execSync('git config user.name "Test Deployer" && git config user.email "deployer@test.local"', {
        cwd: tempRepoDir,
        stdio: "pipe",
      });

      fs.writeFileSync(path.join(tempRepoDir, "package.json"), JSON.stringify({ name: "test-app" }));
      fs.writeFileSync(path.join(tempRepoDir, "tracked_code.ts"), 'console.log("original");\n');
      fs.mkdirSync(path.join(tempRepoDir, "demo"), { recursive: true });
      fs.writeFileSync(path.join(tempRepoDir, "demo", "large_video.mp4"), "binary video data 12345");

      execSync("git add . && git commit -m 'Initial commit'", { cwd: tempRepoDir, stdio: "pipe" });

      fs.writeFileSync(path.join(tempRepoDir, "tracked_code.ts"), 'console.log("modified_dirty");\n');
      fs.writeFileSync(path.join(tempRepoDir, "Dockerfile.agent-runtime"), "FROM node:22-alpine\n");
      fs.writeFileSync(path.join(tempRepoDir, "demo", "new_narration.wav"), "binary audio data 67890");

      const tempIndex = path.join(tempRepoDir, ".git", "temp_index_test");
      const script = `
        export GIT_INDEX_FILE="${tempIndex}"
        git read-tree HEAD
        git add -u
        if [ -f "Dockerfile.agent-runtime" ]; then git add "Dockerfile.agent-runtime"; fi
        git rm -r --cached --ignore-unmatch demo >/dev/null 2>&1 || true
        git write-tree
      `;
      const candidateTree = execSync(script, { cwd: tempRepoDir, encoding: "utf-8" }).trim();
      if (fs.existsSync(tempIndex)) fs.unlinkSync(tempIndex);

      const treeEntries = execSync(`git ls-tree -r ${candidateTree}`, {
        cwd: tempRepoDir,
        encoding: "utf-8",
      });

      expect(treeEntries).toContain("tracked_code.ts");
      const codeBlob = execSync(`git show ${candidateTree}:tracked_code.ts`, {
        cwd: tempRepoDir,
        encoding: "utf-8",
      });
      expect(codeBlob).toContain("modified_dirty");

      expect(treeEntries).toContain("Dockerfile.agent-runtime");

      expect(treeEntries).not.toContain("demo");
      expect(treeEntries).not.toContain("large_video.mp4");
      expect(treeEntries).not.toContain("new_narration.wav");

      expect(fs.existsSync(path.join(tempRepoDir, "demo", "large_video.mp4"))).toBe(true);
      expect(fs.existsSync(path.join(tempRepoDir, "demo", "new_narration.wav"))).toBe(true);
      expect(fs.readFileSync(path.join(tempRepoDir, "demo", "large_video.mp4"), "utf-8")).toBe("binary video data 12345");
      expect(fs.readFileSync(path.join(tempRepoDir, "demo", "new_narration.wav"), "utf-8")).toBe("binary audio data 67890");
    } finally {
      fs.rmSync(tempRepoDir, { recursive: true, force: true });
    }
  });
});

describe("Deploy Script Configuration & Invariant Audit", () => {
  const deployScriptPath = path.join(process.cwd(), "scripts", "deploy_reasoning_engine.sh");
  const scriptContent = fs.readFileSync(deployScriptPath, "utf-8");

  it("enforces strict fail-fast shell flags (set -euo pipefail)", () => {
    expect(scriptContent).toContain("set -euo pipefail");
  });

  it("places serviceAccount under spec.serviceAccount in ReasoningEngine REST payload", () => {
    expect(scriptContent).toMatch(/"spec":\s*\{\s*"serviceAccount":\s*"\$\{RUNTIME_SA\}"/);
    expect(scriptContent).not.toMatch(/"deploymentSpec":\s*\{[^}]*"serviceAccount"/);
  });

  it("restricts containerSpec to imageUri and port only", () => {
    expect(scriptContent).toMatch(/"containerSpec":\s*\{\s*"imageUri":\s*"\$\{RUNTIME_IMAGE_DIGEST\}",\s*"port":\s*8080\s*\}/);
    expect(scriptContent).not.toMatch(/"containerSpec":\s*\{[^}]*"healthRoute"/);
    expect(scriptContent).not.toMatch(/"containerSpec":\s*\{[^}]*"predictRoute"/);
    expect(scriptContent).not.toMatch(/"containerSpec":\s*\{[^}]*"env"/);
  });

  it("declares unary classMethods with explicit api_mode: ''", () => {
    expect(scriptContent).toMatch(/"name":\s*"generate_pitch_kit"[^}]*"api_mode":\s*""/);
    expect(scriptContent).toMatch(/"name":\s*"query"[^}]*"api_mode":\s*""/);
  });

  it("verifies image-pull permissions for Reasoning Engine service agent", () => {
    expect(scriptContent).toContain("service-${PROJECT_NUMBER}@gcp-sa-aiplatform-re.iam.gserviceaccount.com");
    expect(scriptContent).toContain("roles/artifactregistry.reader");
  });

  it("strictly requires verified replacement secret version and rejects blank input", () => {
    expect(scriptContent).toContain("Credential rotation not established. Either set NEW_PARALLEL_API_KEY or verified REPLACEMENT_SECRET_VERSION");
    expect(scriptContent).toContain("Blank input or selecting newest version automatically is strictly prohibited");
    expect(scriptContent).not.toContain("read -r -s INPUT_KEY");
  });

  it("freezes source snapshot from working tree + index and generates SHA256 checksum", () => {
    expect(scriptContent).toContain("git write-tree");
    expect(scriptContent).toContain("git commit-tree");
    expect(scriptContent).toContain("git archive");
    expect(scriptContent).toContain("shasum -a 256");
  });

  it("stages baseline revision with --no-traffic, tag 'baseline-migrated', and verifies it", () => {
    expect(scriptContent).toContain('--tag="baseline-migrated"');
    expect(scriptContent).toContain("--no-traffic");
    expect(scriptContent).toContain("capture_live_acceptance_evidence.mjs");
    expect(scriptContent).toContain("demo/captures/baseline_acceptance_evidence.json");
  });

  it("extracts candidate revision and URL directly from status.traffic entries", () => {
    expect(scriptContent).toContain('find(t => t.tag === "candidate")');
    expect(scriptContent).not.toContain('revisions list --filter="tag=candidate"');
    expect(scriptContent).not.toContain('https://candidate---${SERVICE_NAME}');
  });

  it("bounds HTTP polling requests and terminates on operation.error or HTTP non-200", () => {
    expect(scriptContent).toContain("--max-time 15");
    expect(scriptContent).toContain("--connect-timeout 5");
    expect(scriptContent).toContain('if [[ "${POLL_STATUS}" -ne 200 ]]');
    expect(scriptContent).toContain('if (op.error)');
    expect(scriptContent).toContain("POLL_TIMEOUT=600");
  });

  it("removes all '|| true' maskers from IAM commands to fail fast on authorization errors", () => {
    const iamLines = scriptContent.split("\n").filter((l) => l.includes("add-iam-policy-binding"));
    expect(iamLines.length).toBeGreaterThan(0);
    for (const line of iamLines) {
      expect(line).not.toContain("|| true");
    }
  });

  it("checks and enables secretmanager.googleapis.com if disabled", () => {
    expect(scriptContent).toContain("secretmanager.googleapis.com");
    expect(scriptContent).toContain("gcloud services list --enabled");
    expect(scriptContent).toContain("gcloud services enable secretmanager.googleapis.com");
  });

  it("checks and creates secret resource PARALLEL_API_KEY if missing", () => {
    expect(scriptContent).toContain('gcloud secrets describe "${SECRET_NAME}"');
    expect(scriptContent).toContain('gcloud secrets create "${SECRET_NAME}"');
  });

  it("runs acceptance startup check before building or staging", () => {
    expect(scriptContent).toContain("node scripts/capture_live_acceptance_evidence.mjs --check-startup");
  });
});

describe("Production Guard & Polling Verification (deploy_reasoning_engine.sh)", () => {
  const runDeployScript = (bashSnippet: string): Promise<{ code: number | null; stdout: string; stderr: string }> => {
    return new Promise((resolve) => {
      const proc = spawn("bash", ["-c", `source scripts/deploy_reasoning_engine.sh && ${bashSnippet}`], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PROJECT_ID: "polygraph-hackathon",
          PROJECT_NUMBER: "112519007745",
          REGION: "us-central1",
        },
      });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("close", (code) => {
        resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
      });
    });
  };

  describe("validate_operation_name", () => {
    it("accepts valid canonical top-level operation name with PROJECT_ID", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/polygraph-hackathon/locations/us-central1/operations/op-top-001"'
      );
      expect(res.code).toBe(0);
    });

    it("accepts valid canonical top-level operation name with PROJECT_NUMBER", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/112519007745/locations/us-central1/operations/op-top-002"'
      );
      expect(res.code).toBe(0);
    });

    it("accepts valid nested ReasoningEngine operation name with PROJECT_ID", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/re-12345/operations/op-nested-001"'
      );
      expect(res.code).toBe(0);
    });

    it("accepts valid nested ReasoningEngine operation name with PROJECT_NUMBER", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/112519007745/locations/us-central1/reasoningEngines/re-12345/operations/op-nested-002"'
      );
      expect(res.code).toBe(0);
    });

    it("rejects operation names targeting unauthorized projects", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/malicious-project/locations/us-central1/operations/op-evil"'
      );
      expect(res.code).toBe(1);
    });

    it("rejects operation names targeting unauthorized locations", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/polygraph-hackathon/locations/europe-west1/operations/op-eu"'
      );
      expect(res.code).toBe(1);
    });

    it("rejects invalid resource paths not conforming to operations schema", async () => {
      const res = await runDeployScript(
        'validate_operation_name "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/re-12345/subresources/op-invalid"'
      );
      expect(res.code).toBe(1);
    });

    it("rejects blank or empty operation names", async () => {
      const res = await runDeployScript('validate_operation_name ""');
      expect(res.code).toBe(1);
    });
  });

  describe("poll_reasoning_engine_operation", () => {
    let mockServer: http.Server;
    let mockPort: number;
    let mockBaseUrl: string;
    let recordedRequests: Array<{ method: string; url: string; headers: http.IncomingHttpHeaders }> = [];
    let responseHandler: (req: http.IncomingMessage, res: http.ServerResponse) => void;

    beforeEach(async () => {
      recordedRequests = [];
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ done: true }));
      };

      mockServer = http.createServer((req, res) => {
        recordedRequests.push({
          method: req.method || "GET",
          url: req.url || "",
          headers: req.headers,
        });
        responseHandler(req, res);
      });

      await new Promise<void>((resolve) => {
        mockServer.listen(0, "127.0.0.1", () => {
          const addr = mockServer.address() as { port: number };
          mockPort = addr.port;
          mockBaseUrl = `http://127.0.0.1:${mockPort}`;
          resolve();
        });
      });
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => mockServer.close(() => resolve()));
    });

    it("polls nested ReasoningEngine operation name unchanged and extracts completed resource", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/engine-abc-123/operations/op-nested-success";
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            done: true,
            response: {
              name: "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/engine-abc-123",
            },
          })
        );
      };

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(0);
      expect(res.stdout).toBe("projects/polygraph-hackathon/locations/us-central1/reasoningEngines/engine-abc-123");
      expect(recordedRequests.length).toBe(1);
      expect(recordedRequests[0].method).toBe("GET");
      // Verified: Polled unchanged path without stripping or altering
      expect(recordedRequests[0].url).toBe(`/${opName}`);
      expect(recordedRequests[0].headers.authorization).toContain("Bearer");
    });

    it("polls canonical top-level operation name unchanged and extracts completed resource", async () => {
      const opName = "projects/112519007745/locations/us-central1/operations/op-top-level-success";
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            done: true,
            response: {
              name: "projects/112519007745/locations/us-central1/reasoningEngines/engine-xyz-789",
            },
          })
        );
      };

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(0);
      expect(res.stdout).toBe("projects/112519007745/locations/us-central1/reasoningEngines/engine-xyz-789");
      expect(recordedRequests.length).toBe(1);
      expect(recordedRequests[0].method).toBe("GET");
      // Verified: Polled unchanged path
      expect(recordedRequests[0].url).toBe(`/${opName}`);
    });

    it("fails fast with explicit fatal error when operation.error is returned", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/engine-fail/operations/op-error";
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            done: true,
            error: {
              code: 403,
              message: "ReasoningEngine container failed to start: image pull denied",
            },
          })
        );
      };

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(1);
      expect(res.stderr).toContain("FATAL: Operation failed with error:");
      expect(res.stderr).toContain("ReasoningEngine container failed to start: image pull denied");
    });

    it("fails fast with explicit fatal error on HTTP non-200 error response", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/operations/op-http-500";
      responseHandler = (_req, res) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Internal Vertex AI server error" } }));
      };

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(1);
      expect(res.stderr).toContain("FATAL: Polling operation HTTP error 500:");
      expect(res.stderr).toContain("Internal Vertex AI server error");
    });

    it("fails fast before network dispatch when operation name fails validation", async () => {
      const invalidOpName = "projects/unauthorized-project/locations/us-central1/operations/op-tampered";

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${invalidOpName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(1);
      expect(res.stderr).toContain("FATAL: Operation name failed validation");
      // Invariant: zero outbound requests dispatched when validation fails
      expect(recordedRequests.length).toBe(0);
    });

    it("enforces bounded polling deadline and terminates on timeout", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/operations/op-hanging";
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ done: false }));
      };

      // 1-second timeout, 1-second polling interval
      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 1 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(1);
      expect(res.stderr).toContain("FATAL: Operation");
      expect(res.stderr).toContain("timed out after 1 seconds");
    });

    it("routes operation progress to stderr and returns only canonical resource name on stdout when polling transitions from pending to complete", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123/operations/op-pending-then-complete";
      let pollCount = 0;
      responseHandler = (_req, res) => {
        pollCount++;
        res.writeHead(200, { "Content-Type": "application/json" });
        if (pollCount === 1) {
          // First response: still in progress
          res.end(JSON.stringify({ done: false }));
        } else {
          // Second response: completed with valid resource name
          res.end(
            JSON.stringify({
              done: true,
              response: {
                name: "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123",
              },
            })
          );
        }
      };

      // Execute with exact production command-substitution assignment
      // and verify that REASONING_ENGINE_RESOURCE captures ONLY the canonical resource name
      const res = await runDeployScript(
        `REASONING_ENGINE_RESOURCE=$(poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}") && echo "CAPTURED:\${REASONING_ENGINE_RESOURCE}"`
      );

      expect(res.code).toBe(0);
      expect(pollCount).toBe(2);
      // Progress diagnostics must be emitted to stderr, NOT stdout
      expect(res.stderr).toContain("Operation in progress...");
      expect(res.stdout).toBe("CAPTURED:projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123");

      // Also verify direct execution stdout matches expected resource name exactly without contamination
      pollCount = 0;
      const direct = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );
      expect(direct.code).toBe(0);
      expect(direct.stderr).toContain("Operation in progress...");
      expect(direct.stdout).toBe("projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123");
    });

    it("fails fast with nonzero exit and no resource on stdout when operation completes without response.name", async () => {
      const opName = "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123/operations/op-missing-response-name";
      responseHandler = (_req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        // Operation done, but response.name is absent (not permitted by API spec)
        res.end(JSON.stringify({ done: true }));
      };

      const res = await runDeployScript(
        `poll_reasoning_engine_operation "${opName}" "us-central1" 10 1 "${mockBaseUrl}"`
      );

      expect(res.code).toBe(1);
      // Invariant: stdout must be empty — no inferred or fabricated resource name
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("FATAL: Operation failed with error:");
      expect(res.stderr).toContain("Operation marked done but missing response.name");
    });
  });
});

