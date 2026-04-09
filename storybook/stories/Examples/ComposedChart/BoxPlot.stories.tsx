import React from 'react';
import { Args } from '@storybook/react-vite';
import {
  BoxPlot as RechartsBoxPlot,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
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

const outliers: ReadonlyArray<OutlierDatum> = boxPlots.flatMap(entry =>
  (entry.outliers ?? []).map(value => ({
    name: entry.name,
    value,
  })),
);

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

  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 600 }}>{entry.name}</p>
      <p style={{ margin: 0 }}>{`Minimum: ${entry.min} min`}</p>
      <p style={{ margin: 0 }}>{`Q1: ${entry.lowerQuartile} min`}</p>
      <p style={{ margin: 0 }}>{`Median: ${entry.median} min`}</p>
      <p style={{ margin: 0 }}>{`Q3: ${entry.upperQuartile} min`}</p>
      <p style={{ margin: 0 }}>{`Maximum: ${entry.max} min`}</p>
      <p style={{ margin: 0 }}>{`Mean: ${entry.average ?? 'N/A'} min`}</p>
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
        <CartesianGrid strokeDasharray="3 3" />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey="name" allowDuplicatedCategory={false} tick={axisTickStyle} />
            <YAxis
              tick={axisTickStyle}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: axisLabelStyle }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={axisTickStyle}
              label={{ value: 'Minutes', position: 'insideBottom', style: axisLabelStyle }}
            />
            <YAxis type="category" dataKey="name" width={110} allowDuplicatedCategory={false} tick={axisTickStyle} />
          </>
        )}
        <RechartsBoxPlot
          name="Distribution"
          fill="#7c90db"
          stroke="#334155"
          minDataKey="min"
          q1DataKey="lowerQuartile"
          medianDataKey="median"
          q3DataKey="upperQuartile"
          maxDataKey="max"
          whiskerStroke="#334155"
          medianStroke="#0f172a"
          whiskerWidth={6}
          outlierData={outliers}
          outlierDataKey="value"
          outlierScatterProps={{ name: 'Outliers', fill: '#dc2626' }}
          isAnimationActive={false}
        />
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
