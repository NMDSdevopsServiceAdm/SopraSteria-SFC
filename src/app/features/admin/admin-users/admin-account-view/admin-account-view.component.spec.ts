import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminAccountViewComponent } from './admin-account-view.component';

describe('UserAccountViewComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(AdminAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
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
    };
  }

  it('should render a AdminAccountViewComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  //TODO: update this test when link functionality is implemented
  it('should render a Resend the user email link', async () => {
    const { getByText } = await setup();

    expect(getByText('Resend the user set-up email')).toBeTruthy();
  });

  //TODO: update this test when link functionality is implemented
  it('should render a delte this user link', async () => {
    const { getByText } = await setup();

    expect(getByText('Delete this admin user')).toBeTruthy();
  });

  it('Should navigate to admin users summary page when view admin users button is clicked', async () => {
    const { getByText } = await setup();

    const button = getByText('View admin users');

    expect(button.getAttribute('href')).toBe('/sfcadmin/users');
  });
});
