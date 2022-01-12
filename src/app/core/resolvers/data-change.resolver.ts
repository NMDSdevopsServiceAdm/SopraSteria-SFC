import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { DataChange } from '@core/model/data-change.model';
import { DataChangeService } from '@core/services/data-change.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class ArticleResolver implements Resolve<any> {
  constructor(private router: Router, private dataChangeService: DataChangeService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | DataChange[]> {
    const lastupdated = route.paramMap.get('last_updated');
    if (lastupdated) {
      return this.dataChangeService.getDataChange(lastupdated).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
