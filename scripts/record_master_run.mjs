import { execSync } from "child_process";
import fs from "fs";

function runCmd(cmd) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf-8" }).trim();
}

function browserEval(js) {
  const escaped = js.replace(/"/g, '\\"');
  const res = runCmd(`agent-browser eval "${escaped}"`);
  try {
    return JSON.parse(res);
  } catch {
    return res;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("=== STARTING CONTIGUOUS MASTER RECORDING PIPELINE ==="); try { runCmd("agent-browser record stop"); } catch {}
  const targetUrl = "https://backlot-studio-112519007745.us-central1.run.app";
  const webmPath = "demo/captures/fresh_master_run.webm";
  const receiptPath = "demo/captures/fresh_run_receipt.json";

  // Step 1: Set viewport
  console.log("[1/10] Setting viewport to 1920x1080...");
  runCmd("agent-browser set viewport 1920 1080");

  // Step 2: Open target URL and start recording
  console.log(`[2/10] Opening ${targetUrl} and starting recording to ${webmPath}...`);
  runCmd(`agent-browser record start ${webmPath} ${targetUrl}`);
  console.log("Recording successfully started.");
  await sleep(4000);

  // Step 3: View manuscript
  console.log("[3/10] Viewing screenplay manuscript...");
  browserEval(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View Manuscript'))?.click()`);
  await sleep(3500);

  // Step 4: Close manuscript
  console.log("[4/10] Closing screenplay manuscript...");
  browserEval(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Manuscript'))?.click()`);
  await sleep(1500);

  // Step 5: Greenlight & Dispatch Crew
  console.log("[5/10] Clicking Greenlight & Dispatch Crew...");
  browserEval(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Greenlight & Dispatch Crew'))?.click()`);

  // Step 6: Wait for run to start, then monitor until done
  console.log("[6/10] Monitoring live execution stream...");
  
  // Wait up to 15s for isRunning to become true
  let started = false;
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    const check = browserEval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Orchestrating'));
      return !!btn;
    })()`);
    if (check) {
      started = true;
      console.log(`Pipeline orchestrating confirmed at +${i + 1}s`);
      break;
    }
  }

  if (!started) {
    throw new Error("Run verification failed: Studio crew dispatch was never observed starting.");
  }

  // Monitor until completion
  const maxWaitMs = 180000;
  const pollIntervalMs = 2500;
  let elapsed = 0;
  let isDone = false;

  while (elapsed < maxWaitMs) {
    await sleep(pollIntervalMs);
    elapsed += pollIntervalMs;

    const status = browserEval(`(() => {
      const btnOrchestrating = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Orchestrating'));
      const btnGreenlight = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Greenlight & Dispatch Crew'));
      const isRunning = !!btnOrchestrating || (btnGreenlight && btnGreenlight.disabled);
      
      const text = document.body.innerText || "";
      const hasError = text.includes("Studio execution error") || text.includes("Pipeline Failed") || text.includes("error occurred during execution");
      
      return { isRunning: !!isRunning, hasError: !!hasError };
    })()`);

    console.log(`[Status +${Math.round(elapsed / 1000)}s] isRunning: ${status?.isRunning}, error: ${status?.hasError}`);

    if (status?.hasError) {
      throw new Error("Run verification failed: Studio execution error or pipeline failure observed in UI.");
    }

    if (status && !status.isRunning && elapsed > 8000) {
      isDone = true;
      console.log("Live run completed successfully!");
      break;
    }
  }

  if (!isDone) {
    throw new Error(`Run verification failed: Execution timed out after ${maxWaitMs / 1000}s without observing package lock.`);
  }
  await sleep(4000);

  // Step 7: Extract run receipt
  console.log("[7/10] Extracting run receipt from DOM and state...");
  let deployedRevision = "unknown";
  try {
    deployedRevision = runCmd('gcloud run services describe backlot-studio --region us-central1 --project polygraph-hackathon --format="value(status.latestReadyRevisionName)"');
  } catch (err) {
    console.warn("Could not query Cloud Run revision:", err.message);
  }
  console.log("Detected live deployed revision:", deployedRevision);

  if (!deployedRevision || deployedRevision === "unknown" || !deployedRevision.startsWith("backlot-studio-")) {
    throw new Error(`Run verification failed: Invalid or unknown deployed revision identity: ${deployedRevision}`);
  }

  const initialReceipt = browserEval(`(() => {
    // 1. Run ID from logs
    const allDivs = Array.from(document.querySelectorAll('*'));
    let runId = "unknown";
    for (const d of allDivs) {
      const txt = d.textContent || "";
      const match = txt.match(/Starting pre-production studio run \\[(run_[0-9]+)\\]/);
      if (match) {
        runId = match[1];
        break;
      }
    }

    // 2. Budget total from tab button
    const budgetTab = document.getElementById("tab-BUDGET");
    const budgetTotal = budgetTab ? budgetTab.querySelector('span:last-child')?.textContent?.trim() : "unknown";

    return {
      runId,
      budgetTotal,
      timestamp: new Date().toISOString()
    };
  })()`);

  if (!initialReceipt.runId || initialReceipt.runId === "unknown" || !/^run_\d+$/.test(initialReceipt.runId)) {
    throw new Error(`Run verification failed: Missing or invalid runId in receipt: ${initialReceipt.runId}`);
  }
  if (!initialReceipt.budgetTotal || initialReceipt.budgetTotal === "unknown" || !/^\$[\d,]+$/.test(initialReceipt.budgetTotal) || initialReceipt.budgetTotal === "$0") {
    throw new Error(`Run verification failed: Missing or invalid budget total in receipt: ${initialReceipt.budgetTotal}`);
  }

  console.log("Initial receipt header:", JSON.stringify(initialReceipt, null, 2));

  // Switch to Pitch Kit tab to read recommendation details
  console.log("Switching to Pitch Kit tab...");
  browserEval(`document.getElementById("tab-PITCH_KIT")?.click()`);
  await sleep(3000);

  // Scroll down to recommendation card
  console.log("Scrolling to recommendation card...");
  browserEval(`window.scrollBy({ top: 650, behavior: 'smooth' })`);
  await sleep(4000);

  // Extract recommendation details using explicit data-testid attributes
  const recDetails = browserEval(`(() => {
    const card = document.querySelector('[data-testid="recommendation-card"]');
    const withheldEl = document.querySelector('[data-testid="recommendation-withheld"]');

    if (!card) {
      return {
        hasRecommendation: false,
        status: "withheld",
        reason: withheldEl ? withheldEl.textContent.trim() : "Market citations retrieved, but no supported production recommendation produced."
      };
    }

    const title = document.querySelector('[data-testid="recommendation-title"]')?.textContent?.trim() || "";
    const actionableDecision = document.querySelector('[data-testid="recommendation-actionable-decision"]')?.textContent?.trim() || "";
    const factualFinding = document.querySelector('[data-testid="recommendation-factual-finding"]')?.textContent?.trim() || "";
    const inferredAdvice = document.querySelector('[data-testid="recommendation-inferred-advice"]')?.textContent?.trim() || "";
    const tradeoffRationale = document.querySelector('[data-testid="recommendation-tradeoff-rationale"]')?.textContent?.trim() || "";
    const targetIdentifier = document.querySelector('[data-testid="recommendation-target-identifier"]')?.textContent?.trim() || "";
    const targetLabel = document.querySelector('[data-testid="recommendation-target-label"]')?.textContent?.trim() || "";
    const inspectBtn = document.querySelector('[data-testid="recommendation-inspect-button"]');
    const inspectBtnText = inspectBtn ? inspectBtn.textContent.trim() : "";
    const sourceLink = document.querySelector('[data-testid="recommendation-source-link"]');
    const sourceUrl = sourceLink ? sourceLink.getAttribute('href') : "";
    const sourceTitle = document.querySelector('[data-testid="recommendation-source-title"]')?.textContent?.trim() || "";

    return {
      hasRecommendation: true,
      title,
      actionableDecision,
      factualFinding,
      inferredAdvice,
      tradeoffRationale,
      targetArtifact: {
        identifier: targetIdentifier,
        label: targetLabel,
        buttonText: inspectBtnText
      },
      sourceCitation: {
        title: sourceTitle,
        url: sourceUrl
      }
    };
  })()`);

  // Enforce receipt integrity validation
  if (recDetails.hasRecommendation) {
    if (!recDetails.title) throw new Error("Receipt validation failed: missing recommendation title");
    if (!recDetails.actionableDecision) throw new Error("Receipt validation failed: missing actionableDecision");
    if (!recDetails.factualFinding) throw new Error("Receipt validation failed: missing factualFinding");
    if (recDetails.factualFinding.includes("Calibrated pitch loglines")) {
      throw new Error("Receipt validation failed: factualFinding captured header text instead of citation finding!");
    }
    if (!recDetails.targetArtifact?.identifier) {
      throw new Error("Receipt validation failed: missing targetArtifact identifier");
    }
    if (recDetails.targetArtifact.identifier === "CUSTOM PRODUCTION") {
      throw new Error("Receipt validation failed: targetArtifact identifier captured screenplay header instead of budget item!");
    }
    if (!recDetails.sourceCitation?.url) {
      throw new Error("Receipt validation failed: missing sourceCitation URL");
    }
  }

  const fullReceipt = {
    ...initialReceipt,
    deployedRevision,
    recommendation: recDetails,
    verification: {
      crewDispatchStarted: started,
      packageLocked: isDone,
      noPipelineErrors: true,
      workflowOutcome: recDetails.hasRecommendation ? "positive_recommendation_verified" : "valid_negative_outcome_withheld"
    }
  };

  fs.writeFileSync(receiptPath, JSON.stringify(fullReceipt, null, 2), "utf-8");
  console.log("Full Receipt Saved:\n", JSON.stringify(fullReceipt, null, 2));

  await sleep(3000);

  // Step 8: Click INSPECT IN BUDGET if available
  if (recDetails.hasRecommendation && recDetails.targetArtifact?.buttonText) {
    console.log(`[8/10] Positive workflow: clicking '${recDetails.targetArtifact.buttonText}'...`);
    browserEval(`document.querySelector('[data-testid="recommendation-inspect-button"]')?.click()`);
    await sleep(4000);

    const drawerAudit = browserEval(`(() => {
      const drawer = document.getElementById("line-item-audit-drawer");
      return drawer ? {
        found: true,
        text: drawer.innerText
      } : { found: false };
    })()`);
    console.log("Audit drawer found:", drawerAudit?.found);
    if (!drawerAudit?.found) {
      throw new Error("Run verification failed: Line item audit drawer did not open on inspect CTA click.");
    }
    const targetIdentifier = recDetails.targetArtifact.identifier;
    if (!drawerAudit.text.toLowerCase().includes(targetIdentifier.toLowerCase())) {
      throw new Error(`Run verification failed: Drawer content does not match target artifact '${targetIdentifier}'!`);
    }
    await sleep(4500);

    // Scroll up to show canonical top sheet
    console.log("Scrolling up to show canonical top sheet...");
    browserEval(`window.scrollTo({ top: 0, behavior: 'smooth' })`);
    await sleep(3500);

    // Dismiss audit drawer
    console.log("Dismissing audit drawer...");
    browserEval(`document.querySelector('button[aria-label="Dismiss Line Item Inspector"]')?.click()`);
    await sleep(2000);

    // Verify budget total is unchanged
    const postDismissTotal = browserEval(`(() => {
      const budgetTab = document.getElementById("tab-BUDGET");
      return budgetTab ? budgetTab.querySelector('span:last-child')?.textContent?.trim() : "unknown";
    })()`);
    if (postDismissTotal !== initialReceipt.budgetTotal) {
      throw new Error(`Run verification failed: Budget total changed after drawer dismissal! Before: ${initialReceipt.budgetTotal}, After: ${postDismissTotal}`);
    }
    console.log(`Budget total invariance verified: ${postDismissTotal}`);
  } else {
    console.log("[8/10] Recommendation was withheld; recording as valid negative outcome without claiming positive workflow passed.");
    browserEval(`document.getElementById("tab-BUDGET")?.click()`);
    await sleep(4000);
    const budgetTabTotal = browserEval(`(() => {
      const budgetTab = document.getElementById("tab-BUDGET");
      return budgetTab ? budgetTab.querySelector('span:last-child')?.textContent?.trim() : "unknown";
    })()`);
    if (budgetTabTotal !== initialReceipt.budgetTotal) {
      throw new Error(`Run verification failed: Budget tab total mismatch! Expected ${initialReceipt.budgetTotal}, found ${budgetTabTotal}`);
    }
    browserEval(`window.scrollBy({ top: 400, behavior: 'smooth' })`);
    await sleep(3000);
    browserEval(`window.scrollTo({ top: 0, behavior: 'smooth' })`);
    await sleep(2000);
  }

  // Step 9: Tour other deliverables
  console.log("[9/10] Touring deliverables...");
  console.log("Tab: Story Coverage...");
  browserEval(`document.getElementById("tab-COVERAGE")?.click()`);
  await sleep(3500);

  console.log("Tab: 1st AD Breakdown...");
  browserEval(`document.getElementById("tab-BREAKDOWN")?.click()`);
  await sleep(3500);

  console.log("Tab: Stripboard Schedule...");
  browserEval(`document.getElementById("tab-SCHEDULE")?.click()`);
  await sleep(3500);

  console.log("Tab: Previz Storyboard...");
  browserEval(`document.getElementById("tab-STORYBOARD")?.click()`);
  await sleep(3500);

  // Step 10: Inspect source citation page if positive recommendation exists
  if (recDetails.hasRecommendation && recDetails.sourceCitation?.url) {
    console.log(`[10/10] Navigating to source citation page: ${recDetails.sourceCitation.url}...`);
    try {
      runCmd(`agent-browser open "${recDetails.sourceCitation.url}"`);
      await sleep(4000);
      const passageLoaded = browserEval(`(() => {
        const text = document.body.innerText || "";
        const target = Array.from(document.querySelectorAll('h1, h2, h3, a, p, em, strong')).find(el => {
          const t = el.textContent || "";
          return (
            t.includes("production value") ||
            t.includes("Should you make a horror film") ||
            t.includes("Guts of the Craft") ||
            t.includes("Screen Craft") ||
            t.includes("horror")
          );
        });
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollBy({ top: 400, behavior: 'smooth' });
        }
        return text.length > 50;
      })()`);
      await sleep(4500);
      if (!passageLoaded) {
        throw new Error(`Run verification failed: Supporting source citation page failed to load content: ${recDetails.sourceCitation.url}`);
      }
    } catch (e) {
      console.warn("Could not navigate to external source URL:", e.message);
      throw e;
    }
  }

  // Stop recording
  console.log("Stopping recording...");
  runCmd("agent-browser record stop");
  console.log("Recording stopped successfully!");

  const stats = fs.statSync(webmPath);
  console.log(`Master recording saved: ${webmPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error("FATAL ERROR in master recorder:", err);
  try {
    execSync("agent-browser record stop");
  } catch {}
  process.exit(1);
});
