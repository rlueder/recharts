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
import type { TooltipContentProps } from '../../../../src';
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
  poor: '#fecaca',
  satisfactory: '#fde68a',
  good: '#bbf7d0',
} as const;

const seriesColors: Record<string, string> = {
  actual: '#2563eb',
  target: '#dc2626',
  previous: '#7c3aed',
  projectedRemainder: '#60a5fa',
  poor: rangeFills.poor,
  satisfactory: rangeFills.satisfactory,
  good: rangeFills.good,
};

const sansSerifFont = 'Arial, Helvetica, sans-serif';
const tooltipOrder = ['actual', 'target', 'previous', 'projectedRemainder', 'poor', 'satisfactory', 'good'];
const tooltipNameMap: Record<string, string> = {
  actual: 'Actual',
  target: 'Target',
  previous: 'Previous',
  projectedRemainder: 'Projected remainder',
  poor: 'Poor range',
  satisfactory: 'Satisfactory range',
  good: 'Good range',
};

const BulletTooltipContent = ({ active, label, payload }: TooltipContentProps<number, string>) => {
  if (!active || payload == null || payload.length === 0) {
    return null;
  }

  const sortedPayload = [...payload].sort((a, b) => {
    const aKey = String(a.dataKey ?? a.name ?? '');
    const bKey = String(b.dataKey ?? b.name ?? '');
    return tooltipOrder.indexOf(aKey) - tooltipOrder.indexOf(bKey);
  });

  return (
    <div
      style={{
        fontFamily: sansSerifFont,
        backgroundColor: '#fff',
        border: '1px solid #d1d5db',
        padding: '8px 10px',
        fontSize: 12,
        lineHeight: 1.35,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {sortedPayload.map(entry => {
        const key = String(entry.dataKey ?? entry.name ?? '');
        const name = tooltipNameMap[key] ?? key;
        const swatch = seriesColors[key] ?? '#6b7280';

        return (
          <div key={`${key}-${entry.value}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: swatch,
                border: '1px solid rgba(17, 24, 39, 0.25)',
                flexShrink: 0,
              }}
            />
            <span>
              {name}: {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

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

const PrimaryComparativeMarker = markerShape(seriesColors.target, 1.5);
const SecondaryComparativeMarker = markerShape(seriesColors.previous, 1.5);

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
        <XAxis
          type="number"
          domain={domain}
          reversed={reversedScale}
          tickLine={false}
          axisLine={false}
          tick={{ fontFamily: sansSerifFont }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fontFamily: sansSerifFont }}
        />
        <Tooltip content={<BulletTooltipContent />} />

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
          fill={seriesColors.actual}
          barSize={BAND_SIZE}
          shape={<CenteredMeasureShape />}
          isAnimationActive={false}
        />
        {showProjection ? (
          <Bar
            dataKey="projectedRemainder"
            stackId="featured"
            fill={seriesColors.projectedRemainder}
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
        <XAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontFamily: sansSerifFont }} />
        <YAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontFamily: sansSerifFont }} />
        <Tooltip content={<BulletTooltipContent />} />

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
          fill={seriesColors.actual}
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

interface BulletMetricSpec {
  label: string;
  unit: string;
  max: number;
  tickValues: ReadonlyArray<number>;
  row: BulletGraphRow;
}

const verticalMultipleMetrics: ReadonlyArray<BulletMetricSpec> = [
  {
    label: 'Revenue',
    unit: 'U.S. $ (1,000s)',
    max: 300,
    tickValues: [0, 50, 100, 150, 200, 250, 300],
    row: { name: 'Revenue', actual: 257, target: 270, ranges: [150, 80, 70] },
  },
  {
    label: 'Profit',
    unit: '%',
    max: 30,
    tickValues: [0, 5, 10, 15, 20, 25, 30],
    row: { name: 'Profit', actual: 22.5, target: 26.5, ranges: [12, 13, 5] },
  },
  {
    label: 'Avg Order Size',
    unit: 'U.S. $',
    max: 600,
    tickValues: [0, 100, 200, 300, 400, 500, 600],
    row: { name: 'Avg Order Size', actual: 330, target: 550, ranges: [350, 160, 90] },
  },
  {
    label: 'New Customers',
    unit: 'Count',
    max: 2500,
    tickValues: [0, 500, 1000, 1500, 2000, 2500],
    row: { name: 'New Customers', actual: 1650, target: 2050, ranges: [1450, 650, 400] },
  },
  {
    label: 'Cust Satisfaction',
    unit: 'Top Rating of 5',
    max: 5,
    tickValues: [0, 1, 2, 3, 4, 5],
    row: { name: 'Cust Satisfaction', actual: 4.65, target: 4.45, ranges: [2.6, 1.5, 0.9] },
  },
];

const VerticalMultipleRow = ({ metric }: { metric: BulletMetricSpec }) => {
  const preparedData = prepareData([metric.row]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ textAlign: 'right', paddingRight: 10, fontFamily: sansSerifFont, lineHeight: 1.15 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{metric.label}</div>
        <div style={{ fontSize: 14 }}>{metric.unit}</div>
      </div>
      <div style={{ width: '100%', height: 62 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={preparedData}
            layout="vertical"
            barGap={-BAND_SIZE}
            barCategoryGap="0%"
            margin={{ top: 2, right: 6, left: 2, bottom: 20 }}
          >
            <XAxis
              type="number"
              domain={[0, metric.max]}
              ticks={[...metric.tickValues]}
              tickLine={false}
              axisLine={false}
              tick={{ fontFamily: sansSerifFont }}
            />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<BulletTooltipContent />} />

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
              fill={seriesColors.actual}
              barSize={BAND_SIZE}
              shape={<CenteredMeasureShape />}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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
  render: () => (
    <div style={{ backgroundColor: '#efefef', padding: 18, fontFamily: sansSerifFont }}>
      <div style={{ marginLeft: 160, marginBottom: 8, fontWeight: 700, fontSize: 36, lineHeight: 1 }}>2005 YTD</div>
      {verticalMultipleMetrics.map(metric => (
        <VerticalMultipleRow key={metric.label} metric={metric} />
      ))}
      <RechartsHookInspector />
    </div>
  ),
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
