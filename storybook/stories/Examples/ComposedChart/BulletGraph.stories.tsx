import React from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  ResponsiveContainer,
  BarShapeProps,
} from '../../../../src';
import { RechartsHookInspector } from '../../../storybook-addon-recharts';

interface BulletGraphRow {
  name: string;
  actual: number;
  target: number;
  previous?: number;
  projected?: number;
  ranges: [number, number, number];
}

interface PreparedBulletGraphRow {
  name: string;
  actual: number;
  target: number;
  previous: number;
  projectedRemainder: number;
  poor: number;
  satisfactory: number;
  good: number;
}

const BAND_SIZE = 30;
const MEASURE_SIZE = 10;

const rangeFills = {
  poor: '#999999',
  satisfactory: '#bfbfbf',
  good: '#e6e6e6',
} as const;

const CenteredMeasureShape = (props: BarShapeProps) => {
  const { x, y, width, height, fill = '#000000' } = props;

  if (x == null || y == null || width == null || height == null) {
    return null;
  }

  const measureY = y + (height - MEASURE_SIZE) / 2;
  const measureX = Math.min(x, x + width);

  return <rect x={measureX} y={measureY} width={Math.abs(width)} height={MEASURE_SIZE} fill={fill} />;
};

const markerShape = (stroke: string, strokeWidth: number) => {
  return function Marker(props: BarShapeProps) {
    const { x, y, width, height } = props;

    if (x == null || y == null || width == null || height == null) {
      return null;
    }

    const markerX = x + width;

    return <line x1={markerX} y1={y} x2={markerX} y2={y + height} stroke={stroke} strokeWidth={strokeWidth} />;
  };
};

const PrimaryComparativeMarker = markerShape('#000000', 1.5);
const SecondaryComparativeMarker = markerShape('#404040', 1.5);

const prepareData = (rows: ReadonlyArray<BulletGraphRow>): ReadonlyArray<PreparedBulletGraphRow> => {
  return rows.map(row => ({
    name: row.name,
    actual: row.actual,
    target: row.target,
    previous: row.previous ?? 0,
    projectedRemainder: Math.max((row.projected ?? row.actual) - row.actual, 0),
    poor: row.ranges[0],
    satisfactory: row.ranges[1],
    good: row.ranges[2],
  }));
};

interface HorizontalBulletChartProps {
  data: ReadonlyArray<BulletGraphRow>;
  showPrevious?: boolean;
  showProjection?: boolean;
  reverseQualitativeOrder?: boolean;
  reversedScale?: boolean;
  domain?: [number, number];
}

