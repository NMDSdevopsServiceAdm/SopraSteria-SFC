import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService, nonPrimaryEditUser, primaryEditUser } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { UserAccountViewComponent } from './user-account-view.component';

describe('UserAccountViewComponent', () => {
  async function setup(isPrimary = true) {
    const { fixture, getByText, getByTestId } = await render(UserAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditUser']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, false),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                user: isPrimary ? primaryEditUser : nonPrimaryEditUser,
              },
            },
            parent: {
              snapshot: {
                url: [{ path: 'workplace' }],
                data: {
                  establishment: {
                    id: 'abc123',
                    uid: 'activeEditUsers',
                    name: 'abc123',
                  },
                },
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
    };
  }

  it('should render a UserAccountViewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user and user is not primary', async () => {
    const { component, fixture, getByTestId } = await setup(false);

    expect(getByTestId('permissionsChangeLink')).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user and there is more than one active edit user linked to the establishment', async () => {
    const { component, fixture, getByTestId } = await setup(true);

    expect(getByTestId('permissionsChangeLink')).toBeTruthy();
  });
});
