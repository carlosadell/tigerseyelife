// components/today/NextLessonCard.tsx
import { LessonCard } from '../ui/LessonCard';

type NextLessonCardProps = {
  meta?: string;
  title?: string;
  body?: string;
  thumbUri?: string;
  onPress?: () => void;
};

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop';

/**
 * Today's "Next Lesson" wrapper around the generic LessonCard. Defaults to
 * the Commit-block introductory lesson; props override per current schedule.
 */
export function NextLessonCard({
  meta = 'Nutrition · 4 min',
  title = 'Building a Balanced Plate',
  body = 'Half your plate, every plate. Under a minute to set up.',
  thumbUri = FALLBACK_THUMB,
  onPress,
}: NextLessonCardProps) {
  return <LessonCard meta={meta} title={title} body={body} thumbUri={thumbUri} onPress={onPress} />;
}
