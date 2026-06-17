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

export type Layer2Content =
  | { kind: 'text-only'; body: ToolBody }
  | {
      kind: 'text-or-audio';
      body: ToolBody;
      audioUri: string;
      audioDurationSec: number;
    };

export type Layer3Content = {
  audioUri: string;
  audioDurationSec: number;
  title: string;
  // Short scaffolding text shown above the player. Not a transcript.
  body: string;
};

export type LayeredContent = {
  layer1: Layer1Content;
  layer2?: Layer2Content;
  layer3?: Layer3Content;
};

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
