import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

const { build } = require('@jackfranklin/test-data-bot');

const benchmarksResponseBuilder = build('BenchmarksResponse', {
  fields: {
    tiles: {
      pay: {
        workplaceValue: {
          value: 15,
          hasValue: true
        },
        comparisonGroup: {
          value: 10,
          hasValue: true
        }
      },
    },
    meta: {
    }
  }
});

const benchmarksData = benchmarksResponseBuilder();

@Injectable()
export class MockBenchmarksService extends BenchmarksService {

  public getAllTiles(establishmentUid): Observable<BenchmarksResponse> {
    return of(benchmarksData) ;
  }
}
