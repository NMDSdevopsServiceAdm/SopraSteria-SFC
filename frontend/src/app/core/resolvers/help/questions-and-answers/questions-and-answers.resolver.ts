import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { QuestionsAndAnswersResponse } from '@core/model/help-pages.model';
import { HelpPagesService } from '@core/services/help-pages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class QuestionsAndAnswersResolver implements Resolve<any> {
  constructor(private helpPagesService: HelpPagesService) {}

  resolve(): Observable<null | QuestionsAndAnswersResponse> {
    return this.helpPagesService.getAllQuestionsAndAnswers().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
