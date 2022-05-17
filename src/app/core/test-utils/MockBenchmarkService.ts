import { Injectable } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Observable, of } from 'rxjs';

const { build, fake } = require('@jackfranklin/test-data-bot');

const benchmarksResponseBuilder = build('BenchmarksResponse', {
  fields: {
    pay: {
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
    turnover: {
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
      currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
      maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
      hasValue: true,
      stateMessage: '',
    },
    turnover: {
      currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
      maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
      hasValue: true,
      stateMessage: '',
    },
    sickness: {
      currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
      maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
      hasValue: true,
      stateMessage: '',
    },
    qualifications: {
      currentRank: fake((f) => f.datatype.number({ min: 1, max: 100 })),
      maxRank: fake((f) => f.datatype.number({ min: 2, max: 100 })),
      hasValue: true,
      stateMessage: '',
    },
  },
});
const returnToBuilder = build('URLStructure', {
  fields: {
    url: ['/dashboard'],
    fragment: 'benchmarks',
  },
});

const returnTo = returnToBuilder();
const benchmarksData = benchmarksResponseBuilder();
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

  public postBenchmarkTabUsage(establishmentUid: string) {
    return of(null);
  }
}
