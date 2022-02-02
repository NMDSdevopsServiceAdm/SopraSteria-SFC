import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';

describe('UserAccountsSummaryComponent', () => {
  const setup = async (showBanner = false, isAdmin = false, subsidiaries = 0) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(UserAccountsSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      componentProperties: { workplace: Establishment, showSecondUserBanner: showBanner },
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser'], isAdmin),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should still show Add User if existing user doesnt have a name', async () => {
    const { component } = await setup();

    component.workplace.uid = '4698f4a4-ab82-4906-8b0e-3f4972375927';

    component.ngOnInit();
    expect(component.users.length).toEqual(1);
    expect(component.canAddUser).toBeTruthy();
  });

  it('should not be able to add user if 3 edit users exist', async () => {
    const { component } = await setup();

    component.workplace.uid = 'overLimit';
    component.workplace.isParent = false;

    component.ngOnInit();
    expect(component.users.length).toEqual(6);
    expect(component.canAddUser).toBeFalsy();
  });

  it('should show add user banner if showSecondUserBanner is true', async () => {
    const { queryByText } = await setup(true);
    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeTruthy();
  });

  it('should not show add user banner if showSecondUserBanner is false', async () => {
    const { queryByText } = await setup(false);
    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeFalsy();
  });
});
