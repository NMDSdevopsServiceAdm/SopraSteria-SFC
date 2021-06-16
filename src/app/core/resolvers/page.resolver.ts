import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Page } from '@core/model/page.model';
import { PagesService } from '@core/services/pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class PageResolver implements Resolve<any> {
  constructor(private router: Router, private pagesService: PagesService) {}

  resolve(): Observable<null | Page[]> {
    const articleId = 'about-us';
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
