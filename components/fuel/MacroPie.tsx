import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../../lib/brand';

type MacroPieProps = {
  protein: number;
  fat: number;
  carb: number;
  size: number;
};

/**
 * Macro pie chart computed from caloric contribution
 * (protein × 4, carb × 4, fat × 9). Fiber is intentionally excluded
 * since it doesn't contribute to the calorie pie. Returns a hollow
 * outline when total cal is 0 so the visual still anchors the card.
 */
export function MacroPie({ protein, fat, carb, size }: MacroPieProps) {
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const carbCal = carb * 4;
  const total = proteinCal + fatCal + carbCal;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 6;

  if (total === 0) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path
          d={describeFullCircle(cx, cy, radius)}
          fill="#00000000"
          stroke={COLORS.bone}
          strokeWidth={1}
        />
      </Svg>
    );
  }

  const segments = [
    { value: proteinCal / total, color: COLORS.deepGreen },
    { value: carbCal / total, color: COLORS.electricYellow },
    { value: fatCal / total, color: COLORS.tigerGold },
  ].filter((s) => s.value > 0);

  let cumulative = 0;
  const paths: { d: string; color: string }[] = [];

  if (segments.length === 1) {
    paths.push({ d: describeFullCircle(cx, cy, radius), color: segments[0].color });
  } else {
    for (const seg of segments) {
      const start = cumulative * 2 * Math.PI - Math.PI / 2;
      const end = (cumulative + seg.value) * 2 * Math.PI - Math.PI / 2;
      cumulative += seg.value;
      paths.push({
        d: describeArc(cx, cy, radius, start, end, seg.value > 0.5),
        color: seg.color,
      });
    }
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.color} />
      ))}
    </Svg>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  largeArc: boolean,
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc ? 1 : 0} 1 ${x2} ${y2} Z`;
}

function describeFullCircle(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}
