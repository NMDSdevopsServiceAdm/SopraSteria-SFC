import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { of } from 'rxjs';

import { GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from './get-workers-with-care-workforce-pathway-category-role-unanswered.resolver';

describe('GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver', () => {
  const establishmentIdInService = '129';

  const setup = (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver,
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

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const route = TestBed.inject(ActivatedRoute);

    const getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy = spyOn(
      careWorkforcePathwayService,
      'getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer',
    ).and.returnValue(of(null));

    return { resolver, careWorkforcePathwayService, route, getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy };
  };

  it('should create', async () => {
    const { resolver } = await setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer with the establishmentId when in params', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canEditWorker'] };
    const { resolver, route, getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = await setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).toHaveBeenCalledWith(
      establishmentId,
      jasmine.anything(),
    );
  });

  it('should call getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer with uid in establishment service when no uid in params', () => {
    const { resolver, route, getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = setup({
      permissions: ['canEditWorker'],
    });

    resolver.resolve(route.snapshot);

    expect(getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).toHaveBeenCalledWith(
      establishmentIdInService,
      jasmine.anything(),
    );
  });

  it('should pass in default pagination params to getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswer call', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canEditWorker'] };
    const { resolver, route, getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = await setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).toHaveBeenCalledWith(jasmine.anything(), {
      pageIndex: 0,
      itemsPerPage: 15,
    });
  });

  it('should not make backend call if user does not have canEditWorker permission', async () => {
    const overrides = { permissions: [] };
    const { resolver, route, getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy } = await setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getAllWorkersWhoRequireCareWorkforcePathwayRoleAnswerSpy).not.toHaveBeenCalled();
  });
});
