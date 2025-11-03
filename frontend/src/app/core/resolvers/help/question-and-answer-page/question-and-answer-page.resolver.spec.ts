import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { HelpPagesService } from '@core/services/help-pages.service';
import { of } from 'rxjs';

import { QuestionAndAnswerPageResolver } from './question-and-answer-page.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('QuestionAndAnswerPageResolver', () => {
  const url = [{ path: 'help' }, { path: 'questions-and-answers' }, { path: 'what-staff-record-data' }];

  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        QuestionAndAnswerPageResolver,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            url,
          },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    const resolver = TestBed.inject(QuestionAndAnswerPageResolver);
    const route = TestBed.inject(ActivatedRouteSnapshot);
    const helpPagesService = TestBed.inject(HelpPagesService);

    return {
      resolver,
      route,
      helpPagesService,
    };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getQuestionAndAnswerPage in the help pages service and pass in the slug (the last path in the url)', () => {
    const { resolver, helpPagesService, route } = setup();

    const getQuestionAndAnswerPageSpy = spyOn(helpPagesService, 'getQuestionAndAnswerPage').and.returnValue(of(null));

    resolver.resolve(route);

    expect(getQuestionAndAnswerPageSpy).toHaveBeenCalledWith(url[2].path);
  });
});
