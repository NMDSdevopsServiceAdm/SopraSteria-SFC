import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminManagerUser, AdminUser, PendingAdminUser } from '@core/test-utils/admin/MockAdminUsersService';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { UserTableComponent } from './user.table.component';

describe('UserTableComponent', () => {
  const userArr = [ReadUser(), EditUser()] as UserDetails[];
  const adminUserArr = [AdminUser(), AdminManagerUser(), PendingAdminUser()] as UserDetails[];
  const permissionTypes = getUserPermissionsTypes(true);

  const setup = async (admin = false, canViewUser = true) => {
    const setupTools = await render(UserTableComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        workplace: !admin && Establishment,
        users: admin ? adminUserArr : userArr,
        canViewUser: canViewUser,
        userPermissionsTypes: !admin && permissionTypes,
      },
      declarations: [],
    });
    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a table with a row for each admin user, and with the headings', async () => {
    const { getByText, getByTestId } = await setup();

    expect(getByText('Full name')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('Last updated')).toBeTruthy();
    expect(getByText('Permissions')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();

    expect(getByTestId('row-0')).toBeTruthy();
    expect(getByTestId('row-1')).toBeTruthy();
  });

  it('should render a pending user row with additional highlight class', async () => {
    const { component, getByTestId } = await setup(true);

    const adminUsers = component.users;
    const index = adminUsers.findIndex((user) => user.status === 'Pending');

    const row = getByTestId(`row-${index}`);
    expect(row.getAttribute('class')).toContain('govuk-error-table__row--highlight');
  });

  it('should render the full name not as a link when canViewUser is false', async () => {
    const { component, getByTestId } = await setup(false, false);
    const users = component.users;

    users.forEach((u, index) => {
      expect(getByTestId(`no-link-full-name-${index}`)).toBeTruthy();
    });
  });

  it('should render the full name as a link with correct href for users', async () => {
    const { component, getByText } = await setup();

    const users = component.users;
    const workplace = component.workplace;

    users.forEach((u) => {
      const user = getByText(u.fullname);
      expect(user.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/user/${u.uid}`);
    });
  });

  it('should render the full name as a link with correct href for admin users', async () => {
    const { component, getByText } = await setup(true);

    const adminUsers = component.users;

    adminUsers.forEach((adminUser) => {
      const user = getByText(adminUser.fullname);
      expect(user.getAttribute('href')).toEqual(`/sfcadmin/users/${adminUser.uid}`);
    });
  });

  it('should show the users full name as a link with the correct href when the canViewUser permissions is true', async () => {
    const { component, queryAllByTestId } = await setup();
    const usernameLink = queryAllByTestId('username-link')[0];

    const establishmentId = component.workplace.uid;
    const userId = component.users[0].uid;

    expect(usernameLink).toBeTruthy();
    expect(usernameLink.getAttribute('href')).toEqual(`/workplace/${establishmentId}/user/${userId}`);
  });

  it('should show the users fullname not as a link when the canViewUser permission is false', async () => {
    const { component, queryByTestId, getByText } = await setup(false, false);

    const fullname = component.users[0].fullname;

    expect(queryByTestId('username-link')).toBeFalsy();
    expect(getByText(fullname)).toBeTruthy();
  });

  describe('Permissions column', () => {
    it('should have permission as Admin or Admin manager if the users are an admin or an admin manager', async () => {
      const { queryAllByText, queryByText } = await setup(true);

      expect(queryAllByText('Admin')).toBeTruthy();
      expect(queryByText('Admin manager')).toBeTruthy();
    });

    it('should have permission as Primary edit when user isPrimary is true and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[1].role = 'Edit' as Roles;
      component.users[1].isPrimary = true;

      fixture.detectChanges();

      expect(queryByText('Primary edit')).toBeTruthy();
    });

    it('should have permission as Edit when user isPrimary is false and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[1].role = 'Edit' as Roles;
      component.users[1].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Edit')).toBeTruthy();
    });

    it('should have permission as Read only when role is Read', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Read' as Roles;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Read only')).toBeTruthy();
    });
  });
});