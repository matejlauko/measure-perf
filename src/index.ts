const measurements = {} as any;

export interface Measurement {
  id: number;
  start: number;
  end?: number;
}
export type EndedMeasurement = Measurement & { end: number };
export type MeasurementValues = Measurement[];
export type EndedMeasurementValues = EndedMeasurement[];
export interface ExportedMeasurement extends Measurement {
  duration?: number;
  standardDeviation?: number;
  fromPrev?: number;
}
export type ExportedMeasurementValues = ExportedMeasurement[];
export interface ExportedEndedMeasurement extends EndedMeasurement {
  duration: number;
  standardDeviation: number;
  fromPrev: number;
}
export type ExportedEndedMeasurementValues = ExportedEndedMeasurement[];
export interface ExportedMeasurements {
  values: ExportedMeasurementValues;
  mean: number;
  min: number;
  max: number;
  pending: number;
}
const now: () => number =
  window.performance && window.performance.now
    ? window.performance.now.bind(window.performance)
    : Date.now.bind(Date);

const getLast = (name: string): Measurement => {
  return measurements[name] && measurements[name][measurements[name].length - 1];
};

export const end = production
  ? (): void => undefined
  : (name: string, id?: number, log?: () => undefined): void => {
      const started: Measurement = id
        ? measurements[name].find((val: Measurement) => val.id === id)
        : getLast(name);

      if (started && started.end === undefined) {
        started.end = now();
      }

      if (log) {
        log();
      }
    };

const addMeasurement = (name: string): Measurement => {
  const last = getLast(name);

  const newMeasurement: Measurement = { id: last.id + 1, start: now() };
  measurements[name] = measurements[name].concat(newMeasurement);
  return newMeasurement;
};

export const start = production
  ? (): (() => void) => (): void => {}
  : (name: string, log?: () => void): (() => void) => {
      let added: Measurement;

      if (measurements.hasOwnProperty(name)) {
        added = addMeasurement(name);
      } else {
        added = {
          id: 1,
          start: now(),
        };
        measurements[name] = [added];
      }

      if (log) {
        log();
      }

      return () => end(name, added.id);
    };

const getEndedMeasurements = (values: MeasurementValues): EndedMeasurementValues =>
  values.filter(m => m.end) as EndedMeasurementValues;

const enhanceValues = (
  values: MeasurementValues & Array<{ end: number }>,
  mean: number
): ExportedEndedMeasurementValues =>
  values.map((val: Measurement & { end: number }, i: number) => {
    const duration = val.end - val.start;
    return {
      ...val,
      standardDeviation: Math.abs(mean - duration),
      duration,
      fromPrev: values[i - 1] ? duration - (values[i - 1].end - values[i - 1].start) : 0,
    };
  });

const getMean = (values: EndedMeasurementValues): number =>
  values.reduce((acc, { start, end }) => acc + (end - start), 0) / values.length;

export const exportMeasurementsOf = (name: string): ExportedMeasurements | null => {
  if (!measurements.hasOwnProperty(name)) return null;
  const thisMeasurements = measurements[name] || [];
  const endedMeasurements = getEndedMeasurements(thisMeasurements);
  const mean = getMean(endedMeasurements);
  const enhancedValues = enhanceValues(endedMeasurements, mean);

  return {
    values: enhancedValues,
    mean,
    min: enhancedValues.reduce(
      (res, { duration }) => Math.min(res, duration),
      Number.POSITIVE_INFINITY
    ),
    max: enhancedValues.reduce((res, { duration }) => Math.max(res, duration), 0),
    pending: thisMeasurements.length - endedMeasurements.length,
  };
};

export const exportMeasurements = () =>
  Object.keys(measurements).reduce(
    (res, name) => ({ ...res, [name]: exportMeasurementsOf(name) }),
    {}
  );
