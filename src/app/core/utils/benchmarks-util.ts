import { BenchmarkValue, Tile } from '@core/model/benchmarks.model';

export class BenchmarksUtil {
  static hasValue(tile: Tile, benchmarkValueCallback: (_: Tile) => BenchmarkValue): boolean {
    if (!tile) {
      return false;
    }

    return benchmarkValueCallback(tile)?.hasValue;
  }

  static value(tile: Tile, benchmarkValueCallback: (_: Tile) => BenchmarkValue): number {
    if (!this.hasValue(tile, benchmarkValueCallback)) {
      return null;
    }

    return benchmarkValueCallback(tile).value;
  }
}
