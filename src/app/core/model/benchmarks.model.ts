
export interface BenchmarksResponse {
  tiles:{
    pay: Tile,
    sickness: Tile,
    qualifications: Tile
  }
  meta:{}
}
export interface Tile {
  workplaceValue: BenchmarkValue,
  comparisonGroup: BenchmarkValue
}
export interface BenchmarkValue {
  value: number;
  stateMessage?: string;
  hasValue: boolean;
}
