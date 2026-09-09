import { describe, it, expect, vi } from "vitest";
import { ParallelSearchClient } from "../client";

describe("Parallel Partner Search Client", () => {
  it("returns empty array and logs warning when API key is unconfigured (honest degradation)", async () => {
    const client = new ParallelSearchClient("");
    expect(client.isConfigured()).toBe(false);

    const logs: string[] = [];
    const citations = await client.searchMarket(
      {
        query: "FREQUENCY ZERO sci-fi thriller indie short film festival market comps",
        numResults: 2,
      },
      (lvl, msg) => logs.push(`[${lvl}] ${msg}`)
    );

    expect(citations).toEqual([]);
    expect(logs.some((l) => l.includes("PARALLEL_API_KEY not configured"))).toBe(true);
  });

  it("handles live API mock response and formats ParallelSourceCitation objects", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: "Sundance 2026 Shorts Program Slate Announcement",
            url: "https://www.sundance.org/festivals/short-film-slate-2026",
            excerpts: ["Contained sci-fi thrillers highlighted the dramatic narrative short competition."],
            publish_date: "2026-01-15",
          },
          {
            title: "SXSW Midnighter Festival Highlights & Acquisitions",
            url: "https://variety.com/sxsw-midnight-shorts-acquisitions-2026",
            excerpts: ["High-concept suspense thrillers with practical effects acquired for digital distribution."],
            publish_date: "2026-03-20",
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
    expect(citations[0].snippet).toBe("Contained sci-fi thrillers highlighted the dramatic narrative short competition.");
    expect(citations[0].relevance).toBe("Festival programming evidence");
  });

  it("returns empty array and logs warning when API returns HTTP error", async () => {
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

    expect(citations).toEqual([]);
    expect(logs.some((l) => l.includes("unavailable") || l.includes("failed"))).toBe(true);
  });

  it("preserves retrieved URL, title, and excerpt together without keyword replacement", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: "The Popcorn List: Independent Film Festivals Roundup",
            url: "https://www.thefilmcollaborative.org/blog/tag/horror-films/",
            excerpts: ["The production value bar is set by festival programmers for horror entries."],
            publish_date: "2023-11-01",
          },
        ],
      }),
    });

    global.fetch = mockFetch as any;

    const client = new ParallelSearchClient("test_parallel_key");
    const citations = await client.searchMarket({ query: "horror film production value" });

    expect(citations.length).toBe(1);
    // Must NOT be overwritten with the 2013 article URL or title
    expect(citations[0].url).toBe("https://www.thefilmcollaborative.org/blog/tag/horror-films/");
    expect(citations[0].title).toBe("The Popcorn List: Independent Film Festivals Roundup");
    expect(citations[0].snippet).toBe("The production value bar is set by festival programmers for horror entries.");
  });

  it("treats isConfigured strictly as configuration presence, distinct from live search execution", async () => {
    const client = new ParallelSearchClient("valid_api_key");
    // Configuration check evaluates API key presence only
    expect(client.isConfigured()).toBe(true);

    // Live search execution is separate and depends on network/provider response
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });
    global.fetch = mockFetch as any;

    const citations = await client.searchMarket({ query: "market comps" });
    // Configuration being true does NOT imply successful provider execution
    expect(client.isConfigured()).toBe(true);
    expect(citations).toEqual([]);
  });
});

