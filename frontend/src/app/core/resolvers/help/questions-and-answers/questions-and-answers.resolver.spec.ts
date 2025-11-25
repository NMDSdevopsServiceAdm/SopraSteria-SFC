import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HelpPagesService } from '@core/services/help-pages.service';
import { of } from 'rxjs';

import { QuestionsAndAnswersResolver } from './questions-and-answers.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('QuestionsAndAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        QuestionsAndAnswersResolver,
        {
          provide: HelpPagesService,
          useValue: {
            getAllQuestionsAndAnswers: () => {
              return of(null);
            },
          },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    const resolver = TestBed.inject(QuestionsAndAnswersResolver);

    const helpPagesService = TestBed.inject(HelpPagesService);
    const getAllQuestionsAndAnswersSpy = spyOn(helpPagesService, 'getAllQuestionsAndAnswers').and.callThrough();

    return {
      resolver,
      getAllQuestionsAndAnswersSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllQuestionsAndAnswers in help pages service', async () => {
    const { resolver, getAllQuestionsAndAnswersSpy } = await setup();

    resolver.resolve();

    expect(getAllQuestionsAndAnswersSpy).toHaveBeenCalled();
  });
});
