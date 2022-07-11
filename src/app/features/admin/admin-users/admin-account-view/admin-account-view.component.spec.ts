import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import {
  AdminManagerUser,
  AdminUser,
  PendingAdminManager,
  PendingAdminUser,
} from '@core/test-utils/admin/MockAdminUsersService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdminAccountViewComponent } from './admin-account-view.component';

describe('AdminAccountViewComponent', () => {
  async function setup(isAdminManagerType = true, pending = false) {
    const role = isAdminManagerType ? Roles.AdminManager : Roles.Admin;
    let user;

    if (isAdminManagerType && pending) {
      user = PendingAdminManager();
    } else if (pending && !isAdminManagerType) {
      user = PendingAdminUser();
    } else if (isAdminManagerType && !pending) {
      user = AdminManagerUser();
    } else {
      user = AdminUser();
    }
    const { fixture, getByText, queryByText } = await render(AdminAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: MockActivatedRoute,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
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
                adminUser: user,
              },
            },
          },
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, role),
          deps: [HttpClient],
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
    it('should render a Resend the user email link if user is pending and is Admin manager', async () => {
      const { queryByText, component } = await setup(true, true);

      expect(queryByText('Resend the user set-up email')).toBeTruthy();
    });

    it('should not render a Resend the user email link if user is not pending', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Resend the user set-up email')).toBeFalsy();
    });

    it('should not render a delete this user link when user is not an AdminManager', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Delete this admin user')).toBeFalsy();
    });

    it('should render a delete this user link when user is an AdminManager', async () => {
      const { getByText } = await setup(true);

      expect(getByText('Delete this admin user')).toBeTruthy();
    });

    it('should not render a change link when user is not an AdminManager', async () => {
      const { queryByText } = await setup(false);

      expect(queryByText('Change')).toBeFalsy();
    });

    it('should render a change link when user is an AdminManager', async () => {
      const { getByText } = await setup(true);

      expect(getByText('Change')).toBeTruthy();
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

  describe('resendActivationLinkAdmin', async () => {
    it('should send the email by rendering  resendActivationLinkAdmin function', async () => {
      const { fixture, getByText } = await setup(true, true);

      const userService = TestBed.inject(AdminUsersService) as AdminUsersService;
      const resendActivationLinkAdminSpy = spyOn(userService, 'resendActivationLinkAdmin').and.callThrough();

      fixture.detectChanges();
      const resendEmailLink = getByText('Resend the user set-up email');
      fireEvent.click(resendEmailLink);

      expect(resendActivationLinkAdminSpy).toHaveBeenCalled();
    });
  });
});
