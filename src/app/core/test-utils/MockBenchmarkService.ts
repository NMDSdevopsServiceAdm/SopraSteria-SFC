import { ElementRef, Injectable } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Observable, of } from 'rxjs';

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
const returnToBuilder = build('URLStructure', {
  fields: {
    url:['/dashboard'],
    fragment:'benchmarks'
  }
});

const returnTo = returnToBuilder();
const benchmarksData = benchmarksResponseBuilder();

@Injectable()
export class MockBenchmarksService extends BenchmarksService {
  public get workplaceTitle(): ElementRef {
    return this.aboutDataElement;
  }

  public get header(): ElementRef {
    return this.aboutDataElement;
  }

  public get footer(): ElementRef {
    return this.aboutDataElement;
  }

  public get aboutData(): ElementRef {
    return this.aboutDataElement;
  }

  public set aboutData(aboutDataElement: ElementRef) {
    this.aboutDataElement = aboutDataElement;
  }

  public get returnTo(): URLStructure {
    return returnTo
  }

  public getTileData(establishmentUid,requiredTiles): Observable<BenchmarksResponse> {
    return of(benchmarksData) ;
  }


}
