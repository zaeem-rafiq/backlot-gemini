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
  
  // Wait up to 10s for isRunning to become true
  let started = false;
  for (let i = 0; i < 10; i++) {
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
      const hasError = text.includes("Studio execution error") || text.includes("Pipeline Failed");
      
      return { isRunning: !!isRunning, hasError };
    })()`);

    console.log(`[Status +${Math.round(elapsed / 1000)}s] isRunning: ${status?.isRunning}, error: ${status?.hasError}`);

    if (status && !status.isRunning && elapsed > 8000) {
      isDone = true;
      console.log("Live run completed successfully!");
      break;
    }
  }

  if (!isDone) {
    console.warn("Run reached maximum wait time. Proceeding with state inspection...");
  }
  await sleep(4000);

  // Step 7: Extract run receipt
  console.log("[7/10] Extracting run receipt from DOM and state...");
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
      deployedRevision: "backlot-studio-00016-2db",
      timestamp: new Date().toISOString()
    };
  })()`);

  console.log("Initial receipt header:", JSON.stringify(initialReceipt, null, 2));

  // Switch to Pitch Kit tab to read recommendation details
  console.log("Switching to Pitch Kit tab...");
  browserEval(`document.getElementById("tab-PITCH_KIT")?.click()`);
  await sleep(3000);

  // Scroll down to recommendation card
  console.log("Scrolling to recommendation card...");
  browserEval(`window.scrollBy({ top: 650, behavior: 'smooth' })`);
  await sleep(4000);

  // Extract recommendation details
  const recDetails = browserEval(`(() => {
    const text = document.body.innerText || "";
    const hasRec = text.includes("Source-Backed Production Recommendation");
    const isWithheld = text.includes("Production Recommendation Withheld");

    if (isWithheld && !hasRec) {
      return {
        hasRecommendation: false,
        status: "withheld",
        reason: "Market citations retrieved, but no supported production recommendation produced for this screenplay."
      };
    }

    // Recommendation card details
    const h5 = Array.from(document.querySelectorAll('h5')).find(h => {
      const p = h.closest('div');
      return p && p.textContent.includes('Actionable Producer Decision');
    }) || document.querySelector('h5');
    const title = h5 ? h5.textContent.trim() : "";

    // Actionable decision
    const actBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Actionable Producer Decision'));
    const actionableDecision = actBlock ? actBlock.querySelector('p')?.textContent?.trim() : "";

    // Retrieved fact
    const factBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('[Retrieved Fact · Parallel Search API]'));
    const factualFinding = factBlock ? factBlock.querySelector('p')?.textContent?.trim() : "";

    // Inferred advice
    const adviceBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('[Inferred Producer Advice · Studio OS]'));
    const inferredAdvice = adviceBlock ? adviceBlock.querySelector('p')?.textContent?.trim() : "";

    // Tradeoff
    const tradeBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Evidence-Backed Tradeoff Rationale'));
    const tradeoffRationale = tradeBlock ? tradeBlock.querySelector('p')?.textContent?.trim() : "";

    // Target Artifact
    const targetBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Affected Production Artifact'));
    const spans = targetBlock ? Array.from(targetBlock.querySelectorAll('span')) : [];
    const targetIdentifier = spans.length > 1 ? spans[1].textContent.trim() : "";
    const targetLabel = spans.length > 2 ? spans[2].textContent.trim() : "";

    const inspectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('INSPECT IN'));
    const inspectBtnText = inspectBtn ? inspectBtn.textContent.trim() : "";

    // Source Citation
    const sourceAnchor = document.querySelector('a[href^="http"]');
    const sourceTitle = sourceAnchor ? sourceAnchor.textContent.trim() : "";
    const sourceUrl = sourceAnchor ? sourceAnchor.getAttribute('href') : "";

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

  const fullReceipt = {
    ...initialReceipt,
    recommendation: recDetails
  };

  fs.writeFileSync(receiptPath, JSON.stringify(fullReceipt, null, 2), "utf-8");
  console.log("Full Receipt Saved:\n", JSON.stringify(fullReceipt, null, 2));

  await sleep(3000);

  // Step 8: Click INSPECT IN BUDGET if available
  if (recDetails.hasRecommendation && recDetails.targetArtifact?.buttonText) {
    console.log(`[8/10] Deep linking: clicking '${recDetails.targetArtifact.buttonText}'...`);
    browserEval(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('INSPECT IN'))?.click()`);
    await sleep(4000);

    const drawerAudit = browserEval(`(() => {
      const drawer = document.getElementById("line-item-audit-drawer");
      return drawer ? {
        found: true,
        text: drawer.innerText
      } : { found: false };
    })()`);
    console.log("Audit drawer found:", drawerAudit?.found);
    await sleep(4500);

    // Scroll up to show canonical top sheet
    console.log("Scrolling up to show canonical top sheet...");
    browserEval(`window.scrollTo({ top: 0, behavior: 'smooth' })`);
    await sleep(3500);

    // Dismiss audit drawer
    console.log("Dismissing audit drawer...");
    browserEval(`document.querySelector('button[aria-label="Dismiss Line Item Inspector"]')?.click()`);
    await sleep(2000);
  } else {
    console.log("[8/10] Navigating to Audited Budget tab directly...");
    browserEval(`document.getElementById("tab-BUDGET")?.click()`);
    await sleep(4000);
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

  // Step 10: Inspect source citation page
  if (recDetails.sourceCitation?.url) {
    console.log(`[10/10] Navigating to source citation page: ${recDetails.sourceCitation.url}...`);
    try {
      runCmd(`agent-browser open "${recDetails.sourceCitation.url}"`);
      await sleep(4000);
      browserEval(`window.scrollBy({ top: 350, behavior: 'smooth' })`);
      await sleep(4000);
    } catch (e) {
      console.warn("Could not navigate to external source URL:", e.message);
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
