import { ChartExample } from '../../exampleComponents/types.ts';
import BulletGraphExample from './BulletGraphExample.tsx';
import BulletGraphExampleSource from './BulletGraphExample.tsx?raw';
import ComposedChartExample from './ComposedChartExample.tsx';
import ComposedChartExampleSource from './ComposedChartExample.tsx?raw';

export const composedChartApiExamples: ReadonlyArray<ChartExample> = [
  {
    Component: ComposedChartExample,
    sourceCode: ComposedChartExampleSource,
    name: 'Composed Chart Example',
  },
  {
    Component: BulletGraphExample,
    sourceCode: BulletGraphExampleSource,
    name: 'Bullet Graph Example',
  },
];
