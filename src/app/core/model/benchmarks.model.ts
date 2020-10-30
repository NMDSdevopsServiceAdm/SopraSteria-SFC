export interface BenchmarksResponse {
  tiles: {
    pay?: Tile;
    sickness?: Tile;
    qualifications?: Tile;
    turnover?: Tile;
  };
  meta: Meta;
}
export interface Meta {
  workplaces: number;
  staff: number;
}
export interface Tile {
  workplaceValue: BenchmarkValue;
  comparisonGroup: BenchmarkValue;
}
export interface BenchmarkValue {
  value: number;
  stateMessage?: string;
  hasValue: boolean;
}

export enum Metric {
  'pay',
  'turnover',
  'qualification',
  'sickness',
}
