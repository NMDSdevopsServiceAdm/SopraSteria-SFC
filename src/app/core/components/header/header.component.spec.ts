import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';

describe('HeaderComponent', () => {

  async function setup(isAdmin = true, subsidiaries = 0) {
    const component =  await render(HeaderComponent, {
      imports: [
        RouterTestingModule,
        HttpClientTestingModule],
      declarations: [HeaderComponent],
      providers: [
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient]
        }]
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    return {
      component,
      router
    };
  }

  it('should render a HeaderComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Back to admin link', () => {
    it('should display a Back to admin link if user is an admin', async () => {
      const { component } = await setup(true);

      component.getByText('Back to admin');
    });

    it('should not display a Back to admin link if user is not an admin', async () => {
      const { component } = await setup(false);

      expect(component.queryByText('Back to admin')).toBeNull();
    });
  });
});
