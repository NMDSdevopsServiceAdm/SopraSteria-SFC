import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ForgotYourUsernameOrPasswordComponent } from './forgot-your-username-or-password.component';

describe('ForgotYourUsernameOrPasswordComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourUsernameOrPasswordComponent, {
      imports: [FormsModule, ReactiveFormsModule, SharedModule, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
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

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      expect(getByRole('heading', { name: 'Forgot your username or password?' })).toBeTruthy();
    });

    it('should show radio buttons to choose from Username or Password', async () => {
      const { getByRole } = await setup();

      expect(getByRole('radio', { name: 'Username' })).toBeTruthy();
      expect(getByRole('radio', { name: 'Password' })).toBeTruthy();
    });

    it('it should show an reveal text of "Forgot both?"', async () => {
      const { getByTestId, getByText } = await setup();

      const revealTextElement = getByTestId('reveal-text');
      const hiddenText =
        'Request a link to reset your password and then come back here to find your username. ' +
        'Alternatively, call the ASC-WDS Support Team on 0113 241 0969 for help.';

      expect(revealTextElement).toBeTruthy();
      expect(within(revealTextElement).getByText('Forgot both?')).toBeTruthy();
      expect(revealTextElement.textContent).toContain(hiddenText);

      const linkToResetPassword = getByText('Request a link to reset your password');
      expect(linkToResetPassword.getAttribute('href')).toEqual('/forgot-your-password');
    });

    it('should show a "Continue" CTA button and a "Back to sign in" link', async () => {
      const { getByText, getByRole } = await setup();

      expect(getByRole('button', { name: 'Continue' })).toBeTruthy();

      const backToSignIn = getByText('Back to sign in');
      expect(backToSignIn).toBeTruthy();
      expect(backToSignIn.getAttribute('href')).toEqual('/login');
    });
  });

  describe('form submit and validation', () => {
    describe('on submit', () => {
      it('should nagivate to forgot-your-username page if username was selected', async () => {
        const { getByRole, routerSpy } = await setup();

        userEvent.click(getByRole('radio', { name: 'Username' }));
        userEvent.click(getByRole('button', { name: 'Continue' }));

        expect(routerSpy).toHaveBeenCalledWith(['/forgot-your-username']);
      });

      it('should nagivate to forgot-your-password page if password was selected', async () => {
        const { getByRole, routerSpy } = await setup();

        userEvent.click(getByRole('radio', { name: 'Password' }));
        userEvent.click(getByRole('button', { name: 'Continue' }));

        expect(routerSpy).toHaveBeenCalledWith(['/forgot-your-password']);
      });

      describe('error', () => {
        it('should show an error message if neither of radio buttons were selected', async () => {
          const { fixture, getByText, getByRole, getAllByText, routerSpy } = await setup();

          userEvent.click(getByRole('button', { name: 'Continue' }));
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();
          expect(getAllByText('Select username or password')).toHaveSize(2);

          expect(routerSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