const HorizontalBulletChart = ({
  data,
  showPrevious = false,
  showProjection = false,
  reverseQualitativeOrder = false,
  reversedScale = false,
  domain = [0, 100],
}: HorizontalBulletChartProps) => {
  const preparedData = prepareData(data);

  const firstRangeKey = reverseQualitativeOrder ? 'good' : 'poor';
  const secondRangeKey = 'satisfactory';
  const thirdRangeKey = reverseQualitativeOrder ? 'poor' : 'good';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={preparedData}
        layout="vertical"
        barGap={-BAND_SIZE}
        barCategoryGap="0%"
        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" domain={domain} reversed={reversedScale} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
        <Tooltip />

        <Bar
          dataKey={firstRangeKey}
          stackId="range"
          fill={rangeFills[firstRangeKey]}
          barSize={BAND_SIZE}
          isAnimationActive={false}
        />
        <Bar
          dataKey={secondRangeKey}
          stackId="range"
          fill={rangeFills[secondRangeKey]}
          barSize={BAND_SIZE}
          isAnimationActive={false}
        />
        <Bar
          dataKey={thirdRangeKey}
          stackId="range"
          fill={rangeFills[thirdRangeKey]}
          barSize={BAND_SIZE}
          isAnimationActive={false}
        />

        {showPrevious ? (
          <Bar
            dataKey="previous"
            fill="none"
            barSize={BAND_SIZE}
            shape={<SecondaryComparativeMarker />}
            isAnimationActive={false}
          />
        ) : null}
        <Bar
          dataKey="target"
          fill="none"
          barSize={BAND_SIZE}
          shape={<PrimaryComparativeMarker />}
          isAnimationActive={false}
        />

        <Bar
          dataKey="actual"
          stackId={showProjection ? 'featured' : undefined}
          fill="#000000"
          barSize={BAND_SIZE}
          shape={<CenteredMeasureShape />}
          isAnimationActive={false}
        />
        {showProjection ? (
          <Bar
            dataKey="projectedRemainder"
            stackId="featured"
            fill="#6b7280"
            barSize={BAND_SIZE}
            shape={<CenteredMeasureShape />}
            isAnimationActive={false}
          />
        ) : null}

        <RechartsHookInspector />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

interface VerticalBulletChartProps {
  data: ReadonlyArray<BulletGraphRow>;
}

const VerticalBulletChart = ({ data }: VerticalBulletChartProps) => {
  const preparedData = prepareData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={preparedData}
        layout="horizontal"
        barGap={-BAND_SIZE}
        barCategoryGap="0%"
        margin={{ top: 30, right: 20, left: 20, bottom: 40 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
        <YAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
        <Tooltip />

        <Bar dataKey="poor" stackId="range" fill={rangeFills.poor} barSize={BAND_SIZE} isAnimationActive={false} />
        <Bar
          dataKey="satisfactory"
          stackId="range"
          fill={rangeFills.satisfactory}
          barSize={BAND_SIZE}
          isAnimationActive={false}
        />
        <Bar dataKey="good" stackId="range" fill={rangeFills.good} barSize={BAND_SIZE} isAnimationActive={false} />

        <Bar
          dataKey="target"
          fill="none"
          barSize={BAND_SIZE}
          shape={<PrimaryComparativeMarker />}
          isAnimationActive={false}
        />
        <Bar
          dataKey="actual"
          fill="#000000"
          barSize={BAND_SIZE}
          shape={<CenteredMeasureShape />}
          isAnimationActive={false}
        />

        <RechartsHookInspector />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const standardData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Revenue', actual: 72, target: 85, ranges: [50, 30, 20] },
  { name: 'Profit', actual: 61, target: 70, ranges: [45, 30, 25] },
  { name: 'Retention', actual: 87, target: 90, ranges: [60, 25, 15] },
  { name: 'SLA', actual: 93, target: 97, ranges: [70, 20, 10] },
];

const withTwoComparativesData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Revenue', actual: 72, previous: 66, target: 85, ranges: [50, 30, 20] },
  { name: 'Profit', actual: 61, previous: 58, target: 70, ranges: [45, 30, 25] },
  { name: 'Retention', actual: 87, previous: 83, target: 90, ranges: [60, 25, 15] },
  { name: 'SLA', actual: 93, previous: 91, target: 97, ranges: [70, 20, 10] },
];

const projectionData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Revenue', actual: 48, projected: 89, target: 85, ranges: [50, 30, 20] },
  { name: 'Profit', actual: 44, projected: 73, target: 70, ranges: [45, 30, 25] },
  { name: 'Retention', actual: 61, projected: 91, target: 90, ranges: [60, 25, 15] },
  { name: 'SLA', actual: 72, projected: 95, target: 97, ranges: [70, 20, 10] },
];

const positiveNegativeData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Net Profit', actual: -12, target: 20, ranges: [40, 60, 50] },
  { name: 'Cash Flow', actual: 28, target: 35, ranges: [40, 60, 50] },
];

const expensesData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Expenses', actual: 36, target: 30, ranges: [20, 30, 50] },
  { name: 'Defects', actual: 18, target: 12, ranges: [20, 30, 50] },
];

export default {
  component: ComposedChart,
};

export const Standard = {
  render: () => <HorizontalBulletChart data={standardData} />,
};

export const TwoComparativeMeasures = {
  render: () => <HorizontalBulletChart data={withTwoComparativesData} showPrevious />,
};

export const MultipleBulletGraphsVerticalArrangement = {
  render: () => <HorizontalBulletChart data={standardData} />,
};

export const MultipleBulletGraphsHorizontalArrangement = {
  render: () => <VerticalBulletChart data={standardData} />,
};

export const PositiveAndNegativeValues = {
  render: () => <HorizontalBulletChart data={positiveNegativeData} domain={[-40, 110]} />,
};

export const LowerIsBetterReversedRanges = {
  render: () => <HorizontalBulletChart data={expensesData} reverseQualitativeOrder />,
};

export const LowerIsBetterReversedRangesAndScale = {
  render: () => <HorizontalBulletChart data={expensesData} reverseQualitativeOrder reversedScale />,
};

export const ProjectionToPeriodEnd = {
  render: () => <HorizontalBulletChart data={projectionData} showProjection />,
};
