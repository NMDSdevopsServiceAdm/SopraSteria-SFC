import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  const setup = async (overLimit = false) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByTestId, queryByText } = await render(UsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser', 'canViewUser']),
          deps: [HttpClient, Router, UserService],
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
                users: overLimit
                  ? ([ReadUser(), ReadUser(), ReadUser(), EditUser(), EditUser(), EditUser()] as UserDetails[])
                  : ([EditUser()] as UserDetails[]),
                establishment: establishmentBuilder() as Establishment,
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByTestId, queryByText };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name and id, and the number of users', async () => {
    const { getByTestId, getByText } = await setup();

    const workplaceInfo = getByTestId('workplace-name');
    const numberOfUsers = getByText('Users (1)');

    expect(workplaceInfo).toBeTruthy();
    expect(numberOfUsers).toBeTruthy();
  });

  it('should show Add a user button with the correct href when the canAddUser permission is true', async () => {
    const { component, getByText } = await setup();

    const addUserButton = getByText('Add a user');
    const workplaceId = component.workplace.uid;

    expect(addUserButton).toBeTruthy();
    expect(addUserButton.getAttribute('href')).toEqual(`/workplace/${workplaceId}/user/create`);
  });

  it('should not show Add a user button when the canAddUser permission is false', async () => {
    const { component, fixture, queryByText } = await setup();

    component.canAddUser = false;
    fixture.detectChanges();

    expect(queryByText('Add a user')).toBeFalsy();
  });

  it('should not be able to add user if 3 edit users exist', async () => {
    const { getByText, queryByText } = await setup(true);

    expect(getByText('Users (6)')).toBeTruthy();
    expect(queryByText('Add a user')).toBeFalsy();
  });

  it('should show add user banner if showSecondUserBanner is true', async () => {
    const { component, fixture, queryByText } = await setup();

    component.showSecondUserBanner = true;
    fixture.detectChanges();

    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeTruthy();
  });

  it('should not show add user banner if showSecondUserBanner is false', async () => {
    const { queryByText } = await setup();
    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeFalsy();
  });

  it('should show the users full name as a link with the correct href when the canViewUser permissions is true', async () => {
    const { component, getByTestId } = await setup();
    const usernameLink = getByTestId('username-link');

    const establishmentId = component.workplace.uid;
    const userId = component.users[0].uid;

    expect(usernameLink).toBeTruthy();
    expect(usernameLink.getAttribute('href')).toEqual(`/workplace/${establishmentId}/user/${userId}`);
  });

  it('should show the users fullname not as a link when the canViewUser permission is false', async () => {
    const { component, fixture, queryByTestId, getByText } = await setup();

    component.canViewUser = false;
    fixture.detectChanges();

    const fullname = component.users[0].fullname;

    expect(queryByTestId('username-link')).toBeFalsy();
    expect(getByText(fullname)).toBeTruthy();
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
