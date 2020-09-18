import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

describe('HeaderComponent', () => {
  async function setup(isAdmin = false, subsidiaries = 0, isLoggedIn: boolean = false) {
    const component = await render(HeaderComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [HeaderComponent],
      providers: [
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    return {
      component,
      router,
    };
  }

  it('should render a HeaderComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Back to admin link', () => {
    it('should display a Back to admin link if user is an admin and is logged in', async () => {
      const { component } = await setup(true, 0, true);

      component.getByText('Back to admin');
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
