// Parses an externally provided HTML planning file and extracts the `postsData` array.
// Strategy: regex-locate `const postsData = [ ... ];` block, then evaluate it inside a
// sandboxed Function so we accept JS object literals (with template strings, comments, etc.).

export interface ImportedPost {
  id?: number;
  date?: string;
  day?: string;
  theme?: string;
  format?: string;
  channels?: string[];
  strategicPillar?: string;
  intentionPillar?: string;
  disclaimer?: string;
  visualSuggestion?: string;
  artContent?: { headline?: string; subtitle?: string };
  carouselContent?: { title?: string; body?: string }[];
  videoScript?: string;
  igFbCaption?: string;
  linkedinCaption?: string;
  hashtags?: string;
}

export function extractPostsFromHtml(html: string): ImportedPost[] {
  if (!html) throw new Error("Conteúdo vazio.");

  // 1. Try to match: const postsData = [ ... ];  (greedy until matching `];` followed by code/end)
  const match =
    html.match(/(?:const|let|var)\s+postsData\s*=\s*(\[[\s\S]*?\])\s*;/) ||
    html.match(/postsData\s*=\s*(\[[\s\S]*?\])\s*;/);

  if (!match) {
    throw new Error("Não foi possível encontrar `postsData` no HTML enviado.");
  }

  // The lazy regex above can stop at the first `];` inside content. Try to find a more
  // robust span by scanning brackets manually starting from the `[` of the assignment.
  const startIdx = html.indexOf("postsData");
  const bracketIdx = html.indexOf("[", startIdx);
  let depth = 0;
  let endIdx = -1;
  let inStr: string | null = null;
  let escape = false;
  for (let i = bracketIdx; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { inStr = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) { endIdx = i; break; } }
  }

  const literal = endIdx > -1 ? html.slice(bracketIdx, endIdx + 1) : match[1];

  try {
    // Evaluate as JS expression in an isolated scope
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const fn = new Function(`"use strict"; return (${literal});`);
    const data = fn();
    if (!Array.isArray(data)) throw new Error("postsData não é um array.");
    return data as ImportedPost[];
  } catch (e) {
    throw new Error(
      "Falha ao interpretar o postsData. Verifique se o HTML está bem formado. (" +
        (e as Error).message +
        ")",
    );
  }
}

// Convert imported post (from HTML) into a row ready for `posts` table insert.
export function mapImportedToRow(p: ImportedPost, index: number, planId: string) {
  return {
    plan_id: planId,
    position: index,
    date_label: p.date ?? null,
    day_label: p.day ?? null,
    theme: p.theme ?? null,
    format: p.format ?? null,
    channels: Array.isArray(p.channels) ? p.channels : [],
    strategic_pillar: p.strategicPillar ?? null,
    intention_pillar: p.intentionPillar ?? null,
    disclaimer: p.disclaimer ?? null,
    visual_suggestion: p.visualSuggestion ?? null,
    art_headline: p.artContent?.headline ?? null,
    art_subtitle: p.artContent?.subtitle ?? null,
    carousel_content: p.carouselContent ?? [],
    video_script: p.videoScript ?? null,
    ig_fb_caption: p.igFbCaption ?? null,
    linkedin_caption: p.linkedinCaption ?? null,
    hashtags: p.hashtags ?? null,
    approval_status: "pending",
  };
}
