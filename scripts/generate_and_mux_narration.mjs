import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const segments = [
  {
    id: 1,
    name: "01_title_card",
    targetStart: 0.1,
    windowEnd: 6.0,
    text: "Backlot Studio: an AI-native pre-production crew powered by Google Gemini."
  },
  {
    id: 2,
    name: "02_act1_script",
    targetStart: 6.8,
    windowEnd: 18.0,
    text: "Every production starts with the script. Our producer inspects Frequency Zero, a contained suspense thriller in a remote broadcast booth."
  },
  {
    id: 3,
    name: "03_act2_crew",
    targetStart: 18.8,
    windowEnd: 37.0,
    text: "With one click, the Director agent orchestrates our studio crew. Watch live Server-Sent Events stream as Gemini powers Ink for coverage, Slate for breakdown, Easel for previz, and Marquee for Parallel Search market intelligence."
  },
  {
    id: 4,
    name: "04_act2_ledger",
    targetStart: 38.0,
    windowEnd: 68.0,
    text: "While the generative agents run in parallel, the Ledger agent calculates rates deterministically in TypeScript. All six department deliverables are locked live on Cloud Run in under sixty seconds."
  },
  {
    id: 5,
    name: "05_act3_pitchkit",
    targetStart: 69.5,
    windowEnd: 83.0,
    text: "Inside the Pitch Kit, Marquee uses the Parallel Search API to ground our screenplay against market comps, proposing an evidence-backed recommendation to maximize festival competition polish."
  },
  {
    id: 6,
    name: "06_act4_budget",
    targetStart: 84.0,
    windowEnd: 98.5,
    text: "Clicking Inspect in Budget opens the line item audit drawer, verifying script breakdown origin and deterministic math. Our forty-four thousand, six hundred forty-eight dollar total remains immutable."
  },
  {
    id: 7,
    name: "07_act5_tour",
    targetStart: 99.0,
    windowEnd: 111.5,
    text: "Every deliverable stays synchronized across departments: diagnostic story coverage, thirteen breakdown categories, magnetic stripboard scheduling, and widescreen previz boards."
  },
  {
    id: 8,
    name: "08_act6_source",
    targetStart: 112.0,
    windowEnd: 122.5,
    text: "Parallel grounds this directly in verified reporting from The Film Collaborative, inspecting the live publication cited in our Pitch Kit."
  },
  {
    id: 9,
    name: "09_act7_end",
    targetStart: 123.0,
    windowEnd: 129.6,
    text: "Backlot Studio: authentic multi-agent intelligence and verifiable financial truth."
  }
];

