import React from 'react';
import { Pie, PieChart, ResponsiveContainer } from '../../../../src';
import { RechartsHookInspector } from '../../../storybook-addon-recharts';

const data = [
  { name: 'Large slice', value: 680, fill: '#0088FE' },
  { name: 'Medium slice', value: 140, fill: '#00C49F' },
  { name: 'Small allocation A', value: 32, fill: '#FFBB28' },
  { name: 'Small allocation B', value: 30, fill: '#FF8042' },
  { name: 'Small allocation C', value: 28, fill: '#9B5DE5' },
  { name: 'Small allocation D', value: 26, fill: '#00A896' },
  { name: 'Small allocation E', value: 24, fill: '#F15BB5' },
  { name: 'Small allocation F', value: 22, fill: '#A44A3F' },
  { name: 'Small allocation G', value: 20, fill: '#2B90D9' },
  { name: 'Small allocation H', value: 18, fill: '#74C69D' },
  { name: 'Small allocation I', value: 16, fill: '#FF6B6B' },
  { name: 'Small allocation J', value: 14, fill: '#F4A261' },
  { name: 'Small allocation K', value: 12, fill: '#6D597A' },
  { name: 'Small allocation L', value: 10, fill: '#43AA8B' },
  { name: 'Small allocation M', value: 9, fill: '#577590' },
  { name: 'Small allocation N', value: 8, fill: '#90BE6D' },
  { name: 'Small allocation O', value: 7, fill: '#4D908E' },
  { name: 'Small allocation P', value: 6, fill: '#F94144' },
  { name: 'Small allocation Q', value: 5, fill: '#277DA1' },
  { name: 'Small allocation R', value: 4, fill: '#A1C181' },
];

const renderIssueLabel = ({ value }: { value: number }) => {
  return `${value}`;
};

export default {
  component: Pie,
};

export const OverlappingLabelsIssue490 = {
  render: () => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <PieChart width={500} height={500}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={170}
            label={renderIssueLabel}
            isAnimationActive={false}
          />
          <RechartsHookInspector />
        </PieChart>
      </ResponsiveContainer>
    );
  },
};

export const OverlapAvoidanceEnabled = {
  render: () => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <PieChart width={500} height={500}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={170}
            label={renderIssueLabel}
            avoidLabelOverlap
            isAnimationActive={false}
          />
          <RechartsHookInspector />
        </PieChart>
      </ResponsiveContainer>
    );
  },
};

export const OverlapAvoidanceWithMinShowAngle = {
  render: () => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <PieChart width={500} height={500}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={170}
            label={renderIssueLabel}
            avoidLabelOverlap
            minShowLabelAngle={2}
            isAnimationActive={false}
          />
          <RechartsHookInspector />
        </PieChart>
      </ResponsiveContainer>
    );
  },
};
