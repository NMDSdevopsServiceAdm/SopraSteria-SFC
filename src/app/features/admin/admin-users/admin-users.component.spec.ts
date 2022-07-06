import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { AdminManagerUser, AdminUser, PendingAdminUser } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdminUsersComponent } from './admin-users.component';

describe('AdminUsersComponent', () => {
  async function setup(adminManager = false) {
    const { fixture, getByText, getByTestId, queryByText } = await render(AdminUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: ['/sfcadmin', 'users'],
              data: {
                adminUsers: { adminUsers: [AdminUser(), PendingAdminUser(), AdminManagerUser()] as UserDetails[] },
                loggedInUser: { role: adminManager ? Roles.AdminManager : Roles.Admin },
              },
            },
          },
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      routerSpy,
    };
  }

  it('should render a AdminUsersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the number of admin users in the heading', async () => {
    const { getByText } = await setup();

    const pageHeading = getByText('Admin users (3)');

    expect(pageHeading).toBeTruthy();
  });

  it('should show a button for adding an admin user if the user is an adminManager', async () => {
    const { getByText } = await setup(true);

    const button = getByText('Add an admin user');

    expect(button).toBeTruthy();
  });

  it('should not show a button for adding an admin user if the user is an admin', async () => {
    const { queryByText } = await setup();

    const button = queryByText('Add an admin user');

    expect(button).toBeFalsy();
  });

  it('should render a user table', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('table')).toBeTruthy();
  });

  it('should navigate to next page when add an admin button is clicked', async () => {
    const { component, fixture, getByText, routerSpy } = await setup(true);

    component.flow = '/sfcadmin/users';
    fixture.detectChanges();

    const button = getByText('Add an admin user');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin/users', 'add-admin']);
  });

  it('should render the correct information in the table for each admin user', async () => {
    const { component, getByTestId } = await setup();

    const adminUsers = component.users;

    adminUsers.forEach((adminUser, index) => {
      const row = getByTestId(`row-${index}`);
      const usernameValue = adminUser.status === 'Pending' ? '-' : adminUser.status;
      const role = adminUser.role === 'AdminManager' ? 'Admin manager' : adminUser.role;

      expect(row.innerText).toContain(adminUser.fullname);
      expect(row.innerText).toContain(usernameValue);
      expect(row.innerText).toContain('2 Jan 2022');
      expect(row.innerText).toContain(role);
      expect(row.innerText).toContain(adminUser.status);
    });
  });

  it('should render the full name as a link with href', async () => {
    const { component, getByText } = await setup();

    const adminUsers = component.users;

    adminUsers.forEach((adminUser) => {
      const user = getByText(adminUser.fullname);
      expect(user.getAttribute('href')).toEqual(`/sfcadmin/users/${adminUser.uid}`);
    });
  });
});
