import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PasswordResetService } from '@core/services/password-reset.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ForgotYourPasswordConfirmationComponent } from './confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from './edit/edit.component';
import { ForgotYourPasswordComponent } from './forgot-your-password.component';

describe('ForgotYourPasswordComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourPasswordComponent, {
      imports: [FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
      declarations: [ForgotYourPasswordEditComponent, ForgotYourPasswordConfirmationComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const passwordResetService = injector.inject(PasswordResetService);
    const passwordResetSpy = spyOn(passwordResetService, 'requestPasswordReset').and.returnValue(of(null));

    return { ...setupTools, component, routerSpy, passwordResetSpy };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      expect(getByRole('heading', { name: 'Forgot password' })).toBeTruthy();
    });

    it('should show a textbox to input username or email address', async () => {
      const { getByRole } = await setup();

      expect(getByRole('textbox', { name: 'Username or email address' })).toBeTruthy();
    });

    it('should show a "Send password reset link" CTA button and a "Back to sign in" link', async () => {
      const { getByText, getByRole } = await setup();

      expect(getByRole('button', { name: 'Send password reset link' })).toBeTruthy();

      const backToSignIn = getByText('Back to sign in');
      expect(backToSignIn).toBeTruthy();
      expect(backToSignIn.getAttribute('href')).toEqual('/login');
    });
  });

  describe('form submit and validation', () => {
    describe('on submit', () => {
      it('should make a request from password reset service', async () => {
        const { getByRole, passwordResetSpy } = await setup();

        userEvent.type(getByRole('textbox'), 'test@example.com');
        userEvent.click(getByRole('button', { name: 'Send password reset link' }));

        expect(passwordResetSpy).toHaveBeenCalledWith('test@example.com');
      });

      describe('error', () => {
        it('should show an error message if no input for textbox', async () => {
          const { fixture, getByText, getByRole, getAllByText, passwordResetSpy } = await setup();

          userEvent.click(getByRole('button', { name: 'Send password reset link' }));
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();
          expect(getAllByText('Enter your username or ASC-WDS email address')).toHaveSize(2);

          expect(passwordResetSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('after form submit', async () => {
    it('should show a confirmation screen', async () => {
      const { fixture, getByRole, getByText, getByTestId } = await setup();

      userEvent.type(getByRole('textbox'), 'test@example.com');
      userEvent.click(getByRole('button', { name: 'Send password reset link' }));

      fixture.detectChanges();

      const expectedMessage =
        "If there's an ASC-WDS account for test@example.com you'll get an email soon, with a link to reset your password.";

      expect(getByRole('heading', { name: 'Password reset link sent' })).toBeTruthy();
      expect(getByTestId('confirmation-message').textContent).toContain(expectedMessage);
      expect(getByText('Back to sign in')).toBeTruthy();
    });
  });
});
