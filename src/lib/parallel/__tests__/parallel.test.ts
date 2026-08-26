import { describe, it, expect, vi } from "vitest";
import { ParallelSearchClient } from "../client";

describe("Parallel Partner Search Client", () => {
  it("formats fallback market citations when API key is unconfigured", async () => {
    const client = new ParallelSearchClient("");
    expect(client.isConfigured()).toBe(false);

    const citations = await client.searchMarket({
      query: "FREQUENCY ZERO sci-fi thriller indie short film festival market comps",
      numResults: 2,
    });

    expect(citations.length).toBeGreaterThanOrEqual(2);
    expect(citations[0].url).toMatch(/^https?:\/\//);
    expect(citations[0].snippet).toBeDefined();
    expect(citations[0].title).toBeDefined();
  });

  it("handles live API mock response and formats ParallelSourceCitation objects", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: "Sundance 2026 Shorts Program Slate Announcement",
            url: "https://www.sundance.org/festivals/short-film-slate-2026",
            snippet: "Contained sci-fi thrillers highlighted the dramatic narrative short competition.",
            published_date: "2026-01-15",
          },
          {
            title: "SXSW Midnighter Festival Highlights & Acquisitions",
            url: "https://variety.com/sxsw-midnight-shorts-acquisitions-2026",
            snippet: "High-concept suspense thrillers with practical effects acquired for digital distribution.",
            published_date: "2026-03-20",
          },
        ],
      }),
    });

    global.fetch = mockFetch as any;

    const client = new ParallelSearchClient("test_parallel_key");
    expect(client.isConfigured()).toBe(true);

    const citations = await client.searchMarket({
      query: "Sundance SXSW short film acquisitions",
      numResults: 2,
      marketContext: "Festival programming evidence",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(citations.length).toBe(2);
    expect(citations[0].title).toContain("Sundance");
    expect(citations[0].url).toBe("https://www.sundance.org/festivals/short-film-slate-2026");
    expect(citations[0].relevance).toBe("Festival programming evidence");
  });

  it("degrades gracefully to calibrated market index when API returns HTTP error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    }) as any;

    const client = new ParallelSearchClient("test_parallel_key");
    const logs: string[] = [];

    const citations = await client.searchMarket(
      { query: "Sci-Fi Thriller comps" },
      (lvl, msg) => logs.push(`[${lvl}] ${msg}`)
    );

    expect(citations.length).toBeGreaterThan(0);
    expect(logs.some((l) => l.includes("Falling back"))).toBe(true);
  });
});
