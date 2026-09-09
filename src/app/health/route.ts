import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "backlot-agent-runtime",
    contract: "Vertex AI Agent Runtime (Reasoning Engine BYOC)",
    timestamp: new Date().toISOString(),
  });
}
