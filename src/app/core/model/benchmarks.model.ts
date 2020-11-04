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
  goodCqc: BenchmarkValue;
  lowTurnover: BenchmarkValue;
}
export interface BenchmarkValue {
  value: number;
  stateMessage?: string;
  hasValue: boolean;
}

export enum Metric {
  'pay',
  'turnover',
  'qualifications',
  'sickness',
}

export interface NoData {
  'no-workers'?: string;
  'no-data'?: string;
  'no-permTemp'?: string;
  'check-data'?: string;
}

export class MetricsContent {
  title: string;
  description: string;
  noData: NoData;
  type: Metric;

  static get Pay(): MetricsContent {
    return {
      title: 'Pay',
      description: 'Average hourly pay for a care worker.',
      noData: {
        'no-workers': "You've not added any data about hourly pay yet.",
      },
      type: Metric.pay,
    };
  }

  static get Turnover(): MetricsContent {
    return {
      title: 'Turnover',
      description: 'Staff (permanent and temps) left in the last 12 months.',
      noData: {
        'no-workers': 'For this to show, there must be a staff record for every staff member.',
        'no-data': "You've not added any data about leavers yet.",
        'check-data': 'Your turnover seems to be over 999%, please contact us.',
        'no-permTemp': 'You need records for permanent or temporary staff to see turnover.',
      },
      type: Metric.turnover,
    };
  }

  static get Sickness(): MetricsContent {
    return {
      title: 'Sickness',
      description: 'Average days each worker was off in the last 12 months.',
      noData: {
        'no-workers': "You've not added any data about sickness yet.",
      },
      type: Metric.sickness,
    };
  }

  static get Qualifications(): MetricsContent {
    return {
      title: 'Qualifications',
      description: 'Care-providing staff with a relevant level 2 or above.',
      noData: {
        'no-workers': "You've not added any data about social care qualifications yet.",
      },
      type: Metric.qualifications,
    };
  }
}
