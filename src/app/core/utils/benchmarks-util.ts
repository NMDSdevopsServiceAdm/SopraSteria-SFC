import { BenchmarkValue, Tile } from '@core/model/benchmarks.model';

export class BenchmarksUtil {
  static hasValue(tile: Tile, benchmarkValueCallback: (_: Tile) => BenchmarkValue): boolean {
    if (tile) {
      const benchmarkValue = benchmarkValueCallback(tile);
      return benchmarkValue?.hasValue;
    }
    return false;
  }

  static value(tile: Tile, benchmarkValueCallback: (_: Tile) => BenchmarkValue): number {
    if (tile) {
      const benchmarkValue = benchmarkValueCallback(tile);
      if (benchmarkValue?.hasValue) {
        return benchmarkValue.value;
      }
    }
    return null;
  }
}
