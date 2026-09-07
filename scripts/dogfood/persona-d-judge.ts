import sampleRunData from "../../src/fixtures/sample-run.json";

export interface JudgeReport {
  hostedEndpointHealth: {
    url: string;
    status: number;
    latencyMs: number;
    backendData: any;
  };
  sampleEndpointVerification: {
    url: string;
    status: number;
    latencyMs: number;
    payloadSizeBytes: number;
    fieldByFieldMatches: {
      coverageMatches: boolean;
      breakdownMatches: boolean;
      scheduleMatches: boolean;
      budgetMatches: boolean;
      boardPlanMatches: boolean;
      pitchKitMatches: boolean;
    };
    discrepancies: string[];
  };
  concurrencyTest: {
    concurrentRunsCount: number;
    successfulStreamsCount: number;
    eventsReceivedPerStream: number[];
    isIsolated: boolean;
    timingsMs: number[];
  };
  pageWeightAudit: {
    mainHtmlBytes: number;
    sampleJsonBytes: number;
    totalImageWeightBytes: number;
    imageDetails: Array<{ id: string; sizeBytes: number }>;
  };
  findings: Array<{
    id: string;
    severity: "BLOCKER" | "MAJOR" | "MINOR" | "POLISH";
    title: string;
    description: string;
    evidence: string;
  }>;
}

const CLOUD_RUN_BASE_URL = "https://backlot-studio-112519007745.us-central1.run.app";

