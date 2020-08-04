
export interface BenchmarksResponse {
  tiles:{
    pay: PayTile
  }
  meta:{}
}
export interface PayTile {
  workplaceValue: {
    value: number;
    stateMessage?: string;
  },
  comparisonGroup: ComparisonGroup
}
export interface ComparisonGroup {
  value: number;
  stateMessage?: string;
}

export interface Benchmarks {
  tiles:{
    pay:TileData;
  }
}

export interface TileData {
  showYourWorkplace: boolean;
  showComparisonGroup: boolean;
  value: number;
  stateMessage?: string;
}
