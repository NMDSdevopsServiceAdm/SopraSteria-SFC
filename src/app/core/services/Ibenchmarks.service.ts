export abstract class IBenchmarksService {
  abstract benchmarksData;
  abstract postBenchmarkTabUsage(establishmentId: number);
  abstract getTileData(establishmentId: string, tilesNeeded: string[]);
  abstract getRankingData(establishmentId: string, metric: string);
  abstract getAllRankingData(establishmentId);
}
