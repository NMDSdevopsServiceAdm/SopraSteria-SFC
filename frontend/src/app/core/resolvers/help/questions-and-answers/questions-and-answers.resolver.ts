import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Article } from '@core/model/article.model';
import { HelpService } from '@core/services/help.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class QuestionsAndAnswersResolver implements Resolve<any> {
  constructor(private helpService: HelpService) {}

  resolve(): Observable<null | Article[]> {
    return this.helpService.getAllQuestionsAndAnswers().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
