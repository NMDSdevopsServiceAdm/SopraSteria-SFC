import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

const { build } = require('@jackfranklin/test-data-bot');

const benchmarksResponseBuilder = build('BenchmarksResponse', {
  fields: {
    tiles: {
      pay: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      sickness: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      qualifications: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      turnover: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      }
    },
    meta: {
      staff: 10000,
      workplace: 5
    }
  }
});


const benchmarksData = benchmarksResponseBuilder();

@Injectable()
export class MockBenchmarksService extends BenchmarksService {

  public getAllTiles(establishmentUid): Observable<BenchmarksResponse> {
    return of(benchmarksData) ;
  }
  public getMeta(establishmentUid): Observable<BenchmarksResponse> {
    return of(benchmarksData) ;
  }
}
