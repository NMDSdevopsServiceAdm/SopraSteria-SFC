import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class BenchmarksResolver  {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: BenchmarksServiceBase) {}

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
