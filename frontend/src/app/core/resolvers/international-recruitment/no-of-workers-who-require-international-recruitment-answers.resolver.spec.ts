import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

import { GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver } from './no-of-workers-who-require-international-recruitment-answers.resolver';

describe('GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver', () => {
  const establishmentUid = 'abc12345';
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: establishmentUid },
          },
        },
        InternationalRecruitmentService,
      ],
    });

    const resolver = TestBed.inject(GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver);
    const internationalRecruitmentService = TestBed.inject(InternationalRecruitmentService);

    return { resolver, internationalRecruitmentService };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getNoOfWorkersWhoRequireInternationalRecruitmentAnswers with establishment uid', async () => {
    const { resolver, internationalRecruitmentService } = await setup();
    const getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy = spyOn(
      internationalRecruitmentService,
      'getNoOfWorkersWhoRequireInternationalRecruitmentAnswers',
    ).and.callThrough();
    resolver.resolve();

    expect(getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy).toHaveBeenCalledWith(establishmentUid);
  });
});
