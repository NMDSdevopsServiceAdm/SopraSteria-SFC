import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HelpService } from '@core/services/help.service';
import { of } from 'rxjs';

import { QuestionsAndAnswersResolver } from './questions-and-answers.resolver';

describe('QuestionsAndAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        QuestionsAndAnswersResolver,
        {
          provide: HelpService,
          useValue: {
            getAllQuestionsAndAnswers: () => {
              return of(null);
            },
          },
        },
      ],
    });

    const resolver = TestBed.inject(QuestionsAndAnswersResolver);

    const helpService = TestBed.inject(HelpService);
    const getAllQuestionsAndAnswersSpy = spyOn(helpService, 'getAllQuestionsAndAnswers').and.callThrough();

    return {
      resolver,
      getAllQuestionsAndAnswersSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllQuestionsAndAnswers in help service', async () => {
    const { resolver, getAllQuestionsAndAnswersSpy } = await setup();

    resolver.resolve();

    expect(getAllQuestionsAndAnswersSpy).toHaveBeenCalled();
  });
});
