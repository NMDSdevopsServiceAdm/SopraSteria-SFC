import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Article } from '@core/model/article.model';
import { HelpPagesService } from '@core/services/help-pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class QuestionsAndAnswersResolver implements Resolve<any> {
  constructor(private helpPagesService: HelpPagesService) {}

  resolve(): Observable<null | Article[]> {
    return this.helpPagesService.getAllQuestionsAndAnswers().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
