import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetIndividualParentRequestResolver implements Resolve<any> {
  constructor(private router: Router, private parentRequestsService: ParentRequestsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const establishmentUid = route.url[lastUrlSegmentIndex].path;

    return this.parentRequestsService.getIndividualParentRequest(establishmentUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
