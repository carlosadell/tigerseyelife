// lib/toolLayered.ts
//
// Derivation helper that scaffolds a LayeredContent from a Tool's
// existing body. Used only as a starting point in Task 12 — the
// generated Layer 1 text is rough and needs hand-tightening before
// shipping.

import type { LayeredContent } from './layeredContent';
import { wordCount } from './layeredContent';
import type { Tool, ToolBody } from './tools';

export function toolToLayered(tool: Tool): LayeredContent {
  const layer1Body = scaffoldLayer1(tool.body);
  return {
    layer1: { body: layer1Body, wordCount: wordCount(layer1Body) },
    layer2: { kind: 'text-only', body: tool.body },
  };
}

function scaffoldLayer1(body: ToolBody): string {
  if (body.kind === 'static-page') {
    const intro = body.intro?.trim() ?? '';
    const first = body.sections[0];
    if (first) return `${intro} ${first.heading}: ${first.body}`.trim();
    return intro;
  }
  if (body.kind === 'checklist' || body.kind === 'menu-list') {
    return body.intro?.trim() ?? '';
  }
  return body.intro?.trim() ?? '';
}
