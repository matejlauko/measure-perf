Measure Perf
==========

<br/>

<p align="center" style="font-size: 1.2rem;">Measure Perf is a small and simple library to measure execution of JavaScript code in browser</p>

<hr />


## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

with napm:
```
npm install --save measure-perf
```

or with yarn
```
yarn add measure-perf
```


## Usage

Module exports **4 functions**:

### start

> `function(name: string, log?: () => void): () => void`

Starts the measurement of **[name]**

First argument is a measurement name - should be unique for each measurement, second is an optional log function. If log function is supplied, it gets run along with starting the measurement.

It returns a finishing function: `function(): void`. You should use this end function instead of an imported one, if your code is asynchronous, to properly pair the measurements.
If you use a standalone `end()` function, it will end the **last** started measurement with the given name

### end

> `function(name: string, id?: number, log?: () => void): void`

Ends the measurement of **[name]**

First argument is a measurement name - the one you want to finish. Second argument is an id of the started measurmenet. If you are always ending the most last measurement, there's no need to supply the id. If not, there's no good way of getting the id right now. You should use the returned function from `start()`.

### exportMeasurementsOf

> `function(name: string)`

Returns all the measurements of **[name]** with computed statistic

#### Measurement Statistics:

```
{
  values:    Measurement[]         // measurements with added statistics
  mean:     number                // average of value durations
  min:      number                // minimal duration of values
  max:      number                // maximal duration of values
  pending:  number                // number of started, but not ended measurements
}
```

#### Measurement:

```
{
  start:              number      // starting time
  end:                number      // end time
  duration:           number      // difference between end and start times
  standardDeviation:  number      // standard deviation of duration
  fromPrev:           number      // difference to previous duration (positive means longer; negative means shorter)
}
```


### exportMeasurements

All the measurements grouped by **name**
