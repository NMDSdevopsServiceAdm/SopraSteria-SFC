import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { mockAuthenticateResponse, MockAuthService } from '@core/test-utils/MockAuthService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';

fdescribe('LoginComponent', () => {
  async function setup(overrides = {}) {
    const isAdmin: boolean = ('isAdmin' in overrides ? overrides.isAdmin : false) as boolean;
    const employerTypeSet: boolean = ('employerTypeSet' in overrides ? overrides.employerTypeSet : true) as boolean;

    const setupTools = await render(LoginComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin, employerTypeSet),
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    const authService = injector.inject(AuthService) as AuthService;
    const authSpy = spyOn(authService, 'authenticate').and.callThrough();

    const fixture = setupTools.fixture;
    const component = fixture.componentInstance;

    return {
      ...setupTools,
      component,
      fixture,
      routerSpy,
      navigateByUrlSpy,
      authService,
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
    it('should set the password as password field (to hide input) on page load', async () => {
      const { getByTestId } = await setup();

      const passwordInput = getByTestId('password');

      expect(passwordInput.getAttribute('type')).toEqual('password');
    });

    it("should show the password as text field after user clicks 'Show password'", async () => {
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

  describe('Navigation on successful login', () => {
    const signIn = (getByLabelText, getByRole, fixture) => {
      userEvent.type(getByLabelText('Username'), '1');
      userEvent.type(getByLabelText('Password'), '1');

      userEvent.click(getByRole('button', { name: 'Sign in' }));
      fixture.detectChanges();
    };

    it('should navigate to dashboard when non-admin user with no outstanding on login actions', async () => {
      const { fixture, routerSpy, authSpy, getByLabelText, getByRole } = await setup();

      signIn(getByLabelText, getByRole, fixture);

      expect(authSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to redirectLocation when recently logged out user with data stored in authService', async () => {
      const { fixture, navigateByUrlSpy, authService, getByLabelText, getByRole } = await setup();

      const mockUrlToNavigateTo = '/mockUrl';

      spyOn(authService, 'isPreviousUser').and.returnValue(true);
      spyOnProperty(authService, 'redirectLocation').and.returnValue(mockUrlToNavigateTo);

      signIn(getByLabelText, getByRole, fixture);

      expect(navigateByUrlSpy).toHaveBeenCalledWith(mockUrlToNavigateTo);
    });

    it('should navigate to sfcadmin when user is admin', async () => {
      const { fixture, routerSpy, authSpy, getByLabelText, getByRole } = await setup({ isAdmin: true });

      signIn(getByLabelText, getByRole, fixture);

      expect(authSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin']);
    });

    it('should navigate to type-of-employer when employer type not set for non-admin user', async () => {
      const { fixture, routerSpy, getByLabelText, getByRole } = await setup({ employerTypeSet: false });

      signIn(getByLabelText, getByRole, fixture);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        `mockuid`,
        'workplace-data',
        'workplace-summary',
        'type-of-employer',
      ]);
    });

    it('should navigate to migrated-user-terms-and-conditions when auth response has migratedUserFirstLogon as true', async () => {
      const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup({ employerTypeSet: false });
      const authenticateResponse = mockAuthenticateResponse();
      authenticateResponse.body.migratedUserFirstLogon = true;

      authSpy.and.returnValue(of(authenticateResponse));

      signIn(getByLabelText, getByRole, fixture);

      expect(routerSpy).toHaveBeenCalledWith(['/migrated-user-terms-and-conditions']);
    });

    it('should navigate to registration-survey when auth response has registrationSurveyCompleted as false', async () => {
      const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup({ employerTypeSet: false });
      const authenticateResponse = mockAuthenticateResponse();
      authenticateResponse.body.registrationSurveyCompleted = false;

      authSpy.and.returnValue(of(authenticateResponse));

      signIn(getByLabelText, getByRole, fixture);

      expect(routerSpy).toHaveBeenCalledWith(['/registration-survey']);
    });

    describe('update-your-vacancies-and-turnover-data', () => {
      it('should navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is null and edit user where workplace is data owner', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup({ employerTypeSet: false });
        const authenticateResponse = mockAuthenticateResponse();
        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = null;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).toHaveBeenCalledWith(['/update-your-vacancies-and-turnover-data']);
      });

      it('should navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is over six months ago and edit user where workplace is data owner', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup();
        const authenticateResponse = mockAuthenticateResponse();

        const currentDate = new Date();
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(currentDate.getMonth() - 7);

        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = sevenMonthsAgo.toISOString();
        authenticateResponse.body.role = Roles.Edit;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).toHaveBeenCalledWith(['/update-your-vacancies-and-turnover-data']);
      });

      it('should not navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is null but user is read only', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup();
        const authenticateResponse = mockAuthenticateResponse();
        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = null;
        authenticateResponse.body.role = Roles.Read;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
      });

      it('should not navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is null but workplace is not data owner', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup();
        const authenticateResponse = mockAuthenticateResponse();
        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = null;
        authenticateResponse.body.establishment.dataOwner = WorkplaceDataOwner.Parent;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
      });

      it('should not navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is under six months ago', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup();
        const authenticateResponse = mockAuthenticateResponse();

        const currentDate = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = threeMonthsAgo;
        authenticateResponse.body.role = Roles.Edit;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
      });

      it('should not navigate to update-your-vacancies-and-turnover-data when lastViewedVacanciesAndTurnoverMessage is null but there is login action with higher priority (registration survey)', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup();
        const authenticateResponse = mockAuthenticateResponse();

        authenticateResponse.body.lastViewedVacanciesAndTurnoverMessage = null;
        authenticateResponse.body.role = Roles.Edit;
        authenticateResponse.body.registrationSurveyCompleted = false;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).not.toHaveBeenCalledWith(['/update-your-vacancies-and-turnover-data']);
        expect(routerSpy).toHaveBeenCalledWith(['/registration-survey']);
      });
    });

    describe('new-training-courses', () => {
      [undefined, null, 0, 1, 2].forEach((login) => {
        it(`should navigate to new-training-courses when auth response has ${login} for loginAmount`, async () => {
          const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup({ employerTypeSet: false });
          const authenticateResponse = mockAuthenticateResponse();
          authenticateResponse.body.trainingCoursesMessageViewedQuantity = login;

          authSpy.and.returnValue(of(authenticateResponse));

          signIn(getByLabelText, getByRole, fixture);

          expect(routerSpy).toHaveBeenCalledWith(['/new-training-courses']);
        });
      });

      it('should not navigate to new-training-courses', async () => {
        const { fixture, routerSpy, getByLabelText, getByRole, authSpy } = await setup({ employerTypeSet: false });
        const authenticateResponse = mockAuthenticateResponse();
        authenticateResponse.body.trainingCoursesMessageViewedQuantity = 3;

        authSpy.and.returnValue(of(authenticateResponse));

        signIn(getByLabelText, getByRole, fixture);

        expect(routerSpy).not.toHaveBeenCalledWith(['/whats-new-in-asc-wds']);
      });
    });
  });

  describe('validation', async () => {
    it('should display enter your username message', async () => {
      const { fixture, getAllByText, getByRole, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Password'), '1');

      userEvent.click(getByRole('button', { name: 'Sign in' }));

      fixture.detectChanges();
      expect(getAllByText('Enter your username')).toBeTruthy();
    });

    it('should display enter your password message', async () => {
      const { fixture, getAllByText, getByRole, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Username'), '1');

      userEvent.click(getByRole('button', { name: 'Sign in' }));

      fixture.detectChanges();
      expect(getAllByText('Enter your password')).toBeTruthy();
    });

    const unauthorizedError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: {},
    });

    it('should display invalid username/password message', async () => {
      const { fixture, getAllByText, authSpy, getByLabelText, getByRole } = await setup();

      authSpy.and.returnValue(throwError(unauthorizedError));

      userEvent.type(getByLabelText('Username'), '1');
      userEvent.type(getByLabelText('Password'), '1');

      userEvent.click(getByRole('button', { name: 'Sign in' }));

      fixture.detectChanges();
      expect(getAllByText('Your username or your password is incorrect')).toBeTruthy();
    });

    it('should focus on the first input box when the invalid username/password message is clicked', async () => {
      const { component, fixture, getAllByText, getByRole, authSpy } = await setup();

      authSpy.and.returnValue(throwError(unauthorizedError));

      component.form.setValue({ username: '1', password: '1' });
      component.onSubmit();

      fixture.detectChanges();
      const errorMessageInSummaryBox = getAllByText('Your username or your password is incorrect')[0];
      const usernameInputBoxEl = getByRole('textbox', { name: 'Username' });
      const focusSpy = spyOn(usernameInputBoxEl, 'focus');

      userEvent.click(errorMessageInSummaryBox);
      await fixture.whenStable();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should not let you sign in with a username with special characters', async () => {
      const { fixture, getAllByText, getByRole, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Username'), 'username@123.com');
      userEvent.type(getByLabelText('Password'), '1');

      userEvent.click(getByRole('button', { name: 'Sign in' }));
      fixture.detectChanges();

      expect(
        getAllByText("You've entered an @ symbol (remember, your username cannot be an email address)").length,
      ).toBe(2);
    });
  });
});
