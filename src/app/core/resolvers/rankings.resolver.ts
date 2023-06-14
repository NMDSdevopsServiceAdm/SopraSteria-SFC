import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RankingsResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private benchmarksService: BenchmarksService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;

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
