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

export function derivePublisherFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    const knownPublishers: Record<string, string> = {
      "thefilmcollaborative.org": "The Film Collaborative",
      "screencraft.org": "ScreenCraft",
      "filmmakermagazine.com": "Filmmaker Magazine",
      "indiewire.com": "IndieWire",
      "variety.com": "Variety",
      "hollywoodreporter.com": "The Hollywood Reporter",
      "deadline.com": "Deadline",
      "rottentomatoes.com": "Rotten Tomatoes",
      "stephenfollows.com": "Stephen Follows",
      "filmindependent.org": "Film Independent",
      "moviemaker.com": "MovieMaker",
      "wga.org": "Writers Guild of America",
      "wgaeast.org": "Writers Guild of America East",
      "the-numbers.com": "The Numbers",
      "boxofficemojo.com": "Box Office Mojo",
      "sundance.org": "Sundance Institute",
      "sxsw.com": "SXSW",
    };

    if (knownPublishers[host]) return knownPublishers[host];

    const namePart = host.split(".")[0] || host;
    return namePart
      .split(/[-_.]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Industry Source";
  }
}

export function formatSourceAttribution(
  url: string,
  rawTitle?: string | null,
  publishDate?: string | null,
  snippet?: string | null
): {
  title: string;
  publisher: string;
  isArchive: boolean;
  isHistorical: boolean;
  rawTitle?: string;
} {
  const publisher = derivePublisherFromUrl(url);
  const trimmedRawTitle = (rawTitle || "").trim();

  let isArchive = false;
  let archiveSlug = "";

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    const archiveMatch = pathname.match(
      /\/(?:blog\/)?(?:tag|tags|category|categories|archive|archives|topic|topics|label|section)\/([^/?#]+)/i
    );
    if (archiveMatch) {
      isArchive = true;
      archiveSlug = decodeURIComponent(archiveMatch[1]).replace(/[-_]+/g, " ").trim();
    } else if (
      pathname === "" ||
      pathname === "/" ||
      pathname.endsWith("/blog") ||
      pathname.endsWith("/blog/") ||
      pathname.endsWith("/news") ||
      pathname.endsWith("/news/") ||
      pathname.endsWith("/archive") ||
      pathname.endsWith("/archive/")
    ) {
      isArchive = true;
    }
  } catch {
    // If URL parsing fails, retain defaults
  }

  let isHistorical = false;
  let yearFound: number | null = null;

  if (publishDate) {
    const yearMatch = publishDate.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      const yr = parseInt(yearMatch[1], 10);
      yearFound = yr;
      if (yr < 2023) {
        isHistorical = true;
      }
    }
  }

  if (!yearFound) {
    const urlYearMatch = url.match(/\/(19\d\d|20\d\d)(?:\/|\b)/);
    if (urlYearMatch) {
      const yr = parseInt(urlYearMatch[1], 10);
      yearFound = yr;
      if (yr < 2023) {
        isHistorical = true;
      }
    }
  }

  if (!isHistorical && snippet) {
    const snippetYearMatch = snippet.match(/\b(19\d\d|20[01]\d|202[0-2])\b/);
    if (snippetYearMatch) {
      isHistorical = true;
      if (!yearFound) yearFound = parseInt(snippetYearMatch[1], 10);
    }
  }

  let title: string;
  if (isArchive) {
    if (archiveSlug) {
      title = `${publisher} (Archive: ${archiveSlug}${yearFound ? `, ${yearFound}` : ""})`;
    } else {
      title = `${publisher} Archive${yearFound ? ` (${yearFound})` : ""}`;
    }
  } else if (trimmedRawTitle && trimmedRawTitle !== "Market Analysis Source") {
    title = trimmedRawTitle;
  } else {
    title = `${publisher}${yearFound ? ` (${yearFound})` : ""}`;
  }

  return {
    title,
    publisher,
    isArchive,
    isHistorical,
    rawTitle: trimmedRawTitle || undefined,
  };
}

export class ParallelSearchClient {
  private apiKey?: string;
  private endpoint: string;

  constructor(
    apiKey?: string,
    endpoint: string = "https://api.parallel.ai/v1beta/search"
  ) {
    this.apiKey = apiKey !== undefined ? apiKey : process.env.PARALLEL_API_KEY;
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
        const url = item.url;
        let snippet = "";

        if (Array.isArray(item.excerpts) && item.excerpts.length > 0) {
          const firstNonEmpty = item.excerpts.find((e) => typeof e === "string" && e.trim().length > 0);
          if (firstNonEmpty) {
            snippet = firstNonEmpty.trim();
          }
        } else if (typeof item.snippet === "string" && item.snippet.trim().length > 0) {
          snippet = item.snippet.trim();
        }

        if (snippet.length > 280) {
          snippet = snippet.slice(0, 277) + "...";
        }

        const attribution = formatSourceAttribution(
          url,
          item.title,
          item.publish_date,
          snippet
        );

        let relevance = options.marketContext || "Live market grounding from Parallel Search API";
        if (attribution.isHistorical) {
          relevance = `${relevance} [Historical archive benchmark]`;
        }

        results.push({
          title: item.title || attribution.title,
          url,
          snippet,
          query,
          publishedDate: item.publish_date,
          relevance,
          rawTitle: attribution.rawTitle,
          publisher: attribution.publisher,
          isArchive: attribution.isArchive,
          isHistorical: attribution.isHistorical,
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
