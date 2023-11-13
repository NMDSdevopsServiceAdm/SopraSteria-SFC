import { URLStructure } from '@core/model/url.model';

export abstract class BenchmarksServiceBase {
  abstract benchmarksData;
  abstract rankingsData;
  abstract returnTo;
  abstract setReturnTo(returnTo: URLStructure);
  abstract postBenchmarkTabUsage(establishmentId: number);
  abstract getTileData(establishmentId: string, tilesNeeded: string[]);
  abstract getRankingData(establishmentId: string, metric: string);
  abstract getAllRankingData(establishmentId);
}
