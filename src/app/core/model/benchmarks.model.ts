import { JourneyType } from '@core/breadcrumb/breadcrumb.model';

export interface BenchmarksResponse {
  pay?: Tile;
  sickness?: Tile;
  qualifications?: Tile;
  turnover?: Tile;
  meta: Meta;
}
export interface Meta {
  workplaces: number;
  staff: number;
  lastUpdated?: Date;
}
export interface Tile {
  workplaceValue: BenchmarkValue;
  comparisonGroup: BenchmarkValue;
  goodCqc: BenchmarkValue;
  lowTurnover: BenchmarkValue;
  workplaces?: number;
  staff?: number;
}
export interface BenchmarkValue {
  value: number;
  stateMessage?: string;
  hasValue: boolean;
}

export interface RankingsResponse {
  currentRank: number;
  maxRank: number;
  hasValue: boolean;
  stateMessage: string;
}

export interface AllRankingsResponse {
  pay: RankingsResponse;
  qualifications: RankingsResponse;
  sickness: RankingsResponse;
  turnover: RankingsResponse;
}

export enum Metric {
  'pay',
  'turnover',
  'qualifications',
  'sickness',
}

export interface NoData {
  'no-workers'?: string;
  'no-perm-or-temp'?: string;
  'incorrect-turnover'?: string;
  'mismatch-workers'?: string;
  'no-leavers'?: string;
  'no-pay-data'?: string;
  'no-sickness-data'?: string;
  'no-qualifications-data'?: string;
}

export class MetricsContent {
  title: string;
  description: string;
  tileDescription: string;
  noData: NoData;
  type: Metric;
  journey: {
    dashboard: JourneyType;
    workplace: JourneyType;
  };

  static get Pay(): MetricsContent {
    return {
      title: 'Pay',
      description: 'Average hourly pay for a care worker.',
      tileDescription: 'Average hourly pay for a care worker.',
      noData: {
        'no-pay-data': "You've not added any data about hourly pay yet.",
      },
      type: Metric.pay,
      journey: {
        dashboard: JourneyType.BENCHMARKS_PAY,
        workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_PAY,
      },
    };
  }

  static get Turnover(): MetricsContent {
    return {
      title: 'Turnover',
      description: 'Staff (on permanent and temporary contracts) who left in the last 12 months.',
      tileDescription: 'Staff (permanent and temps) left in the last 12 months.',
      noData: {
        'mismatch-workers': 'For this to show, there must be a staff record for every staff member.',
        'no-leavers': "You've not added any data about leavers yet.",
        'incorrect-turnover': 'Your turnover seems to be over 999%, <a href="/contact-us">please contact us.</a>',
        'no-perm-or-temp': 'You need records for permanent or temporary staff to see turnover.',
      },
      type: Metric.turnover,
      journey: {
        dashboard: JourneyType.BENCHMARKS_TURNOVER,
        workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_TURNOVER,
      },
    };
  }

  static get Sickness(): MetricsContent {
    return {
      title: 'Sickness',
      description: 'Average days each worker was off in the last 12 months.',
      tileDescription: 'Average days each worker was off in the last 12 months.',
      noData: {
        'no-sickness-data': "You've not added any data about sickness yet.",
      },
      type: Metric.sickness,
      journey: {
        dashboard: JourneyType.BENCHMARKS_SICKNESS,
        workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_SICKNESS,
      },
    };
  }

  static get Qualifications(): MetricsContent {
    return {
      title: 'Qualifications',
      description: 'Care-providing staff with a relevant level 2 or above.',
      tileDescription: 'Care-providing staff with a relevant level 2 or above.',
      noData: {
        'no-qualifications-data': "You've not added any data about social care qualifications yet.",
      },
      type: Metric.qualifications,
      journey: {
        dashboard: JourneyType.BENCHMARKS_QUALIFICATIONS,
        workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_QUALIFICATIONS,
      },
    };
  }
}
