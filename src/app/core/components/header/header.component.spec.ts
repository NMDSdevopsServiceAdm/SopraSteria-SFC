import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { EditUser, MockUserService } from '@core/test-utils/MockUserService';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  async function setup(isAdmin = false, subsidiaries = 0, isLoggedIn: boolean = false) {
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const component = await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [HeaderComponent],
      providers: [
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const userService = injector.inject(UserService) as UserService;

    return {
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
      const { component } = await setup(false, 0, true);

      expect(component.getByText('John')).toBeTruthy();
    });

    it('should render my name link with the correct href', async () => {
      const { component } = await setup(false, 0, true);
      const nameLink = component.getByText('John');

      expect(nameLink.getAttribute('href')).toEqual('/account-management');
    });

    it('should show a users link when logged in and on a workplace', async () => {
      const { component } = await setup(false, 0, true);

      component.fixture.componentInstance.ngOnInit();
      component.fixture.detectChanges();

      expect(component.getByText('Users')).toBeTruthy();
    });

    it('should render users link with the correct href when on a workplace', async () => {
      const { component } = await setup(false, 0, true);

      component.fixture.componentInstance.ngOnInit();
      component.fixture.detectChanges();

      const workplaceId = component.fixture.componentInstance.workplaceId;
      const usersLink = component.getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
    });

    it('should render users link with the correct href and a notification flag when on a workplace and only one user is registered', async () => {
      const { component } = await setup(false, 0, true);

      const workplaceId = component.fixture.componentInstance.workplaceId;
      const usersLink = component.getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
      expect(component.getByTestId('singleUserNotification')).toBeTruthy();
    });

    it('should render users link with the correct href and no notification flag when on a workplace and more than one user is registered', async () => {
      const { component, userService } = await setup(false, 0, true);

      spyOn(userService, 'getAllUsersForEstablishment').and.returnValue(of([EditUser(), EditUser()] as UserDetails[]));
      component.fixture.componentInstance.getUsers();
      component.fixture.detectChanges();

      const workplaceId = component.fixture.componentInstance.workplaceId;
      const usersLink = component.getByText('Users');

      expect(usersLink.getAttribute('href')).toEqual(`/workplace/${workplaceId}/users`);
      expect(component.queryByTestId('singleUserNotification')).toBeFalsy();
    });

    it('should not show a users link when logged in and on the admin pages', async () => {
      const { component } = await setup(true, 0, true);

      component.fixture.componentInstance.isOnAdminScreen = true;
      component.fixture.detectChanges();

      expect(component.queryByText('Users')).toBeFalsy();
    });
  });

  describe('Back to admin link', () => {
    it('should display a Back to admin link if user is an admin and is logged in', async () => {
      const { component } = await setup(true, 0, true);

      const adminText = component.getByText('Back to admin');
      expect(adminText).toBeTruthy();
    });

    it('admin link should go to the admin area if user is an admin and is logged in', async () => {
      const { component } = await setup(true, 0, true);

      const adminText = component.getByText('Back to admin');
      expect(adminText.getAttribute('href')).toEqual('/sfcadmin');
    });

    it('should not display a Back to admin link if user is logged in but not an admin', async () => {
      const { component } = await setup(false, 0, true);

      expect(component.queryByText('Back to admin')).toBeNull();
    });

    it('should not display a Back to admin link if user is not logged in', async () => {
      const { component } = await setup(true, 0, false);

      expect(component.queryByText('Back to admin')).toBeNull();
    });
  });
});
