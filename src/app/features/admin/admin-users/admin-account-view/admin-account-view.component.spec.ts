import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import {
  AdminManagerUser,
  AdminUser,
  MockAdminUsersService,
  PendingAdminManager,
  PendingAdminUser,
} from '@core/test-utils/admin/MockAdminUsersService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

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
        DialogService,
        {
          provide: ActivatedRoute,
          useValue: MockActivatedRoute,
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
          provide: AdminUsersService,
          useClass: MockAdminUsersService,
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
    const adminUsersService = TestBed.inject(AdminUsersService) as AdminUsersService;

    return {
      fixture,
      component,
      routerSpy,
      router,
      getByText,
      queryByText,
      adminUsersService,
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
    it('should send the email by rendering resendActivationLinkAdmin function', async () => {
      const { fixture, getByText, adminUsersService } = await setup(true, true);

      const resendActivationLinkAdminSpy = spyOn(adminUsersService, 'resendActivationLinkAdmin').and.callThrough();

      const resendEmailLink = getByText('Resend the user set-up email');
      fireEvent.click(resendEmailLink);
      fixture.detectChanges();

      expect(resendActivationLinkAdminSpy).toHaveBeenCalled();
    });
  });

  describe('deleting admin user', () => {
    it('should dipslay a modal when clicking the Delete admin user link', async () => {
      const { fixture, getByText } = await setup();

      const deleteLink = getByText('Delete this admin user');
      fireEvent.click(deleteLink);

      const dialog = await within(document.body).findByRole('dialog');
      fixture.detectChanges();

      expect(within(dialog).getByText(`You're about to delete this admin user`)).toBeTruthy();
    });

    it('should call deleteAdminUserDetails with the the user id', async () => {
      const { component, fixture, getByText, adminUsersService } = await setup();

      const deleteAdminSpy = spyOn(adminUsersService, 'deleteAdminUserDetails').and.returnValue(of({}));
      const deleteLink = getByText('Delete this admin user');
      fireEvent.click(deleteLink);

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete admin user');
      fireEvent.click(confirm);
      fixture.detectChanges();

      const userId = component.user.uid;
      expect(deleteAdminSpy).toHaveBeenCalledWith(userId);
    });

    it('should call getAdminUser once the admin user has been deleted', async () => {
      const { fixture, getByText, adminUsersService } = await setup();

      spyOn(adminUsersService, 'deleteAdminUserDetails').and.returnValue(of({}));
      const getAdminUsersSpy = spyOn(adminUsersService, 'getAdminUsers');

      const deleteLink = getByText('Delete this admin user');
      fireEvent.click(deleteLink);

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete admin user');
      fireEvent.click(confirm);
      fixture.detectChanges();

      expect(getAdminUsersSpy).toHaveBeenCalled();
    });

    fit('should navigate back to the admin users page when admin user has been deleted', async () => {
      console.log('log first line setup of test');
      const { component, fixture, getByText, adminUsersService, routerSpy } = await setup();
      console.log('log setup of test');

      spyOn(adminUsersService, 'deleteAdminUserDetails').withArgs(component.user.uid).and.returnValue(of({}));
      console.log('log after first spy');

      spyOn(adminUsersService, 'getAdminUsers').and.returnValue(of([{}] as UserDetails[]));

      console.log('log after second spy');

      const deleteLink = getByText('Delete this admin user');
      console.log('log after delete text');

      fireEvent.click(deleteLink);
      console.log('log after fire event');

      const dialog = await within(document.body).findByRole('dialog');
      console.log('log after dialog');

      const confirm = within(dialog).getByText('Delete admin user');
      console.log('log after confirm message of dialog');

      fireEvent.click(confirm);
      console.log('log after confirm fire e vent');

      fixture.detectChanges();
      console.log('log after detect change');

      expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin', 'users']);
      console.log('log after expect');
    });
  });
});
