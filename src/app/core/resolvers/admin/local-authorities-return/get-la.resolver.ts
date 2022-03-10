import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { IndividualLA } from '@core/model/admin/local-authorities-return.model';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetLaResolver implements Resolve<any> {
  constructor(private router: Router, private localAuthoritiesReturnService: LocalAuthoritiesReturnService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | IndividualLA> {
    const uid = route.paramMap.get('uid');
    if (uid) {
      return this.localAuthoritiesReturnService.getLA(uid).pipe(
        catchError(() => {
          this.router.navigate(['/problem-with-the-service']);
          return EMPTY;
        }),
      );
    }
  }
}
