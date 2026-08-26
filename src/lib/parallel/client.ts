import { ParallelSourceCitation } from "../types/pitch";

export interface ParallelSearchOptions {
  query: string;
  objective?: string;
  numResults?: number;
  marketContext?: string;
}

export interface ParallelRawSearchItem {
  url?: string;
  title?: string;
  publish_date?: string;
  excerpts?: string[];
  snippet?: string;
}

export interface ParallelRawSearchResponse {
  results?: ParallelRawSearchItem[];
  usage?: Array<{ name: string; count: number }>;
}

export class ParallelSearchClient {
  private apiKey?: string;
  private endpoint: string;

  constructor(
    apiKey?: string,
    endpoint: string = "https://api.parallel.ai/v1beta/search"
  ) {
    this.apiKey = apiKey || process.env.PARALLEL_API_KEY;
    this.endpoint = endpoint;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async searchMarket(
    options: ParallelSearchOptions,
    onLog?: (level: "info" | "warn" | "error", message: string) => void
  ): Promise<ParallelSourceCitation[]> {
    const query = options.query.trim();
    const objective =
      options.objective ||
      `Discover live indie film distribution comparables, festival awards, and box office reception for: ${query}`;

    if (!this.isConfigured()) {
      onLog?.(
        "warn",
        "PARALLEL_API_KEY not configured. Live market research unavailable."
      );
      return [];
    }

    try {
      onLog?.(
        "info",
        `Executing runtime Parallel Search API query: "${query}"...`
      );

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          objective,
          search_queries: [query],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        onLog?.(
          "warn",
          `Parallel Search API returned HTTP ${response.status}: ${errorText}. Live market research unavailable.`
        );
        return [];
      }

      const data: ParallelRawSearchResponse = await response.json();
      const results: ParallelSourceCitation[] = [];

      const rawItems = Array.isArray(data.results) ? data.results : [];

      for (const item of rawItems) {
        if (!item.url) continue;
        const title = item.title || "Market Analysis Source";
        const url = item.url;
        let snippet = "Verified market evidence record.";

        if (Array.isArray(item.excerpts) && item.excerpts.length > 0) {
          snippet = item.excerpts[0].trim();
        } else if (item.snippet) {
          snippet = item.snippet.trim();
        }

        if (snippet.length > 280) {
          snippet = snippet.slice(0, 277) + "...";
        }

        results.push({
          title,
          url,
          snippet,
          query,
          publishedDate: item.publish_date,
          relevance: options.marketContext || "Live market grounding from Parallel Search API",
        });
      }

      if (results.length === 0) {
        onLog?.(
          "warn",
          "Parallel Search returned 0 matching results for query."
        );
        return [];
      }

      onLog?.(
        "info",
        `Parallel Search retrieved ${results.length} verified live citation(s) for "${query}".`
      );
      return results;
    } catch (err) {
      onLog?.(
        "warn",
        `Parallel Search API call failed: ${String(err)}. Live market research unavailable.`
      );
      return [];
    }
  }

  public getFallbackCitations(): ParallelSourceCitation[] {
    return [];
  }
}
