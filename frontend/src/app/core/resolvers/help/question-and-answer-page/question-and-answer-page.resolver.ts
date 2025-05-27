import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { QuestionAndAnswerPage } from '@core/model/help-pages.model';
import { HelpPagesService } from '@core/services/help-pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class QuestionAndAnswerPageResolver implements Resolve<any> {
  constructor(private helpPagesService: HelpPagesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | QuestionAndAnswerPage[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const slug = route.url[lastUrlSegmentIndex].path;

    if (slug) {
      return this.helpPagesService.getQuestionAndAnswerPage(slug).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
