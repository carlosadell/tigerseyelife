// lib/commitAnchors.ts
//
// The three Commit Block anchors. Order is intentional; matches CLAUDE.product.md §3.

import { Carrot, Leaf, Tag, type LucideIcon } from 'lucide-react-native';

export type CommitAnchor = {
  id: 'read-labels' | 'cut-sugar' | 'protein-veg';
  Icon: LucideIcon;
  title: string;
  sub: string;
  lessonSlug: string;
};

export const COMMIT_ANCHORS: CommitAnchor[] = [
  {
    id: 'read-labels',
    Icon: Tag,
    title: 'Read labels',
    sub: "Know what's in it before it goes in.",
    lessonSlug: 'reading-labels',
  },
  {
    id: 'cut-sugar',
    Icon: Leaf,
    title: 'Cut added sugar by half',
    sub: 'One swap is a win.',
    lessonSlug: 'cutting-added-sugar',
  },
  {
    id: 'protein-veg',
    Icon: Carrot,
    title: 'Protein + vegetables',
    sub: 'Build every plate around them.',
    lessonSlug: 'balanced-plate',
  },
];
