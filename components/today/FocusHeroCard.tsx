// components/today/FocusHeroCard.tsx
import { coachStillForWeek } from '../../lib/coachStills';
import { PhotoHeroCard } from '../ui/PhotoHeroCard';

type FocusHeroCardProps = {
  weekIndex: number;
};

/**
 * Weekly Commit focus hero. Kicker + headline are spec-fixed; photo rotates
 * by week. When PHOTO_ASSETS_READY=true and real Karen/Ryan stills land, the
 * underlying pool swaps without any change here.
 */
export function FocusHeroCard({ weekIndex }: FocusHeroCardProps) {
  return (
    <PhotoHeroCard
      kicker="THIS WEEK'S FOCUS"
      title="Three things, every plate."
      photoUri={coachStillForWeek(weekIndex)}
    />
  );
}
