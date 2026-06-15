import Svg, { Polygon } from 'react-native-svg';

/**
 * The Tigers Eye Life brand mark — a horizontal diamond rhombus with a
 * 4-point sparkle/compass star centered inside. Matches the wordmark
 * asset Karen + Ryan provided.
 *
 * The `size` prop sets the WIDTH; height is derived from the 80:56 viewBox
 * aspect (~1.43:1), so the mark renders as a horizontal rhombus rather
 * than a square. Use small inline (24–34) for nav/footers, larger
 * (60–90) for hero/onboarding surfaces.
 */
type EyeMarkProps = {
  color: string;
  size?: number;
  strokeWidth?: number;
};

const VIEW_W = 80;
const VIEW_H = 56;

export function EyeMark({ color, size = 28, strokeWidth = 1.8 }: EyeMarkProps) {
  const height = (size * VIEW_H) / VIEW_W;
  return (
    <Svg height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={size}>
      <Polygon
        fill="none"
        points="40 5 75 28 40 51 5 28"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Polygon
        fill={color}
        points="40 14 42.6 25.4 54 28 42.6 30.6 40 42 37.4 30.6 26 28 37.4 25.4"
      />
    </Svg>
  );
}
