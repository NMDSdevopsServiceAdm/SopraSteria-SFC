import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { AdminManagerUser, AdminUser } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { queryByText, render } from '@testing-library/angular';

import { AdminAccountViewComponent } from './admin-account-view.component';

describe('AdminAccountViewComponent', () => {
  async function setup(isAdminManagerType = true) {
    const { fixture, getByText, queryByText } = await render(AdminAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                adminUser: isAdminManagerType ? AdminManagerUser() : AdminUser(),
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      fixture,
      component,
      routerSpy,
      router,
      getByText,
      queryByText,
    };
  }

  it('should render a AdminAccountViewComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('buttons and links', async () => {
    //TODO: update this test when link functionality is implemented
    xit('should render a Resend the user email link if user is pending', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Resend the user set-up email')).toBeTruthy();
    });

    xit('shouldnt render a Resend the user email link if user is not pending', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Resend the user set-up email')).toBeTruthy();
    });

    it('shouldnt render a delete this user link when user is not an AdminManager', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Delete this admin user')).toBeFalsy();
    });

    it('should render a delete this user link when user is an AdminManager', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Delete this admin user')).toBeTruthy();
    });

    it('shouldnt render a change link when user is not an AdminManager', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Change')).toBeFalsy();
    });

    it('should render a change link when user is an AdminManager', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Change')).toBeTruthy();
    });

    it('Should navigate to admin users summary page when view admin users button is clicked', async () => {
      const { getByText } = await setup();

      const button = getByText('View admin users');

      expect(button.getAttribute('href')).toBe('/sfcadmin/users');
    });
  });

  describe('Admin user details', async () => {
    it('should render Admin User details with AdminManager Role', async () => {
      const { component, queryByText } = await setup();

      expect(queryByText('Full name')).toBeTruthy();
      expect(queryByText(component.user.fullname)).toBeTruthy();

      expect(queryByText('Job title')).toBeTruthy();
      expect(queryByText(component.user.jobTitle)).toBeTruthy();

      expect(queryByText('Email address')).toBeTruthy();
      expect(queryByText(component.user.email)).toBeTruthy();

      expect(queryByText('Phone number')).toBeTruthy();
      expect(queryByText(component.user.phone)).toBeTruthy();

      expect(queryByText('Username')).toBeTruthy();
      expect(queryByText(component.user.username)).toBeTruthy();

      expect(queryByText('Permissions')).toBeTruthy();
      expect(queryByText('Admin manager')).toBeTruthy();
    });

    it('should render Admin User details with Admin Role', async () => {
      const { component, queryByText } = await setup(false);

      expect(queryByText('Full name')).toBeTruthy();
      expect(queryByText(component.user.fullname)).toBeTruthy();

      expect(queryByText('Job title')).toBeTruthy();
      expect(queryByText(component.user.jobTitle)).toBeTruthy();

      expect(queryByText('Email address')).toBeTruthy();
      expect(queryByText(component.user.email)).toBeTruthy();

      expect(queryByText('Phone number')).toBeTruthy();
      expect(queryByText(component.user.phone)).toBeTruthy();

      expect(queryByText('Username')).toBeTruthy();
      expect(queryByText(component.user.username)).toBeTruthy();

      expect(queryByText('Permissions')).toBeTruthy();
      expect(queryByText('Admin')).toBeTruthy();
    });
  });
});
