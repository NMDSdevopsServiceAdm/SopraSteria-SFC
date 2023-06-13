import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class BenchmarksResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: BenchmarksService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;

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
