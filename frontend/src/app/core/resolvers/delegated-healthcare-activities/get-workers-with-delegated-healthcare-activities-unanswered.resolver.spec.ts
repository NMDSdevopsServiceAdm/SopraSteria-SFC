import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { of } from 'rxjs';

import { GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver } from './get-workers-with-delegated-healthcare-activities-unanswered.resolver';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';

describe('GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver', () => {
  const establishmentIdInService = '129';

  const setup = (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: establishmentIdInService },
            establishmentId: establishmentIdInService,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: overrides?.establishmentIdInParams }) },
          },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        DelegatedHealthcareActivitiesService,

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver);
    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);
    const route = TestBed.inject(ActivatedRoute);

    const getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer',
    ).and.returnValue(of(null));

    return {
      resolver,
      delegatedHealthcareActivitiesService,
      route,
      getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy,
    };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer with the establishmentId when in params', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canEditWorker'] };
    const { resolver, route, getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = await setup(
      overrides,
    );

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).toHaveBeenCalledWith(
      establishmentId,
      jasmine.anything(),
    );
  });

  it('should call getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer with uid in establishment service when no uid in params', () => {
    const { resolver, route, getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = setup({
      permissions: ['canEditWorker'],
    });

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).toHaveBeenCalledWith(
      establishmentIdInService,
      jasmine.anything(),
    );
  });

  it('should pass in default pagination params to getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer call', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canEditWorker'] };
    const { resolver, route, getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = await setup(
      overrides,
    );

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).toHaveBeenCalledWith(
      jasmine.anything(),
      {
        pageIndex: 0,
        itemsPerPage: 15,
      },
    );
  });

  it('should not make backend call if user does not have canEditWorker permission', async () => {
    const overrides = { permissions: [] };
    const { resolver, route, getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = await setup(
      overrides,
    );

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).not.toHaveBeenCalled();
  });
});
