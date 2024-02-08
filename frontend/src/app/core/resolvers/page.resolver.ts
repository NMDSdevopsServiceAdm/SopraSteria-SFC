import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Page } from '@core/model/page.model';
import { PagesService } from '@core/services/pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class PageResolver implements Resolve<any> {
  constructor(private router: Router, private pagesService: PagesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | Page[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const slug = route.url[lastUrlSegmentIndex].path;
    if (slug) {
      return this.pagesService.getPage(slug).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
