import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';

describe('LoginComponent', () => {
  async function setup(isAdmin = false, employerTypeSet = true, isAuthenticated = true) {
    const setupTools = await render(LoginComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FeatureFlagsService,
        UntypedFormBuilder,
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin, employerTypeSet),
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const authService = injector.inject(AuthService) as AuthService;
    let authSpy: any;
    if (isAuthenticated) {
      authSpy = spyOn(authService, 'authenticate');
      authSpy.and.callThrough();
    } else {
      const mockErrorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: {},
      });

      const authService = TestBed.inject(AuthService);
      authSpy = spyOn(authService, 'authenticate').and.returnValue(throwError(mockErrorResponse));
    }

    const fixture = setupTools.fixture;
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      ...setupTools,
      spy,
      authSpy,
    };
  }

  it('should render a LoginComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('username', () => {
    it('should show the username hint', async () => {
      const { getByTestId } = await setup();

      const usernameHint = getByTestId('username-hint');
      const hintText = 'You cannot use an email address to sign in';

      expect(within(usernameHint).getByText(hintText)).toBeTruthy();
    });
  });

  describe('password', () => {
    it('should show the password as password field when show password is false', async () => {
      const { getByTestId } = await setup();

      const passwordInput = getByTestId('password');

      expect(passwordInput.getAttribute('type')).toEqual('password');
    });

    it('should show the password as text field when show password is true', async () => {
      const { fixture, getByTestId, getByText } = await setup();

      const showToggleText = 'Show password';

      fireEvent.click(getByText(showToggleText));
      fixture.detectChanges();

      const passwordInput = getByTestId('password');

      expect(passwordInput.getAttribute('type')).toEqual('text');
    });

    it("should initially show 'Show password' text for the password toggle", async () => {
      const { getByTestId } = await setup();

      const passwordToggle = getByTestId('password-toggle');
      const toggleText = 'Show password';

      expect(within(passwordToggle).getByText(toggleText)).toBeTruthy();
    });

    it("should show 'Hide password' text for the password toggle when 'Show password' is clicked", async () => {
      const { fixture, getByTestId, getByText } = await setup();

      const passwordToggle = getByTestId('password-toggle');
      const showToggleText = 'Show password';
      const hideToggleText = 'Hide password';

      fireEvent.click(getByText(showToggleText));
      fixture.detectChanges();

      expect(within(passwordToggle).getByText(hideToggleText)).toBeTruthy();
    });
  });

  it('should show the link to forgot username or password', async () => {
    const { getByTestId } = await setup();

    const forgotUsernamePasswordText = 'Forgot your username or password?';
    const forgotUsernamePasswordLink = getByTestId('forgot-username-password');

    expect(within(forgotUsernamePasswordLink).getByText(forgotUsernamePasswordText)).toBeTruthy();
    expect(forgotUsernamePasswordLink.getAttribute('href')).toEqual('/forgot-your-username-or-password');
  });

  it('should show the link to create an account', async () => {
    const { getByTestId } = await setup();

    const createAccountText = 'Create an account';
    const createAccountLink = getByTestId('create-account');

    expect(within(createAccountLink).getByText(createAccountText)).toBeTruthy();
    expect(createAccountLink.getAttribute('href')).toEqual('/registration/create-account');
  });

  it('should send you to dashboard on login as user', async () => {
    const { component, fixture, spy, authSpy } = await setup();

    component.form.markAsDirty();
    component.form.get('username').setValue('1');
    component.form.get('username').markAsDirty();
    component.form.get('password').setValue('1');
    component.form.get('password').markAsDirty();

    component.onSubmit();

    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(authSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should send you to sfcadmin on login as admin', async () => {
    const { component, fixture, spy, authSpy } = await setup(true);

    component.form.markAsDirty();
    component.form.get('username').setValue('1');
    component.form.get('username').markAsDirty();
    component.form.get('password').setValue('1');
    component.form.get('password').markAsDirty();

    component.onSubmit();

    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(authSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/sfcadmin']);
  });

  it('should send you to type-of-employer on login where employer type not set', async () => {
    const { component, fixture, spy, authSpy } = await setup(false, false);

    component.form.markAsDirty();
    component.form.get('username').setValue('1');
    component.form.get('username').markAsDirty();
    component.form.get('password').setValue('1');
    component.form.get('password').markAsDirty();

    component.onSubmit();

    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
    expect(authSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['workplace', `mockuid`, 'type-of-employer']);
  });

  describe('validation', async () => {
    it('should display enter your username message', async () => {
      const { component, fixture, getAllByText } = await setup(false, false, false);

      component.form.markAsDirty();
      component.form.get('password').setValue('1');
      component.form.get('password').markAsDirty();

      component.onSubmit();

      fixture.detectChanges();
      expect(getAllByText('Enter your username')).toBeTruthy();
    });

    it('should display enter your password message', async () => {
      const { component, fixture, getAllByText } = await setup(false, false, false);

      component.form.markAsDirty();
      component.form.get('username').setValue('1');
      component.form.get('username').markAsDirty();

      component.onSubmit();

      fixture.detectChanges();
      expect(getAllByText('Enter your password')).toBeTruthy();
    });

    it('should display invalid username/password message', async () => {
      const { component, fixture, getAllByText } = await setup(false, false, false);

      component.form.markAsDirty();
      component.form.get('username').setValue('1');
      component.form.get('username').markAsDirty();
      component.form.get('password').setValue('1');
      component.form.get('password').markAsDirty();

      component.onSubmit();

      fixture.detectChanges();
      expect(getAllByText('Your username or your password is incorrect')).toBeTruthy();
    });

    it('should not let you sign in with a username with special characters', async () => {
      const { component, fixture, getAllByText, getByTestId } = await setup();

      const signInButton = within(getByTestId('signinButton')).getByText('Sign in');
      const form = component.form;

      component.form.markAsDirty();
      form.controls['username'].setValue('username@123.com');
      form.controls['username'].markAsDirty();
      component.form.get('password').setValue('1');
      component.form.get('password').markAsDirty();

      fireEvent.click(signInButton);
      fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(
        getAllByText("You've entered an @ symbol (remember, your username cannot be an email address)").length,
      ).toBe(2);
    });
  });
});