async function generateTTS() {
  console.log("=== SYNTHESIZING NARRATION VIA GEMINI 2.5 FLASH TTS (FENRIR) ===");
  fs.mkdirSync("demo/narration", { recursive: true });
  const token = execSync("gcloud auth print-access-token", { encoding: "utf8" }).trim();

  const generatedClips = [];

  for (const seg of segments) {
    console.log(`Synthesizing Segment ${seg.id}: [${seg.name}]...`);
    const rawPath = `demo/narration/seg_${seg.id}.raw`;
    const wavPath = `demo/narration/seg_${seg.id}.wav`;

    const resp = await fetch(
      "https://us-central1-aiplatform.googleapis.com/v1/projects/polygraph-hackathon/locations/us-central1/publishers/google/models/gemini-2.5-flash-preview-tts:generateContent",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: seg.text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Fenrir"
                }
              }
            }
          }
        })
      }
    );

    const json = await resp.json();
    if (!json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      throw new Error(`TTS API error on segment ${seg.id}: ${JSON.stringify(json)}`);
    }

    const b64 = json.candidates[0].content.parts[0].inlineData.data;
    fs.writeFileSync(rawPath, Buffer.from(b64, "base64"));
    execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i ${rawPath} ${wavPath} 2>/dev/null`);

    const dur = parseFloat(
      execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${wavPath}`,
        { encoding: "utf8" }
      ).trim()
    );

    const finish = seg.targetStart + dur;
    const slack = seg.windowEnd - finish;

    console.log(
      `✓ Segment ${seg.id} synthesized: spoken ${dur.toFixed(2)}s | starts ${seg.targetStart.toFixed(1)}s | finishes ${finish.toFixed(2)}s | window [${seg.targetStart}s - ${seg.windowEnd}s] | slack: ${slack.toFixed(2)}s`
    );

    generatedClips.push({ ...seg, dur, finish, slack, wavPath });
  }

  // Step 2: Verify strictly non-overlapping timeline before mixing
  console.log("\n=== VERIFYING TIMELINE INTEGRITY (ZERO-OVERLAP INVARIANT) ===");
  for (let i = 1; i < generatedClips.length; i++) {
    const prev = generatedClips[i - 1];
    const curr = generatedClips[i];
    const gap = curr.targetStart - prev.finish;
    if (gap < 0) {
      throw new Error(
        `TIMELINE TIMING FAULT: Segment ${curr.id} (${curr.name}) starts at ${curr.targetStart.toFixed(2)}s before Segment ${prev.id} (${prev.name}) finishes at ${prev.finish.toFixed(2)}s (overlap: ${(-gap).toFixed(2)}s)!`
      );
    }
    console.log(
      `✓ Transition ${prev.id} -> ${curr.id}: Gap = +${gap.toFixed(2)}s (${prev.name} ends @ ${prev.finish.toFixed(2)}s, ${curr.name} starts @ ${curr.targetStart.toFixed(2)}s)`
    );
  }

  // Step 3: Build mixed audio track using ffmpeg filter_complex with normalize=0
  console.log("\n=== ASSEMBLING MULTI-TRACK TIMELINE ===");
  const inputArgs = generatedClips.map((c) => `-i ${c.wavPath}`).join(" ");

  const delayFilters = generatedClips
    .map((c, idx) => {
      const delayMs = Math.round(c.targetStart * 1000);
      return `[${idx}:a]adelay=${delayMs}|${delayMs},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a${idx}]`;
    })
    .join("; ");

  const mixInputs = generatedClips.map((_, idx) => `[a${idx}]`).join("");
  const totalDur = 129.60;
  // normalize=0 eliminates input-counting attenuation that causes dynamic gain swings
  const rawFilter = `${delayFilters}; ${mixInputs}amix=inputs=${generatedClips.length}:normalize=0:dropout_transition=0,apad=whole_dur=${totalDur}[aout]`;

  const rawMixPath = "demo/narration/raw_narration_mix.wav";
  const masterPath = "demo/narration/full_narration_master.wav";

  console.log("Rendering multi-track audio mix with normalize=0...");
  execSync(`ffmpeg -y ${inputArgs} -filter_complex "${rawFilter}" -map "[aout]" ${rawMixPath}`, { stdio: "pipe" });

  // Measure raw mix peak volume
  const volDetectRaw = execSync(
    `ffmpeg -i ${rawMixPath} -af "volumedetect" -f null /dev/null 2>&1`,
    { encoding: "utf8" }
  );
  const maxVolMatch = volDetectRaw.match(/max_volume: ([-0-9.]+) dB/);
  const rawMaxVol = maxVolMatch ? parseFloat(maxVolMatch[1]) : 0;
  console.log(`Raw Mixed Master Peak Level: ${rawMaxVol.toFixed(1)} dB`);

  // Target broadcast peak of exactly -2.5 dB
  const targetPeak = -2.5;
  const gainAdjustment = targetPeak - rawMaxVol;
  console.log(`Applying precision leveling gain: ${gainAdjustment >= 0 ? "+" : ""}${gainAdjustment.toFixed(1)} dB to achieve exactly ${targetPeak.toFixed(1)} dB broadcast peak...`);

  execSync(
    `ffmpeg -y -i ${rawMixPath} -af "volume=${gainAdjustment.toFixed(1)}dB" ${masterPath}`,
    { stdio: "pipe" }
  );

  // Re-verify broadcast levels on master
  const volDetectFinal = execSync(
    `ffmpeg -i ${masterPath} -af "volumedetect" -f null /dev/null 2>&1`,
    { encoding: "utf8" }
  );
  const finalMean = volDetectFinal.match(/mean_volume: ([-0-9.]+) dB/)?.[1];
  const finalMax = volDetectFinal.match(/max_volume: ([-0-9.]+) dB/)?.[1];
  console.log(`Master Leveled Audio Levels -> Mean: ${finalMean} dB | Peak: ${finalMax} dB`);

  // Step 4: Mux with video
  console.log("\n=== MUXING FINAL DEMO VIDEO (1080p, H.264, AAC 48kHz Stereo) ===");
  const muxCmd = `ffmpeg -y \
    -i demo/backlot_studio_demo_silent_cut.mp4 \
    -i ${masterPath} \
    -c:v copy \
    -c:a aac -b:a 192k \
    demo/backlot_studio_demo.mp4`;
  execSync(muxCmd, { stdio: "inherit" });

  const finalStats = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of json demo/backlot_studio_demo.mp4`,
    { encoding: "utf8" }
  );
  console.log("\nFinal Video Verification Metadata:\n", finalStats);
  console.log("Note: Physical listening impression marked honestly as NOT VERIFIED (headless agent environment).");
}

generateTTS().catch((err) => {
  console.error("FATAL ERROR generating narration:", err);
  process.exit(1);
});
