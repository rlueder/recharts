import { Coordinate } from '../util/types';

export type PieSide = 'left' | 'right';

type PieEntryGeometry = {
  cx: number;
  cy: number;
  outerRadius: number;
  maxRadius: number;
};

export type PieComputedLabel<TEntry extends PieEntryGeometry> = {
  index: number;
  side: PieSide;
  entry: TEntry;
  midAngle: number;
  sliceAngle: number;
  textAnchor: 'start' | 'end';
  anchorPoint: Coordinate;
  radialPoint: Coordinate;
  bendPoint: Coordinate;
  labelPoint: Coordinate;
  isRerouted?: boolean;
};

export const getLabelGap = (fontSize: unknown): number => {
  if (typeof fontSize === 'number' && Number.isFinite(fontSize)) {
    return Math.max(fontSize + 8, 18);
  }
  if (typeof fontSize === 'string') {
    const parsed = Number.parseFloat(fontSize);
    if (Number.isFinite(parsed)) {
      return Math.max(parsed + 8, 18);
    }
  }
  return 20;
};

export const resolveLabelCollisionsBySide = <TEntry extends PieEntryGeometry>(
  labels: ReadonlyArray<PieComputedLabel<TEntry>>,
  side: PieSide,
  minGap: number,
  longRadialOffset: number,
): Array<PieComputedLabel<TEntry>> => {
  const sideLabels = labels.filter(label => label.side === side);
  if (sideLabels.length < 2) {
    return sideLabels.slice();
  }

  const sorted = [...sideLabels].sort((a, b) => a.labelPoint.y - b.labelPoint.y);
  const firstLabel = sorted[0];
  if (firstLabel == null) {
    return sideLabels.slice();
  }

  const boundaryRadius = firstLabel.entry.outerRadius + longRadialOffset + 16;
  const topBoundary = firstLabel.entry.cy - boundaryRadius;
  const bottomBoundary = firstLabel.entry.cy + boundaryRadius;

  const totalHeight = bottomBoundary - topBoundary;
  const effectiveGap =
    sorted.length > 1
      ? Math.max(1, Math.min(minGap, totalHeight / Math.max(1, sorted.length - 1)))
      : Math.max(1, minGap);

  const naturalCenterY = sorted.reduce((sum, label) => sum + label.labelPoint.y, 0) / sorted.length;
  let startY = naturalCenterY - ((sorted.length - 1) * effectiveGap) / 2;
  const minStart = topBoundary;
  const maxStart = bottomBoundary - (sorted.length - 1) * effectiveGap;
  startY = Math.min(Math.max(startY, minStart), maxStart);

  const adjustedY = sorted.map((_, index) => startY + index * effectiveGap);

  return sorted.map((label, index) => {
    const sideDirection = side === 'right' ? 1 : -1;
    const distanceRank = side === 'right' ? index : sorted.length - 1 - index;
    const smallestSliceAngle = sorted.reduce((minAngle, current) => Math.min(minAngle, current.sliceAngle), Infinity);
    const allowTopLabelPullIn = smallestSliceAngle <= 2.2;
    const taperedOffset = Math.min(28, distanceRank * 4);
    const topLabelPullIn =
      allowTopLabelPullIn && distanceRank === 0 ? -14 : allowTopLabelPullIn && distanceRank === 1 ? -8 : 0;
    const alignedX =
      label.entry.cx + sideDirection * (label.entry.outerRadius + longRadialOffset + 6 + taperedOffset + topLabelPullIn);
    const y = adjustedY[index] ?? label.labelPoint.y;

    return {
      ...label,
      bendPoint: {
        x: alignedX,
        y,
      },
      labelPoint: {
        x: alignedX + (side === 'right' ? 6 : -6),
        y,
      },
    };
  });
};
