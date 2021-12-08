import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetIndividualCqcMainServiceChangeResolver implements Resolve<any> {
  constructor(private router: Router, private cqcStatusChangeService: CqcStatusChangeService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const establishmentUid = route.url[lastUrlSegmentIndex].path;

    return this.cqcStatusChangeService.getCqcRequestByEstablishmentUid(establishmentUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
