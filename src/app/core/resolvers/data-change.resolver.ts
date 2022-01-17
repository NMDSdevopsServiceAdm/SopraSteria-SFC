import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { DataChange } from '@core/model/data-change.model';
import { DataChangeService } from '@core/services/data-change.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DataChangeResolver implements Resolve<any> {
  constructor(private router: Router, private dataChangeService: DataChangeService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | DataChange> {
    return this.dataChangeService.getDataChange().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
