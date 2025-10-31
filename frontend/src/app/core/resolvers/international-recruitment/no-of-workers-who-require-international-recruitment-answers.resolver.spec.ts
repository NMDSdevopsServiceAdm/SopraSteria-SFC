import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterModule } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { of } from 'rxjs';

import { GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver } from './no-of-workers-who-require-international-recruitment-answers.resolver';

describe('GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver', () => {
  const establishmentIdInService = 'abc12345';

  const setup = (idInParams = null, permissions = ['canViewWorker']) => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: establishmentIdInService },
            establishmentId: establishmentIdInService,
          },
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }) } },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        InternationalRecruitmentService,

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver);
    const internationalRecruitmentService = TestBed.inject(InternationalRecruitmentService);
    const route = TestBed.inject(ActivatedRoute);

    const getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy = spyOn(
      internationalRecruitmentService,
      'getNoOfWorkersWhoRequireInternationalRecruitmentAnswers',
    ).and.returnValue(of(null));

    return { resolver, getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy, route };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getNoOfWorkersWhoRequireInternationalRecruitmentAnswers with uid in establishment service when no uid in params', () => {
    const { resolver, route, getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy } = setup();

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy).toHaveBeenCalledWith(establishmentIdInService);
  });

  it('should call getNoOfWorkersWhoRequireInternationalRecruitmentAnswers with uid from params when it exists', () => {
    const uidInParams = 'abc13019432432423432532432';
    const { resolver, route, getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy } = setup(uidInParams);

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy).toHaveBeenCalledWith(uidInParams);
  });

  it('should not make backend call when user does not have permission', () => {
    const uidInParams = 'abc13019432432423432532432';
    const { resolver, route, getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy } = setup(uidInParams, []);

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireInternationalRecruitmentAnswersSpy).not.toHaveBeenCalled();
  });
});
