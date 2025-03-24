import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DataChange } from '@core/model/data-change.model';
import { DataChangeService } from '@core/services/data-change.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class DataChangeResolver  {
  constructor(private dataChangeService: DataChangeService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | DataChange> {
    return this.dataChangeService.getDataChange().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
