import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetCQCStatusChangeResolver implements Resolve<any> {
  constructor(private router: Router, private cqcStatusChangeService: CqcStatusChangeService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any[]> {
    return this.cqcStatusChangeService.getCqcStatusChanges().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
