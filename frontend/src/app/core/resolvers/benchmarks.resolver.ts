import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class BenchmarksResolver {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: BenchmarksV2Service) {}

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
