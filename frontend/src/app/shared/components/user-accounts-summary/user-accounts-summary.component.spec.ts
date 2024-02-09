import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';

describe('UserAccountsSummaryComponent', () => {
  const setup = async (showBanner = false, overLimit = false) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(UserAccountsSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      componentProperties: { workplace: Establishment, showSecondUserBanner: showBanner },
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                users: overLimit
                  ? ([ReadUser(), ReadUser(), ReadUser(), EditUser(), EditUser(), EditUser()] as UserDetails[])
                  : ([EditUser()] as UserDetails[]),
              },
            },
          },
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
    const { component } = await setup(false, true);

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

  describe('Permissions column', () => {
    it('should have permission as Primary edit and WDF when user isPrimary and canManageWdfClaims are true and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = true;
      component.users[0].canManageWdfClaims = true;

      fixture.detectChanges();

      expect(queryByText('Primary edit and WDF')).toBeTruthy();
    });

    it('should have permission as Primary edit when user isPrimary is true, canManageWdfClaims is false and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = true;
      component.users[0].canManageWdfClaims = false;

      fixture.detectChanges();

      expect(queryByText('Primary edit')).toBeTruthy();
    });

    it('should have permission as Edit and WDF when user isPrimary is false, canManageWdfClaims is true and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = false;
      component.users[0].canManageWdfClaims = true;

      fixture.detectChanges();

      expect(queryByText('Edit and WDF')).toBeTruthy();
    });

    it('should have permission as Edit when user isPrimary is false, canManageWdfClaims is false and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = false;
      component.users[0].canManageWdfClaims = false;

      fixture.detectChanges();

      expect(queryByText('Edit')).toBeTruthy();
    });

    it('should have permission as Read only and WDF when user canManageWdfClaims is true and role is Read', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Read' as Roles;
      component.users[0].canManageWdfClaims = true;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Read only and WDF')).toBeTruthy();
    });

    it('should have permission as Read only when user canManageWdfClaims is false and role is Read', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Read' as Roles;
      component.users[0].canManageWdfClaims = false;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Read only')).toBeTruthy();
    });

    it('should have permission as WDF when user canManageWdfClaims is true and role is None', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'None' as Roles;
      component.users[0].canManageWdfClaims = true;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('WDF')).toBeTruthy();
    });
  });
});
