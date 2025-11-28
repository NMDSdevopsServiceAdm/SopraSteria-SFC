import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { EditUser, MockUserService } from '@core/test-utils/MockUserService';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  async function setup(overrides: any = {}) {
    const isAdmin = overrides.isAdmin ?? false;
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const isLoggedIn = overrides.isLoggedIn ?? false;
    const showNotificationsLink = overrides.showNotificationsLink ?? true;

    const setupTools = await render(HeaderComponent, {
      imports: [RouterModule],
      declarations: [HeaderComponent],
      providers: [
        {
          provide: UserService,
          useFactory: MockUserService.factory(overrides.subsidiaries ?? 0, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: NotificationsService,
          useClass: MockNotificationsService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        showNotificationsLink,
      },
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const userService = injector.inject(UserService) as UserService;

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      router,
      userService,
    };
  }

  it('should render a HeaderComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('My account link', () => {
    it('should show my name when logged in', async () => {
      const { getByText } = await setup({ isLoggedIn: true });

      expect(getByText('John')).toBeTruthy();
    });

    it('should render my name link with the correct href', async () => {
      const { getByText } = await setup({ isLoggedIn: true });
      const nameLink = getByText('John');

      expect(nameLink.getAttribute('href')).toEqual('/account-management');
    });
  });

  describe('Back to admin link', () => {
    it('should display a Back to admin link if user is an admin and is logged in', async () => {
      const { getByText } = await setup({ isLoggedIn: true, isAdmin: true });

      expect(getByText('Back to admin')).toBeTruthy();
    });

    it('admin link should go to the admin area if user is an admin and is logged in', async () => {
      const { getByText } = await setup({ isLoggedIn: true, isAdmin: true });

      const adminText = getByText('Back to admin');
      expect(adminText.getAttribute('href')).toEqual('/sfcadmin');
    });

    it('should not display a Back to admin link if user is logged in but not an admin', async () => {
      const { queryByText } = await setup({ isLoggedIn: true });

      expect(queryByText('Back to admin')).toBeNull();
    });

    it('should not display a Back to admin link if user is not logged in', async () => {
      const { queryByText } = await setup({ isLoggedIn: false, isAdmin: true });

      expect(queryByText('Back to admin')).toBeNull();
    });
  });

  describe('Users link', () => {
    it('should show a users link when logged in and on a workplace', async () => {
      const { getByText } = await setup({ isLoggedIn: true });

      expect(getByText('Users')).toBeTruthy();
    });

    it('should render users link with the correct href when on a workplace', async () => {
      const { component, getByText } = await setup({ isLoggedIn: true });

      const workplaceId = component.workplaceId;
      const usersLink = getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
    });

    it('should render users link with the correct href and a notification flag when on a workplace and only one user is registered', async () => {
      const { component, getByText, getByTestId } = await setup({ isLoggedIn: true });

      const workplaceId = component.workplaceId;
      const usersLink = getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
      expect(getByTestId('singleUserNotification')).toBeTruthy();
    });

    it('should render users link with the correct href and no notification flag when on a workplace and more than one user is registered', async () => {
      const { component, fixture, getByText, queryByTestId, userService } = await setup({ isLoggedIn: true });

      spyOn(userService, 'getAllUsersForEstablishment').and.returnValue(of([EditUser(), EditUser()] as UserDetails[]));
      component.getUsers();
      fixture.detectChanges();

      const workplaceId = component.workplaceId;
      const usersLink = getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
      expect(queryByTestId('singleUserNotification')).toBeFalsy();
    });

    it('should not show a users link when logged in and on the admin pages', async () => {
      const { component, fixture, queryByText } = await setup({ isLoggedIn: true, isAdmin: true });

      component.isOnAdminScreen = true;
      fixture.detectChanges();

      expect(queryByText('Users')).toBeFalsy();
    });

    it('should not show a users link when logged in and there is no workplace id', async () => {
      const { component, fixture, queryByText } = await setup({ isLoggedIn: true, isAdmin: true });

      component.workplaceId = '';
      fixture.detectChanges();

      expect(queryByText('Users')).toBeFalsy();
    });
  });

  describe('notifications link', () => {
    it('should not show the notifications link when logged in, in a stand alone account but not on admin screen', async () => {
      const { component, fixture, queryByText } = await setup({ isLoggedIn: true });

      component.isOnAdminScreen = true;
      fixture.detectChanges();

      expect(queryByText('Notifications')).toBeFalsy();
    });

    it('should show the new notifications flag if there are new notifications', async () => {
      const { component, fixture, getByTestId } = await setup({ isLoggedIn: true });

      spyOnProperty(component, 'numberOfNewNotifications', 'get').and.returnValue(1);
      fixture.detectChanges();

      expect(getByTestId('new-notifications')).toBeTruthy();
    });

    it('should not show the new notifications flag if there are no new notifications', async () => {
      const { component, fixture, queryByTestId } = await setup({ isLoggedIn: true });

      spyOnProperty(component, 'numberOfNewNotifications', 'get').and.returnValue(0);
      fixture.detectChanges();

      expect(queryByTestId('new-notifications')).toBeFalsy();
    });
  });
});
