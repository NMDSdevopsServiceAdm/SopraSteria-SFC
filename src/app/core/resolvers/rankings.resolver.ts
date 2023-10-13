import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { IBenchmarksService } from '@core/services/Ibenchmarks.service';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RankingsResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: IBenchmarksService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (workplaceUid) {
      return this.benchmarksService.getAllRankingData(workplaceUid).pipe(
        tap((rankingsData) => {
          this.benchmarksService.rankingsData = rankingsData;
        }),
      );
    }
    return of(null);
  }
}
