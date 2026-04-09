import React from 'react';
import { render } from '@testing-library/react';
import { BarChart, BoxPlot, XAxis, YAxis } from '../../src';

type BoxPlotDatum = {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

type OutlierDatum = {
  category: string;
  value: number;
};

const data: ReadonlyArray<BoxPlotDatum> = [
  { category: 'A', min: 16, q1: 20, median: 24, q3: 29, max: 35 },
  { category: 'B', min: 12, q1: 15, median: 18, q3: 21, max: 27 },
];

const outliers: ReadonlyArray<OutlierDatum> = [
  { category: 'A', value: 12 },
  { category: 'A', value: 38 },
  { category: 'B', value: 8 },
];

describe('<BoxPlot />', () => {
  it('renders box rectangles, median lines, and whiskers in horizontal layout', () => {
    const { container } = render(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot
          isAnimationActive={false}
          minDataKey="min"
          q1DataKey="q1"
          medianDataKey="median"
          q3DataKey="q3"
          maxDataKey="max"
        />
      </BarChart>,
    );

    expect(container.querySelectorAll('.recharts-bar-rectangle path.recharts-rectangle')).toHaveLength(data.length);
    expect(container.querySelectorAll('.recharts-errorBar')).toHaveLength(data.length);
    expect(container.querySelectorAll('.recharts-errorBar line')).toHaveLength(data.length * 3);

    const medianLines = container.querySelectorAll('.recharts-box-plot-median-line');
    expect(medianLines).toHaveLength(data.length);
    medianLines.forEach(line => {
      expect(line.getAttribute('x1')).not.toEqual(line.getAttribute('x2'));
      expect(line.getAttribute('y1')).toEqual(line.getAttribute('y2'));
    });
  });

  it('renders vertical median lines in vertical layout', () => {
    const { container } = render(
      <BarChart data={data} width={500} height={300} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="category" />
        <BoxPlot
          isAnimationActive={false}
          minDataKey="min"
          q1DataKey="q1"
          medianDataKey="median"
          q3DataKey="q3"
          maxDataKey="max"
        />
      </BarChart>,
    );

    const medianLines = container.querySelectorAll('.recharts-box-plot-median-line');
    expect(medianLines).toHaveLength(data.length);
    medianLines.forEach(line => {
      expect(line.getAttribute('x1')).toEqual(line.getAttribute('x2'));
      expect(line.getAttribute('y1')).not.toEqual(line.getAttribute('y2'));
    });
  });

  it('supports disabling whiskers', () => {
    const { container } = render(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot
          isAnimationActive={false}
          minDataKey="min"
          q1DataKey="q1"
          medianDataKey="median"
          q3DataKey="q3"
          maxDataKey="max"
          showWhiskers={false}
        />
      </BarChart>,
    );

    expect(container.querySelectorAll('.recharts-errorBar')).toHaveLength(0);
  });

  it('renders outlier points when outlierData and outlierDataKey are provided', () => {
    const { container } = render(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" allowDuplicatedCategory={false} />
        <YAxis />
        <BoxPlot
          isAnimationActive={false}
          minDataKey="min"
          q1DataKey="q1"
          medianDataKey="median"
          q3DataKey="q3"
          maxDataKey="max"
          outlierData={outliers}
          outlierDataKey="value"
          outlierScatterProps={{ fill: '#dc2626' }}
        />
      </BarChart>,
    );

    expect(container.querySelectorAll('.recharts-scatter-symbol')).toHaveLength(outliers.length);
  });

  it('does not render median line when medianDataKey is not provided', () => {
    const { container } = render(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot isAnimationActive={false} minDataKey="min" q1DataKey="q1" q3DataKey="q3" maxDataKey="max" />
      </BarChart>,
    );

    expect(container.querySelectorAll('.recharts-box-plot-median-line')).toHaveLength(0);
  });
});
