import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

type EyeMarkProps = {
  color: string;
  size?: number;
  strokeWidth?: number;
};

export function EyeMark({ color, size = 28, strokeWidth = 1.8 }: EyeMarkProps) {
  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Polygon
        fill="none"
        points="32 6 58 32 32 58 6 32"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M15 32c5.3-8 10.9-12 17-12s11.7 4 17 12c-5.3 8-10.9 12-17 12S20.3 40 15 32Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle cx="32" cy="32" fill="none" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="32" x2="32" y1="14" y2="50" stroke={color} strokeWidth={strokeWidth * 0.72} />
    </Svg>
  );
}
