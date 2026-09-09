import { describe, it, expect, vi } from "vitest";
import { ParallelSearchClient } from "../client";

describe("Parallel Client — Missing Excerpt Evidence Handling", () => {
  it("keeps missing, empty, or whitespace-only excerpts as empty string without placeholder substitution", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: "Article with No Excerpts",
            url: "https://example.com/no-excerpt",
            excerpts: [],
            snippet: "",
          },
          {
            title: "Article with Whitespace Excerpt",
            url: "https://example.com/whitespace-excerpt",
            excerpts: ["   \n\t  "],
            snippet: "   ",
          },
        ],
      }),
    });

    global.fetch = mockFetch as any;

    const client = new ParallelSearchClient("test_parallel_key");
    const citations = await client.searchMarket({ query: "market test" });

    expect(citations.length).toBe(2);
    // Missing, empty, or whitespace-only source text must remain unavailable ("")
    // It must NOT substitute "Verified market evidence record."!
    expect(citations[0].snippet).toBe("");
    expect(citations[0].title).toBe("Article with No Excerpts");
    expect(citations[0].url).toBe("https://example.com/no-excerpt");

    expect(citations[1].snippet).toBe("");
    expect(citations[1].title).toBe("Article with Whitespace Excerpt");
    expect(citations[1].url).toBe("https://example.com/whitespace-excerpt");
  });
});
