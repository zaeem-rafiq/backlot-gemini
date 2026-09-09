import { NextRequest } from "next/server";
import { POST as reasoningEnginePost, GET as reasoningEngineGet } from "../api/reasoning_engine/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return reasoningEngineGet();
}

export async function POST(req: NextRequest) {
  return reasoningEnginePost(req);
}
