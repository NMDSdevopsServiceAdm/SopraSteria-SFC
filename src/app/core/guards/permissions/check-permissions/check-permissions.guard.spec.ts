import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';

import { CheckPermissionsGuard } from './check-permissions.guard';

fdescribe('CheckPermissionsGuard', () => {
  function setup(admin = true) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        CheckPermissionsGuard,
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

    return {
      guard,
    };
  }

  it('should create', () => {
    const { guard } = setup();
    expect(guard).toBeTruthy();
  });

  it('should check that workplace has the correct permissions', () => {
    const { guard } = setup();
  });
});