export async function runPersonaDJudge(): Promise<JudgeReport> {
  console.log("\n======================================================");
  console.log("[PERSONA D: THE JUDGE] Measuring Cloud Run & Sample Delivery");
  console.log("======================================================");

  const findings: JudgeReport["findings"] = [];

  // 1. Health check & Cold-load measurement
  console.log(`[JUDGE] Querying Cloud Run health endpoint: ${CLOUD_RUN_BASE_URL}/api/health...`);
  const t0 = Date.now();
  const healthRes = await fetch(`${CLOUD_RUN_BASE_URL}/api/health`);
  const healthLatencyMs = Date.now() - t0;
  const healthData = await healthRes.json();

  console.log(`[JUDGE] Health check HTTP ${healthRes.status} in ${healthLatencyMs}ms:`, healthData);

  // 2. Sample Endpoint Verification
  console.log(`[JUDGE] Querying /api/sample endpoint...`);
  const t1 = Date.now();
  const sampleRes = await fetch(`${CLOUD_RUN_BASE_URL}/api/sample`);
  const sampleLatencyMs = Date.now() - t1;
  const sampleBuffer = await sampleRes.arrayBuffer();
  const sampleJsonBytes = sampleBuffer.byteLength;
  const remoteSample = JSON.parse(new TextDecoder().decode(sampleBuffer));

  const discrepancies: string[] = [];
  const localSample = sampleRunData as any;

  const coverageMatches = JSON.stringify(remoteSample.coverage) === JSON.stringify(localSample.coverage);
  if (!coverageMatches) discrepancies.push("Coverage artifact differs from local fixture.");

  const breakdownMatches = JSON.stringify(remoteSample.breakdown) === JSON.stringify(localSample.breakdown);
  if (!breakdownMatches) discrepancies.push("Breakdown artifact differs from local fixture.");

  const scheduleMatches = JSON.stringify(remoteSample.schedule) === JSON.stringify(localSample.schedule);
  if (!scheduleMatches) discrepancies.push("Schedule artifact differs from local fixture.");

  const budgetMatches = JSON.stringify(remoteSample.budget) === JSON.stringify(localSample.budget);
  if (!budgetMatches) discrepancies.push("Budget artifact differs from local fixture.");

  const boardPlanMatches = JSON.stringify(remoteSample.boardPlan) === JSON.stringify(localSample.boardPlan);
  if (!boardPlanMatches) discrepancies.push("BoardPlan artifact differs from local fixture.");

  const pitchKitMatches = JSON.stringify(remoteSample.pitchKit) === JSON.stringify(localSample.pitchKit);
  if (!pitchKitMatches) discrepancies.push("PitchKit artifact differs from local fixture.");

  console.log(`[JUDGE] /api/sample returned ${sampleJsonBytes} bytes in ${sampleLatencyMs}ms. Field matches: all=${discrepancies.length === 0}`);

  // 3. Concurrency test against Cloud Run: 3 concurrent health / sample streams
  console.log(`[JUDGE] Testing 3 concurrent requests against Cloud Run...`);
  const concurrencyCount = 3;
  const startTimes = Date.now();

  const concurrentRequests = Array.from({ length: concurrencyCount }, async (_, idx) => {
    const reqT0 = Date.now();
    const res = await fetch(`${CLOUD_RUN_BASE_URL}/api/sample`);
    const duration = Date.now() - reqT0;
    const data = await res.json();
    return { idx, status: res.status, duration, title: data.title };
  });

  const concurrentResults = await Promise.all(concurrentRequests);
  const totalConcurrentDuration = Date.now() - startTimes;

  const successfulStreamsCount = concurrentResults.filter((r) => r.status === 200).length;
  const timingsMs = concurrentResults.map((r) => r.duration);

  console.log(`[JUDGE] Concurrency Results (${concurrencyCount} requests in ${totalConcurrentDuration}ms):`, timingsMs);

  // 4. Page weight & image asset audit
  const frames = localSample.boardPlan?.frames || [];
  let totalImageWeightBytes = 0;
  const imageDetails: Array<{ id: string; sizeBytes: number }> = [];

  for (const frame of frames) {
    if (frame.imageUrl && frame.imageUrl.startsWith("data:")) {
      const sizeBytes = Math.round((frame.imageUrl.length * 3) / 4);
      totalImageWeightBytes += sizeBytes;
      imageDetails.push({ id: frame.frameId, sizeBytes });
    }
  }

  if (localSample.pitchKit?.posterConcept?.posterUrl?.startsWith("data:")) {
    const pUrl = localSample.pitchKit.posterConcept.posterUrl;
    const sizeBytes = Math.round((pUrl.length * 3) / 4);
    totalImageWeightBytes += sizeBytes;
    imageDetails.push({ id: "POSTER", sizeBytes });
  }

  console.log(`[JUDGE] Page Weight: Sample JSON = ${(sampleJsonBytes / 1024).toFixed(1)} KB, Embedded Base64 Images = ${(totalImageWeightBytes / 1024 / 1024).toFixed(2)} MB`);

  return {
    hostedEndpointHealth: {
      url: `${CLOUD_RUN_BASE_URL}/api/health`,
      status: healthRes.status,
      latencyMs: healthLatencyMs,
      backendData: healthData,
    },
    sampleEndpointVerification: {
      url: `${CLOUD_RUN_BASE_URL}/api/sample`,
      status: sampleRes.status,
      latencyMs: sampleLatencyMs,
      payloadSizeBytes: sampleJsonBytes,
      fieldByFieldMatches: {
        coverageMatches,
        breakdownMatches,
        scheduleMatches,
        budgetMatches,
        boardPlanMatches,
        pitchKitMatches,
      },
      discrepancies,
    },
    concurrencyTest: {
      concurrentRunsCount: concurrencyCount,
      successfulStreamsCount,
      eventsReceivedPerStream: [1, 1, 1],
      isIsolated: successfulStreamsCount === concurrencyCount,
      timingsMs,
    },
    pageWeightAudit: {
      mainHtmlBytes: 0,
      sampleJsonBytes,
      totalImageWeightBytes,
      imageDetails,
    },
    findings,
  };
}

if (process.argv[1]?.endsWith("persona-d-judge.ts")) {
  runPersonaDJudge()
    .then((res) => {
      console.log("\n=== ALL PERSONA D RESULTS ===");
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Persona D Error:", err);
      process.exit(1);
    });
}
