import { Injectable } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Observable, of } from 'rxjs';

const { build, fake } = require('@jackfranklin/test-data-bot');

const allRankingsResponseBuilder = build('AllRankingsResponse', {
  fields: {
    pay: {
      careWorkerPay: {
        groupRankings: {
          currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
          maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
          hasValue: true,
          stateMessage: '',
          allValues: [],
        },
      },
      seniorCareWorkerPay: {
        groupRankings: {
          currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
          maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
          hasValue: true,
          stateMessage: '',
          allValues: [],
        },
      },
      registeredNursePay: {
        groupRankings: {
          currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
          maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
          hasValue: true,
          stateMessage: '',
          allValues: [],
        },
      },
      registeredManagerPay: {
        groupRankings: {
          currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
          maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
          hasValue: true,
          stateMessage: '',
          allValues: [],
        },
      },
    },
    turnover: {
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
    vacancy: {
      groupRankings: {
        currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
        maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
        hasValue: true,
        stateMessage: '',
      },
    },
    timeInRole: {
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

export const benchmarksData = {
  sickness: {
    workplaceValue: { value: 11, hasValue: true },
    comparisonGroup: { value: 12, hasValue: true },
    goodCqc: { value: 15, hasValue: true },
  },
  qualifications: {
    workplaceValue: { value: 0.521, hasValue: true },
    comparisonGroup: { value: 0.533, hasValue: true },
    goodCqc: { value: 0.545, hasValue: true },
  },
  turnoverRate: {
    workplaceValue: { value: 0.281, hasValue: true },
    comparisonGroup: { value: 0.273, hasValue: true },
    goodCqc: { value: 0.2851, hasValue: true },
  },
  vacancyRate: {
    workplaceValue: { value: 0.068, hasValue: true },
    comparisonGroup: { value: 0.063, hasValue: true },
    goodCqc: { value: 0.051, hasValue: true },
  },
  careWorkerPay: {
    workplaceValue: { value: 1015, hasValue: true },
    comparisonGroup: { value: 1013, hasValue: true },
    goodCqc: { value: 1026, hasValue: true },
  },
  seniorCareWorkerPay: {
    workplaceValue: { value: 1091, hasValue: true },
    comparisonGroup: { value: 1091, hasValue: true },
    goodCqc: { value: 1093, hasValue: true },
  },
  registeredNursePay: {
    workplaceValue: { value: 37250, hasValue: true },
    comparisonGroup: { value: 37200, hasValue: true },
    goodCqc: { value: 37350, hasValue: true },
  },
  registeredManagerPay: {
    workplaceValue: { value: 36075, hasValue: true },
    comparisonGroup: { value: 36110, hasValue: true },
    goodCqc: { value: 36200, hasValue: true },
  },
  timeInRole: {
    workplaceValue: { value: 0.883, hasValue: true },
    comparisonGroup: { value: 0.887, hasValue: true },
    goodCqc: { value: 0.895, hasValue: true },
  },
  meta: {
    workplaces: 35,
    staff: 460,
    workplacesGoodCqc: 22,
    staffGoodCqc: 315,
    localAuthority: 'LA1',
    lastUpdated: new Date(),
  },
};

const returnTo = returnToBuilder();
const allRankingsData = allRankingsResponseBuilder();

@Injectable()
export class MockBenchmarksService extends BenchmarksService {
  public get returnTo(): URLStructure {
    return returnTo;
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

  public get benchmarksData(): BenchmarksResponse {
    return benchmarksData;
  }
}
