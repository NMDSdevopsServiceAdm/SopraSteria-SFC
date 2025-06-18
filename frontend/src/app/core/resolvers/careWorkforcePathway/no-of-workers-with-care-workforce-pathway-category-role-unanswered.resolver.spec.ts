import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from './no-of-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { of } from 'rxjs';

describe('getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver', () => {
  const establishmentIdInService = '129';

  const setup = (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver,
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
        CareWorkforcePathwayService,
      ],
    });
    const resolver = TestBed.inject(GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const route = TestBed.inject(ActivatedRoute);

    const getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy = spyOn(
      careWorkforcePathwayService,
      'getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer',
    ).and.returnValue(of(null));

    return { resolver, careWorkforcePathwayService, route, getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call with the establishmentId', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canViewWorker'] };
    const { resolver, route, getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = await setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).toHaveBeenCalledWith(establishmentId);
  });

  it('should call getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy with uid in establishment service when no uid in params', () => {
    const { resolver, route, getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = setup({
      permissions: ['canViewWorker'],
    });

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).toHaveBeenCalledWith(establishmentIdInService);
  });

  it('should not call the backend if user does not have permission', async () => {
    const overrides = { permissions: [] };
    const { resolver, route, getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = await setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).not.toHaveBeenCalled();
  });
});
