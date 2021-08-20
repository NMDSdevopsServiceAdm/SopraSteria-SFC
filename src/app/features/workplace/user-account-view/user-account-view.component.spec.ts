import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
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
  async function setup(isPrimary = true, uidWithUsers = 'activeEditUsers') {
    const { fixture, getByText, getByTestId, queryByText } = await render(UserAccountViewComponent, {
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
                    uid: uidWithUsers,
                    name: 'abc123',
                  },
                },
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const permissionsService = injector.inject(PermissionsService) as PermissionsService;

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      permissionsService,
      getByText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a UserAccountViewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user and user is not primary', async () => {
    const { getByText } = await setup(false);

    expect(getByText('Change')).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user, user is primary but there is more than one active edit user linked to the establishment', async () => {
    const { getByText } = await setup(true);

    expect(getByText('Change')).toBeTruthy();
  });

  it('should not display Change link when user is primary and only active edit user linked to the establishment', async () => {
    const { queryByText } = await setup(true, 'singleEditUser');

    expect(queryByText('Change')).toBeFalsy();
  });

  it('should not display Change link when logged in user does not have edit permissions for the user', async () => {
    const { component, fixture, permissionsService, queryByText } = await setup(true);

    const spy = spyOn(permissionsService, 'can');
    spy.and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    expect(queryByText('Change')).toBeFalsy();
  });
});
