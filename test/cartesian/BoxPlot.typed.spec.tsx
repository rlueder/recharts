import React from 'react';
import { describe, it } from 'vitest';
import { BarChart, BoxPlot, XAxis, YAxis } from '../../src';
import { rechartsTestRender } from '../helper/createSelectorTestCase';

type ExampleDataPoint = {
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

const data: ReadonlyArray<ExampleDataPoint> = [
  { category: 'A', min: 16, q1: 20, median: 24, q3: 29, max: 35 },
  { category: 'B', min: 12, q1: 15, median: 18, q3: 21, max: 27 },
];

const outliers: ReadonlyArray<OutlierDatum> = [
  { category: 'A', value: 12 },
  { category: 'B', value: 8 },
];

describe('BoxPlot with strong typing', () => {
  it('should allow valid data keys with implicit types', () => {
    rechartsTestRender(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot minDataKey="min" q1DataKey="q1" medianDataKey="median" q3DataKey="q3" maxDataKey="max" />
      </BarChart>,
    );
  });

  it('should allow valid data keys with explicit types', () => {
    rechartsTestRender(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot<ExampleDataPoint>
          minDataKey="min"
          q1DataKey="q1"
          medianDataKey="median"
          q3DataKey="q3"
          maxDataKey="max"
        />
      </BarChart>,
    );
  });

  it('should show type error for invalid explicit key', () => {
    rechartsTestRender(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        {/* @ts-expect-error TypeScript is correct here - key does not exist on ExampleDataPoint */}
        <BoxPlot<ExampleDataPoint> minDataKey="minimum" q1DataKey="q1" q3DataKey="q3" maxDataKey="max" />
      </BarChart>,
    );
  });

  it('should allow typed outlier scatter data', () => {
    rechartsTestRender(
      <BarChart data={data} width={500} height={300}>
        <XAxis dataKey="category" />
        <YAxis />
        <BoxPlot<ExampleDataPoint>
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
  });
});
