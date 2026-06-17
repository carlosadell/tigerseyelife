// components/today/FocusHeroCard.tsx
import { coachStillForWeek } from '../../lib/coachStills';
import { PhotoHeroCard } from '../ui/PhotoHeroCard';

type FocusHeroCardProps = {
  weekIndex: number;
  headline: string;
};

/**
 * Weekly focus hero. The kicker is fixed; the headline is the week's
 * curated copy (Week.heroHeadline). Photo resolves through the block
 * via coachStillForWeek.
 */
export function FocusHeroCard({ weekIndex, headline }: FocusHeroCardProps) {
  return (
    <PhotoHeroCard
      kicker="THIS WEEK'S FOCUS"
      title={headline}
      photoUri={coachStillForWeek(weekIndex as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)}
    />
  );
}
