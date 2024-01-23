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
import { render } from '@testing-library/angular';
import { throwError } from 'rxjs';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  async function setup(isAdmin = false, employerTypeSet = true, isAuthenticated = true) {
    const { fixture, getAllByText, getByText, queryByText, getByTestId } = await render(LoginComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        FeatureFlagsService,
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
    let authSpy;
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

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getAllByText,
      getByText,
      queryByText,
      getByTestId,
      spy,
      authSpy,
    };
  }

  it('should render a LoginComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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
  });
});
