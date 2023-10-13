import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { IBenchmarksService } from '@core/services/Ibenchmarks.service';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class BenchmarksResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: IBenchmarksService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (workplaceUid) {
      return this.benchmarksService.getTileData(workplaceUid, ['sickness', 'turnover', 'pay', 'qualifications']).pipe(
        tap((benchmarksData) => {
          this.benchmarksService.benchmarksData = benchmarksData;
        }),
      );
    }
    return of(null);
  }
}
