import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RankingsResolver  {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: BenchmarksServiceBase) {}

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
