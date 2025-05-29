import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { UsefulLinksService } from '@core/services/useful-links.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class UsefulLinkRecruitmentResolver  {
  constructor(private usefulLinksService: UsefulLinksService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.usefulLinksService.getUsefulLinksForRecruitment().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
