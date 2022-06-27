import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { AdminManagerUser, AdminUser, PendingAdminUser } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdminUsersComponent } from './admin-users.component';

describe('AdminMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(AdminUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: ['/sfcadmin', 'users'],
              data: {
                adminUsers: { adminUsers: [AdminUser(), PendingAdminUser(), AdminManagerUser()] as UserDetails[] },
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
      routerSpy,
    };
  }

  it('should render a AdminUsersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the number of admin users in the heading and a button for adding a user', async () => {
    const { getByText } = await setup();

    const pageHeading = getByText('Admin users (3)');
    const button = getByText('Add an admin user');

    expect(pageHeading).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it('should render a user table', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('table')).toBeTruthy();
  });

  it('should navigate to next page when add an admin button is clicked', async () => {
    const { component, fixture, getByText, routerSpy } = await setup();

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

      expect(row.innerText).toContain(adminUser.fullname);
      expect(row.innerText).toContain(usernameValue);
      expect(row.innerText).toContain('2 Jan 2022');
      expect(row.innerText).toContain(adminUser.role);
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
