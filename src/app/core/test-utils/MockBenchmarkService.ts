import { Injectable } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import dayjs from 'dayjs';
import { Observable, of } from 'rxjs';

const { build, fake } = require('@jackfranklin/test-data-bot');

const benchmarksResponseBuilder = build('BenchmarksResponse', {
  fields: {
    careWorkerPay: {
      workplaceValue: {
        value: 0,
        hasValue: false,
      },
      comparisonGroup: {
        value: 0,
        hasValue: false,
      },
    },
    sickness: {
      workplaceValue: {
        value: 0,
        hasValue: false,
      },
      comparisonGroup: {
        value: 0,
        hasValue: false,
      },
    },
    qualifications: {
      workplaceValue: {
        value: 0,
        hasValue: false,
      },
      comparisonGroup: {
        value: 0,
        hasValue: false,
      },
    },
    turnoverRate: {
      workplaceValue: {
        value: 0,
        hasValue: false,
      },
      comparisonGroup: {
        value: 0,
        hasValue: false,
      },
    },
    meta: {
      staff: 10000,
      workplace: 5,
    },
  },
});
const allRankingsResponseBuilder = build('AllRankingsResponse', {
  fields: {
    pay: {
      careWorkerPay: {
        groupRankings: {
          currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
          maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
          hasValue: true,
          stateMessage: '',
        },
      },
    },
    turnoverRate: {
      groupRankings: {
        currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
        maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
        hasValue: true,
        stateMessage: '',
      },
    },
    sickness: {
      groupRankings: {
        currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
        maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
        hasValue: true,
        stateMessage: '',
      },
    },
    qualifications: {
      groupRankings: {
        currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
        maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
        hasValue: true,
        stateMessage: '',
      },
    },
  },
});
const returnToBuilder = build('URLStructure', {
  fields: {
    url: ['/dashboard'],
    fragment: 'benchmarks',
  },
});

const newDataAreaResponse = build('BenchmarksResponse', {
  fields: {
    meta: {
      workplaces: 266,
      staff: 10724,
      workplacesGoodCqc: 180,
      staffGoodCqc: 7939,
      lastUpdated: dayjs().toISOString(),
      localAuthority: 'Hertfordshire',
    },
    careWorkerPay: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-pay-data',
      },
      comparisonGroup: {
        value: 1086,
        hasValue: true,
      },
      goodCqc: {
        value: 1080,
        hasValue: true,
      },
    },
    seniorCareWorkerPay: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-pay-data',
      },
      comparisonGroup: {
        value: 1150,
        hasValue: true,
      },
      goodCqc: {
        value: 1139,
        hasValue: true,
      },
    },
    registeredNursePay: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-pay-data',
      },
      comparisonGroup: {
        value: 38300,
        hasValue: true,
      },
      goodCqc: {
        value: 38900,
        hasValue: true,
      },
    },
    registeredManagerPay: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-pay-data',
      },
      comparisonGroup: {
        value: 36600,
        hasValue: true,
      },
      goodCqc: {
        value: 36400,
        hasValue: true,
      },
    },
    vacancyRate: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'mismatch-workers',
      },
      comparisonGroup: {
        value: 0.08,
        hasValue: true,
      },
      goodCqc: {
        value: 0.07,
        hasValue: true,
      },
    },
    turnoverRate: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'mismatch-workers',
      },
      comparisonGroup: {
        value: 0.32,
        hasValue: true,
      },
      goodCqc: {
        value: 0.31,
        hasValue: true,
      },
    },
    qualifications: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-qualifications-data',
      },
      comparisonGroup: {
        value: 0.456386802,
        hasValue: true,
      },
      goodCqc: {
        value: 0.474539069,
        hasValue: true,
      },
    },
    sickness: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-sickness-data',
      },
      comparisonGroup: {
        value: 8,
        hasValue: true,
      },
      goodCqc: {
        value: 8,
        hasValue: true,
      },
    },
    timeInRole: {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-perm-or-temp',
      },
      comparisonGroup: {
        value: 0.9004484305,
        hasValue: true,
      },
      goodCqc: {
        value: 0.9001441489,
        hasValue: true,
      },
    },
  },
});

const returnTo = returnToBuilder();
const benchmarksData = newDataAreaResponse();
const allRankingsData = allRankingsResponseBuilder();
const benchmarkResponse = allRankingsResponseBuilder();

@Injectable()
export class MockBenchmarksService extends BenchmarksService {
  public get returnTo(): URLStructure {
    return returnTo;
  }

  public get benchmarksData(): BenchmarksResponse {
    return benchmarksData;
  }

  public getTileData(establishmentUid, requiredTiles): Observable<BenchmarksResponse> {
    return of(benchmarksData);
  }

  public getAllRankingData(establishmentUid): Observable<AllRankingsResponse> {
    return of(allRankingsData);
  }

  public postBenchmarkTabUsage(establishmentUid: number) {
    return of(null);
  }
}
