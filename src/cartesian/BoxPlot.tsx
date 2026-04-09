import * as React from 'react';
import { ReactElement, ReactNode, SVGProps, useCallback } from 'react';
import { Bar, BarShapeProps, Props as BarProps } from './Bar';
import { ErrorBar, Props as ErrorBarProps } from './ErrorBar';
import { Scatter, Props as ScatterProps } from './Scatter';
import { Rectangle } from '../shape/Rectangle';
import { useChartLayout } from '../context/chartLayoutContext';
import { getValueByDataKey } from '../util/ChartUtils';
import { DataKey } from '../util/types';

type NumericDataKey<TDataPoint> = DataKey<TDataPoint, number>;
type BoxRange = [number, number];
type WhiskerRange = [number | undefined, number | undefined];

function getNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  return value;
}

function DefaultBoxPlotShape<TDataPoint>({
  props,
  boxDataKey,
  q1DataKey,
  q3DataKey,
  medianDataKey,
  medianStroke,
  medianStrokeWidth,
  layout,
}: {
  props: BarShapeProps;
  boxDataKey: DataKey<TDataPoint, BoxRange> | undefined;
  q1DataKey: NumericDataKey<TDataPoint>;
  q3DataKey: NumericDataKey<TDataPoint>;
  medianDataKey: NumericDataKey<TDataPoint> | undefined;
  medianStroke: SVGProps<SVGLineElement>['stroke'];
  medianStrokeWidth: SVGProps<SVGLineElement>['strokeWidth'];
  layout: 'horizontal' | 'vertical';
}) {
  const { x, y, width, height, payload } = props;

  if (medianDataKey == null || payload == null) {
    return <Rectangle {...props} />;
  }

  let q1: number | undefined, q3: number | undefined;

  if (boxDataKey != null) {
    const boxRange = getValueByDataKey(payload, boxDataKey);
    if (Array.isArray(boxRange)) {
      const [q1Value, q3Value] = boxRange;
      q1 = getNumberOrUndefined(q1Value);
      q3 = getNumberOrUndefined(q3Value);
    }
  } else {
    q1 = getNumberOrUndefined(getValueByDataKey(payload, q1DataKey));
    q3 = getNumberOrUndefined(getValueByDataKey(payload, q3DataKey));
  }
  const median = getNumberOrUndefined(getValueByDataKey(payload, medianDataKey));

  if (x == null || y == null || width == null || height == null || q1 == null || q3 == null || median == null) {
    return <Rectangle {...props} />;
  }

  const quartileRange = q3 - q1;

  if (layout === 'vertical') {
    const medianX = quartileRange === 0 ? x + width / 2 : x + ((median - q1) / quartileRange) * width;

    return (
      <g>
        <Rectangle {...props} />
        <line
          className="recharts-box-plot-median-line"
          x1={medianX}
          x2={medianX}
          y1={y}
          y2={y + height}
          stroke={medianStroke}
          strokeWidth={medianStrokeWidth}
        />
      </g>
    );
  }

  const medianY = quartileRange === 0 ? y + height / 2 : y + ((q3 - median) / quartileRange) * height;

  return (
    <g>
      <Rectangle {...props} />
      <line
        className="recharts-box-plot-median-line"
        x1={x}
        x2={x + width}
        y1={medianY}
        y2={medianY}
        stroke={medianStroke}
        strokeWidth={medianStrokeWidth}
      />
    </g>
  );
}

export interface BoxPlotProps<DataPointType = any> extends Omit<
  BarProps<DataPointType, BoxRange>,
  'dataKey' | 'shape'
> {
  minDataKey: NumericDataKey<DataPointType>;
  q1DataKey: NumericDataKey<DataPointType>;
  q3DataKey: NumericDataKey<DataPointType>;
  maxDataKey: NumericDataKey<DataPointType>;
  medianDataKey?: NumericDataKey<DataPointType>;
  boxDataKey?: DataKey<DataPointType, BoxRange>;
  whiskerDataKey?: DataKey<DataPointType, WhiskerRange>;
  boxShape?: BarProps<DataPointType, BoxRange>['shape'];
  showWhiskers?: boolean;
  whiskerWidth?: ErrorBarProps<DataPointType, WhiskerRange>['width'];
  whiskerDirection?: ErrorBarProps<DataPointType, WhiskerRange>['direction'];
  whiskerStroke?: ErrorBarProps<DataPointType, WhiskerRange>['stroke'];
  whiskerStrokeWidth?: ErrorBarProps<DataPointType, WhiskerRange>['strokeWidth'];
  whiskerZIndex?: ErrorBarProps<DataPointType, WhiskerRange>['zIndex'];
  medianStroke?: SVGProps<SVGLineElement>['stroke'];
  medianStrokeWidth?: SVGProps<SVGLineElement>['strokeWidth'];
  /**
   * Optional outlier points to render alongside box plots.
   * Useful for mixed boxplot+scatter charts where outliers should remain first-class.
   */
  outlierData?: ReadonlyArray<unknown>;
  /**
   * Data key for outlier values (for example `"value"`).
   */
  outlierDataKey?: DataKey<any, number>;
  /**
   * Additional Scatter props used to render outlier points.
   * `data` and `dataKey` are controlled by `outlierData` and `outlierDataKey`.
   */
  outlierScatterProps?: Omit<ScatterProps<any, number>, 'data' | 'dataKey'>;
  children?: ReactNode;
}

