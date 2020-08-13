
export interface BenchmarksResponse {
  tiles:{
    pay: Tile,
    sickness: Tile,
    qualifications: Tile,
    turnover:Tile
  }
  meta:{
    workplace: number
    staff: number
  }
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
