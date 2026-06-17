// lib/heroAnchors.ts
//
// Per-week hero anchor resolution. Anchors are tap-to-engage cards on
// the Today tab. Engagement persists via hooks/useDailyEngagement; no
// toggle UI per the design.

import {
  Apple,
  BookOpen,
  Brain,
  Carrot,
  Compass,
  Droplet,
  Dumbbell,
  Eye,
  Footprints,
  Hand,
  Leaf,
  MessageCircle,
  Moon,
  Shield,
  Sparkles,
  Sunrise,
  Tag,
  Utensils,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { weekFor } from './program';
import type { AnchorIcon, HeroAnchor, WeekNumber } from './program';

const ICONS: Record<AnchorIcon, LucideIcon> = {
  apple: Apple,
  'book-open': BookOpen,
  brain: Brain,
  carrot: Carrot,
  compass: Compass,
  droplet: Droplet,
  dumbbell: Dumbbell,
  eye: Eye,
  footprints: Footprints,
  hand: Hand,
  leaf: Leaf,
  'message-circle': MessageCircle,
  moon: Moon,
  shield: Shield,
  sparkles: Sparkles,
  sunrise: Sunrise,
  tag: Tag,
  utensils: Utensils,
  wind: Wind,
  zap: Zap,
};

export function resolveAnchorIcon(name: AnchorIcon): LucideIcon {
  return ICONS[name];
}

export function anchorsForWeek(n: WeekNumber): HeroAnchor[] {
  return weekFor(n).heroAnchors;
}

export function heroHeadlineFor(n: WeekNumber): string {
  return weekFor(n).heroHeadline;
}
