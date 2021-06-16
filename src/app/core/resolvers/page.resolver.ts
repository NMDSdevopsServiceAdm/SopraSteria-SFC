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
    const lastUrlSegment = route.url.length - 1;
    const articleId = route.url[lastUrlSegment].path;
    if (articleId) {
      return this.pagesService.getPage(articleId).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
