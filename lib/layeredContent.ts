// lib/layeredContent.ts
//
// Three-layer content model. Per the dev brief (2026-06-16) this is the
// lever for cutting Beta 1's reading load: Layer 1 is the only required
// text; Layer 2 carries the core teaching with optional audio so the
// reading-tired member can press play; Layer 3 is opt-in deep dive.

import type { ToolBody } from './tools';

export type Layer1Content = {
  // Should target <= 60 words so it reads in ~30 seconds.
  wordCount: number;
  body: string;
};

// A contiguous slice of an audio track. The dev brief calls for a hybrid
// recording — a Karen/Ryan human intro and outro wrapping an ElevenLabs
// synthetic body. Chapters carry that structure into the scrubber so
// listeners can see (a) the synthetic body is disclosed plainly, not
// hidden behind a human voice, and (b) where the human/synthetic
// transitions happen on the timeline. Times are in seconds from start.
// Chapters must be contiguous and cover the entire track.
export type AudioChapter = {
  kind: 'human' | 'synthetic';
  startSec: number;
  endSec: number;
  label?: string;
};

export type Layer2Content =
  | { kind: 'text-only'; body: ToolBody }
  | {
      kind: 'text-or-audio';
      body: ToolBody;
      audioUri: string;
      audioDurationSec: number;
      chapters?: ReadonlyArray<AudioChapter>;
    }
  // Karen retired audio content 2026-07-01 and shifted teaching to
  // YouTube unlisted (same pipeline as the exercise tutorials). This
  // variant is what new authored L2 content targets. `youtubeVideoId`
  // is the raw ID (the "abc123" part of youtu.be/abc123), rendered
  // with react-native-youtube-iframe like exercise videos.
  | {
      kind: 'text-or-video';
      body: ToolBody;
      youtubeVideoId: string;
      // Optional runtime hint for the mode-toggle label. Empty string or
      // undefined falls back to "Watch". Kept short — the button is narrow.
      watchCtaLabel?: string;
    };

export type Layer3Content = {
  audioUri: string;
  audioDurationSec: number;
  title: string;
  // Short scaffolding text shown above the player. Not a transcript.
  body: string;
  chapters?: ReadonlyArray<AudioChapter>;
};

export type LayeredContent = {
  layer1: Layer1Content;
  layer2?: Layer2Content;
  layer3?: Layer3Content;
};

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// Per the dev brief, Layer 1 is the only required text and must read in
// roughly 30 seconds. Sixty words is the cap we hold authors to. This
// helper runs in dev so any tool whose Layer 1 has drifted past the cap
// surfaces immediately at module load — no waiting for a beta tester to
// flag it.
export const LAYER1_MAX_WORDS = 60;

export type LayeredContentWarning = {
  conceptSlug: string;
  kind: 'layer1-too-long' | 'layer1-wordcount-mismatch';
  message: string;
};

export function validateLayered(
  conceptSlug: string,
  content: LayeredContent,
): LayeredContentWarning[] {
  const warnings: LayeredContentWarning[] = [];
  const actual = wordCount(content.layer1.body);

  if (actual > LAYER1_MAX_WORDS) {
    warnings.push({
      conceptSlug,
      kind: 'layer1-too-long',
      message: `Layer 1 has ${actual} words (max ${LAYER1_MAX_WORDS}). Trim ${actual - LAYER1_MAX_WORDS} words to keep the 30-second read.`,
    });
  }

  // If the author manually set wordCount, sanity-check it matches the
  // actual content. Off-by-one tolerated (the cleanup regex can disagree
  // with hand-counting by a token or two).
  if (Math.abs(content.layer1.wordCount - actual) > 1) {
    warnings.push({
      conceptSlug,
      kind: 'layer1-wordcount-mismatch',
      message: `Layer 1 wordCount declared as ${content.layer1.wordCount} but actual is ${actual}.`,
    });
  }

  return warnings;
}
