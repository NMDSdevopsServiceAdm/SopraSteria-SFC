import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminManagerUser, AdminUser, PendingAdminUser } from '@core/test-utils/admin/MockAdminService';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { UserTableComponent } from './user.table.component';

describe('UserTableComponent', () => {
  const userArr = [ReadUser(), EditUser(), EditUser()] as UserDetails[];
  const adminUserArr = [AdminUser(), AdminManagerUser(), PendingAdminUser()] as UserDetails[];
  const permissionTypes = getUserPermissionsTypes(true);

  const setup = async (admin = false, canViewUser = true) => {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(UserTableComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        workplace: !admin && Establishment,
        users: admin ? adminUserArr : userArr,
        canViewUser: canViewUser,
        userPermissionsTypes: !admin && permissionTypes,
      },
      declarations: [],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByText, queryAllByText };
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
    expect(getByTestId('row-2')).toBeTruthy();
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

  describe('Permissions column', () => {
    it('should have permission as Admin or AdminManagers if the users are an admin or an admin manager', async () => {
      const { queryAllByText, queryByText } = await setup(true);

      expect(queryAllByText('Admin')).toBeTruthy();
      expect(queryByText('AdminManager')).toBeTruthy();
    });

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