export function BoxPlot<DataPointType = any>({
  minDataKey,
  q1DataKey,
  medianDataKey,
  q3DataKey,
  maxDataKey,
  boxDataKey,
  whiskerDataKey,
  boxShape,
  showWhiskers = true,
  whiskerWidth = 5,
  whiskerDirection,
  whiskerStroke = 'black',
  whiskerStrokeWidth = 1.5,
  whiskerZIndex,
  medianStroke = '#1f2937',
  medianStrokeWidth = 2,
  outlierData,
  outlierDataKey,
  outlierScatterProps,
  children,
  ...barProps
}: BoxPlotProps<DataPointType>): ReactElement {
  const chartLayout = useChartLayout();
  const layout = chartLayout === 'vertical' ? 'vertical' : 'horizontal';

  const computedBoxDataKey = useCallback(
    (entry: DataPointType): BoxRange => {
      if (boxDataKey != null) {
        const range = getValueByDataKey(entry, boxDataKey);
        if (Array.isArray(range)) {
          const [q1Value, q3Value] = range;
          return [Number(q1Value) || 0, Number(q3Value) || 0];
        }
        return [0, 0];
      }

      const q1 = getNumberOrUndefined(getValueByDataKey(entry, q1DataKey)) ?? 0;
      const q3 = getNumberOrUndefined(getValueByDataKey(entry, q3DataKey)) ?? 0;

      return [q1, q3];
    },
    [boxDataKey, q1DataKey, q3DataKey],
  );

  const computedWhiskerDataKey = useCallback(
    (entry: DataPointType): WhiskerRange => {
      if (whiskerDataKey != null) {
        const whiskers = getValueByDataKey(entry, whiskerDataKey);
        if (Array.isArray(whiskers)) {
          const [lower, upper] = whiskers;
          return [getNumberOrUndefined(lower), getNumberOrUndefined(upper)];
        }
        return [undefined, undefined];
      }

      const boxRange = computedBoxDataKey(entry);
      const upperQuartile = boxRange?.[1];
      const min = getNumberOrUndefined(getValueByDataKey(entry, minDataKey));
      const max = getNumberOrUndefined(getValueByDataKey(entry, maxDataKey));

      if (upperQuartile == null || min == null || max == null) {
        return [undefined, undefined];
      }

      return [upperQuartile - min, max - upperQuartile];
    },
    [computedBoxDataKey, maxDataKey, minDataKey, whiskerDataKey],
  );

  const computedDefaultShape = useCallback(
    (shapeProps: BarShapeProps) => {
      return (
        <DefaultBoxPlotShape
          props={shapeProps}
          boxDataKey={boxDataKey}
          q1DataKey={q1DataKey}
          q3DataKey={q3DataKey}
          medianDataKey={medianDataKey}
          medianStroke={medianStroke}
          medianStrokeWidth={medianStrokeWidth}
          layout={layout}
        />
      );
    },
    [boxDataKey, layout, medianDataKey, medianStroke, medianStrokeWidth, q1DataKey, q3DataKey],
  );

  const outlierScatter =
    outlierData != null && outlierDataKey != null ? (
      <Scatter<any, number> data={outlierData} dataKey={outlierDataKey} {...outlierScatterProps} />
    ) : null;

  return (
    <>
      <Bar<DataPointType, BoxRange> {...barProps} dataKey={computedBoxDataKey} shape={boxShape ?? computedDefaultShape}>
        {showWhiskers ? (
          <ErrorBar<DataPointType, WhiskerRange>
            dataKey={computedWhiskerDataKey}
            width={whiskerWidth}
            direction={whiskerDirection}
            stroke={whiskerStroke}
            strokeWidth={whiskerStrokeWidth}
            zIndex={whiskerZIndex}
          />
        ) : null}
        {children}
      </Bar>
      {outlierScatter}
    </>
  );
}

BoxPlot.displayName = 'BoxPlot';
