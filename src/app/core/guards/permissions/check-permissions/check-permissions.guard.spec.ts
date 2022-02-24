import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';

import { CheckPermissionsGuard } from './check-permissions.guard';

fdescribe('CheckPermissionsGuard', () => {
  function setup(admin = false) {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
      ],
      providers: [
        CheckPermissionsGuard,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            paramMap: convertToParamMap({ establishmentuid: 'someUid' }),
            data: { permissions: ['canEditEstablishment'] },
          },
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishmentId: 'establishmentUid',
          },
        },
        {
          provide: UserService,
          useValue: {
            loggedInUser: { role: admin ? Roles.Admin : Roles.Edit },
          },
        },
      ],
    });

    const guard = TestBed.inject(CheckPermissionsGuard);
    const route = TestBed.inject(ActivatedRouteSnapshot) as ActivatedRouteSnapshot;
    const permissionsService = TestBed.inject(PermissionsService) as PermissionsService;

    return {
      guard,
      route,
      permissionsService,
    };
  }

  it('should create', () => {
    const { guard } = setup();
    expect(guard).toBeTruthy();
  });

  it('should return true if the logged in user is an admin', () => {
    const { guard, route } = setup(true);

    const res = guard.canActivate(route, null);
    expect(res).toBeTruthy();
  });

  it('should check that user has the correct permissions', () => {
    const { guard, route, permissionsService } = setup();

    spyOn(permissionsService, 'permissions').and.returnValue(['canEditEstablishment', 'canViewEstablishment']);

    const res = guard.canActivate(route, null);
    expect(res).toBeTruthy();
  });

  it('should return false if the user does not have the correct permissions', () => {
    const { guard, route, permissionsService } = setup();

    spyOn(permissionsService, 'permissions').and.returnValue(['canViewUser', 'canViewEstablishment']);

    const res = guard.canActivate(route, null);
    expect(res).toBeFalsy();
  });
});
