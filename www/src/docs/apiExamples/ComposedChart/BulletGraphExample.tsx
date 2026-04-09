import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, RectangleProps } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';

interface BulletGraphRow {
  name: string;
  actual: number;
  target: number;
  ranges: [number, number, number];
}

interface PreparedBulletGraphRow {
  name: string;
  actual: number;
  target: number;
  poor: number;
  satisfactory: number;
  good: number;
}

const bulletGraphData: ReadonlyArray<BulletGraphRow> = [
  { name: 'Revenue', actual: 72, target: 85, ranges: [50, 30, 20] },
  { name: 'Profit', actual: 61, target: 70, ranges: [45, 30, 25] },
  { name: 'Retention', actual: 87, target: 90, ranges: [60, 25, 15] },
  { name: 'SLA', actual: 93, target: 97, ranges: [70, 20, 10] },
];

const data: ReadonlyArray<PreparedBulletGraphRow> = bulletGraphData.map(row => ({
  name: row.name,
  actual: row.actual,
  target: row.target,
  poor: row.ranges[0],
  satisfactory: row.ranges[1],
  good: row.ranges[2],
}));

const TargetMarker = (props: RectangleProps) => {
  const { x, y, width, height } = props;

  if (x == null || y == null || width == null || height == null) {
    return null;
  }

  const markerX = x + width;

  return <line x1={markerX} y1={y} x2={markerX} y2={y + height} stroke="#000000" strokeWidth={1.5} />;
};

const BulletGraphExample = ({ isAnimationActive = true }: { isAnimationActive?: boolean }) => (
  <ComposedChart
    style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
    responsive
    data={data}
    layout="vertical"
    barGap={0}
    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
  >
    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
    <XAxis type="number" domain={[0, 100]} />
    <YAxis type="category" dataKey="name" width={90} />
    <Tooltip />

    <Bar dataKey="poor" stackId="range" fill="#999999" barSize={30} isAnimationActive={isAnimationActive} />
    <Bar dataKey="satisfactory" stackId="range" fill="#bfbfbf" barSize={30} isAnimationActive={isAnimationActive} />
    <Bar dataKey="good" stackId="range" fill="#e6e6e6" barSize={30} isAnimationActive={isAnimationActive} />

    <Bar dataKey="target" fill="none" shape={<TargetMarker />} isAnimationActive={isAnimationActive} />
    <Bar dataKey="actual" fill="#000000" barSize={10} radius={1} isAnimationActive={isAnimationActive} />

    <RechartsDevtools />
  </ComposedChart>
);

export default BulletGraphExample;
