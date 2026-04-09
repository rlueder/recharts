import React from 'react';
import { Args } from '@storybook/react-vite';
import {
  BoxPlot as RechartsBoxPlot,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from '../../../../src';
import { BoxPlot as BoxPlotDatum } from '../../data/DataProps';
import { boxPlots } from '../../data';
import { RechartsHookInspector } from '../../../storybook-addon-recharts';

type OutlierDatum = {
  name: string;
  value: number;
};

type MeanDatum = {
  name: string;
  value: number;
};

const outliers: ReadonlyArray<OutlierDatum> = boxPlots.flatMap(entry =>
  (entry.outliers ?? []).map(value => ({
    name: entry.name,
    value,
  })),
);

const means: ReadonlyArray<MeanDatum> = boxPlots
  .filter(entry => entry.average != null)
  .map(entry => ({ name: entry.name, value: entry.average as number }));

const numericValues: ReadonlyArray<number> = [
  ...boxPlots.flatMap(entry => [entry.min, entry.lowerQuartile, entry.median, entry.upperQuartile, entry.max]),
  ...outliers.map(entry => entry.value),
  ...means.map(entry => entry.value),
];

const axisMax = Math.ceil(Math.max(...numericValues) / 10) * 10;
const numericAxisTicks = Array.from({ length: axisMax / 10 + 1 }, (_, index) => index * 10);

const sansTextStyles = {
  fontFamily: 'sans-serif',
  fontSize: 12,
} as const;

const legendFormatter = (value: string) => <span style={{ fontFamily: 'sans-serif' }}>{value}</span>;

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
  lineHeight: 1.5,
  ...sansTextStyles,
} as const;

const axisTickStyle = {
  fontFamily: 'sans-serif',
  fontSize: 12,
} as const;

const axisLabelStyle = {
  fontFamily: 'sans-serif',
  fontSize: 12,
} as const;

const TooltipContent = ({ active, payload }: TooltipContentProps) => {
  if (!active || payload == null || payload.length === 0) {
    return null;
  }

  const entry = payload[0]?.payload as BoxPlotDatum | undefined;
  if (entry == null) {
    return null;
  }

  const orderedStats = [
    { label: 'Minimum', value: entry.min },
    { label: 'Q1', value: entry.lowerQuartile },
    { label: 'Median', value: entry.median },
    { label: 'Mean', value: entry.average },
    { label: 'Q3', value: entry.upperQuartile },
    { label: 'Maximum', value: entry.max },
  ]
    .filter(stat => stat.value != null)
    .sort((a, b) => (a.value as number) - (b.value as number));

  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 600 }}>{entry.name}</p>
      <p style={{ margin: 0, fontWeight: 600, marginTop: 4 }}>Ordered values</p>
      {orderedStats.map(stat => (
        <p
          key={stat.label}
          style={{
            margin: 0,
            fontWeight: stat.label === 'Mean' ? 600 : 400,
            color: stat.label === 'Mean' ? '#0f766e' : undefined,
          }}
        >
          {`${stat.label}: ${stat.value} min`}
        </p>
      ))}
      <p style={{ margin: 0 }}>
        {`Outliers: ${entry.outliers == null || entry.outliers.length === 0 ? 'None' : entry.outliers.join(', ')}`}
      </p>
    </div>
  );
};

export default {
  component: RechartsBoxPlot,
};

function BaseBoxPlotChart({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' }) {
  return (
    <ResponsiveContainer minHeight={520}>
      <ComposedChart data={boxPlots} layout={layout} margin={{ top: 24, right: 16, bottom: 24, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={layout !== 'vertical'} vertical={layout === 'vertical'} />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey="name" allowDuplicatedCategory={false} tick={axisTickStyle} />
            <YAxis
              domain={[0, axisMax]}
              ticks={numericAxisTicks}
              tick={axisTickStyle}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: axisLabelStyle }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              domain={[0, axisMax]}
              ticks={numericAxisTicks}
              tick={axisTickStyle}
              label={{ value: 'Minutes', position: 'insideBottom', style: axisLabelStyle }}
            />
            <YAxis type="category" dataKey="name" width={110} allowDuplicatedCategory={false} tick={axisTickStyle} />
          </>
        )}
        <RechartsBoxPlot
          name="Distribution"
          barSize={22}
          fill="#a9baf5"
          stroke="none"
          minDataKey="min"
          q1DataKey="lowerQuartile"
          medianDataKey="median"
          q3DataKey="upperQuartile"
          maxDataKey="max"
          whiskerStroke="#334155"
          medianStroke="#0f172a"
          medianStrokeWidth={1}
          whiskerWidth={6}
          outlierData={outliers}
          outlierDataKey="value"
          outlierScatterProps={{ name: 'Outliers', fill: '#dc2626', legendType: 'circle' }}
          isAnimationActive={false}
        />
        <Scatter name="Mean" data={means} dataKey="value" fill="#0f766e" shape="square" legendType="square" />
        <Tooltip content={<TooltipContent />} />
        <Legend wrapperStyle={sansTextStyles} formatter={legendFormatter} />
        <RechartsHookInspector />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export const VerticalBoxPlot = {
  render: (_args: Args) => <BaseBoxPlotChart layout="horizontal" />,
};

export const HorizontalBoxPlot = {
  render: (_args: Args) => <BaseBoxPlotChart layout="vertical" />,
};
