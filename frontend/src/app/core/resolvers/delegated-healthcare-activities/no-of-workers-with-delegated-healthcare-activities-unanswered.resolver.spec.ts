import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver } from './no-of-workers-with-delegated-healthcare-activities-unanswered.resolver';
import { of } from 'rxjs';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';

describe('GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver', () => {
  const establishmentIdInService = '129';

  const setup = (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver,
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
      ],
    });
    const resolver = TestBed.inject(GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver);
    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);
    const route = TestBed.inject(ActivatedRoute);

    const getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer',
    ).and.returnValue(of(null));

    return {
      resolver,
      delegatedHealthcareActivitiesService,
      route,
      getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy,
    };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call with the establishmentId', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canViewWorker'] };
    const { resolver, route, getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = await setup(
      overrides,
    );

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).toHaveBeenCalledWith(
      establishmentId,
    );
  });

  it('should call getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer with uid in establishment service when no uid in params', () => {
    const { resolver, route, getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = setup({
      permissions: ['canViewWorker'],
    });

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).toHaveBeenCalledWith(
      establishmentIdInService,
    );
  });

  it('should not call the backend if user does not have permission', async () => {
    const overrides = { permissions: [] };
    const { resolver, route, getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy } = await setup(
      overrides,
    );

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswerSpy).not.toHaveBeenCalled();
  });
});
