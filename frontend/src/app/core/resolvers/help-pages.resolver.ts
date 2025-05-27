import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { HelpPage } from '@core/model/help-pages.model';
import { HelpPagesService } from '@core/services/help-pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class HelpPageResolver implements Resolve<any> {
  constructor(private helpPagesService: HelpPagesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | HelpPage[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const slug = route.url[lastUrlSegmentIndex].path;

    if (slug) {
      return this.helpPagesService.getHelpPage(slug).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
