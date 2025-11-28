import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { UserAccountNotFoundComponent } from './user-account-not-found.component';

describe('UserAccountNotFoundComponent', () => {
  const setup = async () => {
    const setupTools = await render(UserAccountNotFoundComponent, {
      imports: [SharedModule, RouterModule],
      providers: [provideRouter([])],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a page heading', async () => {
    const { getByText } = await setup();

    const expectedHeadingText = 'We did not find your account';
    expect(getByText(expectedHeadingText)).toBeTruthy();
  });

  it('should show a message about contacting support team', async () => {
    const { getByText } = await setup();

    const expectedContent = [
      'Call the ASC-WDS Support Team on',
      '0113 241 0969',
      "We're available Monday to Friday, 9am to 5pm (not including bank holidays).",
    ];

    expectedContent.forEach((text) => {
      expect(getByText(text, { exact: false })).toBeTruthy();
    });
  });

  it('should show a "Back to sign in" button', async () => {
    const { getByText } = await setup();

    const backToSignin = getByText('Back to sign in');
    expect(backToSignin).toBeTruthy();
    expect(backToSignin.getAttribute('href')).toEqual('/login');
  });
});
