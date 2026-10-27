import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ResolveFn, Router } from '@angular/router';

import { GetWorkersWhoMeetNewToCareCriteriaResolver } from './get-workers-who-meet-new-to-care-criteria.resolver';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { UserService } from '@core/services/user.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PermissionType } from '@core/model/permissions.model';

describe('GetWorkersWhoMeetNewToCareCriteriaResolver', () => {
  const establishmentIdInService = '129';

  const setup = (overrides: any = {}) => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GetWorkersWhoMeetNewToCareCriteriaResolver,
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

    const resolver = TestBed.inject(GetWorkersWhoMeetNewToCareCriteriaResolver);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const route = TestBed.inject(ActivatedRoute);

    const getWorkersWhoMeetNewToCareCriteriaSpy = spyOn(
      careWorkforcePathwayService,
      'getWorkersWhoMeetNewToCareCriteria',
    ).and.returnValue(of([]));

    return { resolver, careWorkforcePathwayService, route, getWorkersWhoMeetNewToCareCriteriaSpy };
  };

  it('should create', async () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getWorkersWhoMeetNewToCareCriteria with the establishmentId when in params', async () => {
    const establishmentId = '213';
    const overrides = { establishmentIdInParams: establishmentId, permissions: ['canEditWorker'] };
    const { resolver, route, getWorkersWhoMeetNewToCareCriteriaSpy } = setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoMeetNewToCareCriteriaSpy).toHaveBeenCalledWith(establishmentId);
  });

  it('should call getWorkersWhoMeetNewToCareCriteria with uid in establishment service when no uid in params', () => {
    const { resolver, route, getWorkersWhoMeetNewToCareCriteriaSpy } = setup({
      permissions: ['canEditWorker'],
    });

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoMeetNewToCareCriteriaSpy).toHaveBeenCalledWith(establishmentIdInService);
  });

  it('should not make backend call if user does not have canEditWorker permission', async () => {
    const overrides = { permissions: [] };
    const { resolver, route, getWorkersWhoMeetNewToCareCriteriaSpy } = setup(overrides);

    resolver.resolve(route.snapshot);

    expect(getWorkersWhoMeetNewToCareCriteriaSpy).not.toHaveBeenCalled();
  });
});
