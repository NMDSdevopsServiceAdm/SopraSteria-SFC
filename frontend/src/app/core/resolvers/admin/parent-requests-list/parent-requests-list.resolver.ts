import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ParentRequestsListResolver implements Resolve<any> {
  constructor(private router: Router, private parentRequestsService: ParentRequestsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any[]> {
    return this.parentRequestsService.getParentRequests().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
