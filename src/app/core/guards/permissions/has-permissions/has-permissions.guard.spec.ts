import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { of } from 'rxjs';

import { HasPermissionsGuard } from './has-permissions.guard';

describe('HasPermissionsGuard', () => {
  function setup(workplaceId = true) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        HasPermissionsGuard,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            paramMap: convertToParamMap({ establishmentuid: workplaceId ? 'someEstablishmentUid' : '' }),
          },
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishmentId: workplaceId ? 'establishmentUid' : '',
          },
        },
      ],
    });

    const guard = TestBed.inject(HasPermissionsGuard) as HasPermissionsGuard;
    const route = TestBed.inject(ActivatedRouteSnapshot) as ActivatedRouteSnapshot;
    const permissionsService = TestBed.inject(PermissionsService) as PermissionsService;

    return {
      guard,
      route,
      permissionsService,
    };
  }

  it('should create HasPermissionsGuard', () => {
    const { guard } = setup();
    expect(guard).toBeTruthy;
  });

  it('should return true if the workplace has the correct permissions', () => {
    const { guard, route, permissionsService } = setup();

    const permissionsServiceSpy = spyOn(permissionsService, 'hasWorkplacePermissions').and.returnValue(of(true));

    const res = guard.canActivate(route, null);

    expect(res).toBeTrue;
    expect(permissionsServiceSpy).toHaveBeenCalledWith('someEstablishmentUid');
  });

  it('should return false of the workplace does not have the correct permissions', () => {
    const { guard, route, permissionsService } = setup();

    spyOn(permissionsService, 'hasWorkplacePermissions').and.returnValue(of(false));

    const res = guard.canActivate(route, null);
    expect(res).toBeFalse;
  });

  it('should return true if no workplace id is given', () => {
    const { guard, route, permissionsService } = setup(false);

    const permissionsServiceSpy = spyOn(permissionsService, 'hasWorkplacePermissions').and.returnValue(of(true));

    const res = guard.canActivate(route, null);
    expect(res).toBeTrue;

    expect(permissionsServiceSpy).toHaveBeenCalledWith('');
  });
});
