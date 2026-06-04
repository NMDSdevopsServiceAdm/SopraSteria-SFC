import { getTestBed } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { AccountManagementModule } from '../account-management.module';
import { PasswordResetService } from '@core/services/password-reset.service';
import { of, throwError } from 'rxjs';

fdescribe('PasswordSavedConfirmationComponent', () => {
  async function setup() {
    const setupTools = await render(ChangePasswordComponent, {
      imports: [SharedModule, RouterModule, AccountManagementModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true),
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const component = setupTools.fixture.componentInstance;

    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const passwordResetService = injector.inject(PasswordResetService);

    const authService = injector.inject(AuthService);
    const logoutSpy = spyOn(authService, 'logoutAndNavigateToPage');

    return {
      ...setupTools,
      component,
      routerSpy,
      passwordResetService,
      logoutSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should log the user out and redirect to confirmation page on success', async () => {
    const { fixture, getByLabelText, getByText, passwordResetService, logoutSpy } = await setup();

    const changePasswordSpy = spyOn(passwordResetService, 'changePassword').and.returnValue(of(null));

    userEvent.type(getByLabelText('Old password'), 'fakeOldPassword1234!');
    userEvent.type(getByLabelText('New password'), 'fakeNewPassword1234!');
    userEvent.type(getByLabelText('Confirm new password'), 'fakeNewPassword1234!');

    userEvent.click(getByText('Save and return'));

    expect(changePasswordSpy).toHaveBeenCalled();

    await fixture.whenStable();

    expect(logoutSpy).toHaveBeenCalledWith(['/password-saved']);
  });

  it('should not log the user out if password change request failed', async () => {
    const { fixture, getByLabelText, getByText, passwordResetService, logoutSpy } = await setup();

    const changePasswordSpy = spyOn(passwordResetService, 'changePassword').and.returnValue(throwError('some error'));

    userEvent.type(getByLabelText('Old password'), 'fakeOldPassword1234!');
    userEvent.type(getByLabelText('New password'), 'fakeNewPassword1234!');
    userEvent.type(getByLabelText('Confirm new password'), 'fakeNewPassword1234!');

    userEvent.click(getByText('Save and return'));

    expect(changePasswordSpy).toHaveBeenCalled();

    await fixture.whenStable();

    expect(logoutSpy).not.toHaveBeenCalled();
  });
});
